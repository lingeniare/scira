import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscription, payment, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { invalidateUserCaches } from '@/lib/performance-cache';
import crypto from 'crypto';

// Типы для CloudPayments webhook
interface CloudPaymentsWebhookData {
  TransactionId: number;
  Amount: number;
  Currency: string;
  DateTime: string;
  CardFirstSix: string;
  CardLastFour: string;
  CardType: string;
  CardExpDate: string;
  TestMode: number;
  Status: string;
  OperationType: string;
  InvoiceId?: string;
  AccountId: string;
  SubscriptionId?: string;
  Name?: string;
  Email?: string;
  Data?: any;
  Token?: string;
  TotalFee?: number;
  Reason?: string;
  ReasonCode?: number;
}

// Проверка подписи webhook
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.CLOUDPAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    console.error('CloudPayments webhook secret not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');

  return signature === expectedSignature;
}

// Обработка успешного платежа
async function handleSuccessfulPayment(data: CloudPaymentsWebhookData) {
  console.log('🎉 Processing successful payment:', data.TransactionId);

  try {
    // Найти пользователя по email или AccountId
    let userId = data.AccountId;
    
    if (data.Email) {
      const userByEmail = await db.query.user.findFirst({
        where: eq(user.email, data.Email),
        columns: { id: true },
      });
      if (userByEmail) {
        userId = userByEmail.id;
      }
    }

    if (!userId) {
      console.error('User not found for payment:', data.TransactionId);
      return;
    }

    // Создать или обновить запись о платеже
    await db.insert(payment).values({
      id: data.TransactionId.toString(),
      createdAt: new Date(data.DateTime),
      updatedAt: new Date(),
      currency: data.Currency,
      status: 'succeeded',
      totalAmount: Math.round(data.Amount * 100), // Конвертируем в копейки
      paymentMethod: 'card',
      paymentMethodType: data.CardType,
      cardLastFour: data.CardLastFour,
      userId: userId,
      metadata: {
        transactionId: data.TransactionId,
        cardFirstSix: data.CardFirstSix,
        cardExpDate: data.CardExpDate,
        testMode: data.TestMode === 1,
        token: data.Token,
        totalFee: data.TotalFee,
      },
    }).onConflictDoUpdate({
      target: payment.id,
      set: {
        status: 'succeeded',
        updatedAt: new Date(),
        metadata: {
          transactionId: data.TransactionId,
          cardFirstSix: data.CardFirstSix,
          cardExpDate: data.CardExpDate,
          testMode: data.TestMode === 1,
          token: data.Token,
          totalFee: data.TotalFee,
        },
      },
    });

    // Если это рекуррентный платеж, обновить подписку
    if (data.SubscriptionId) {
      const now = new Date();
      const nextPeriodEnd = new Date(now);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

      await db.insert(subscription).values({
        id: data.SubscriptionId,
        createdAt: now,
        amount: Math.round(data.Amount * 100),
        currency: data.Currency,
        recurringInterval: 'month',
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: nextPeriodEnd,
        cancelAtPeriodEnd: false,
        startedAt: now,
        customerId: userId,
        productId: 'cloudpayments_pro',
        checkoutId: data.TransactionId.toString(),
        userId: userId,
        metadata: JSON.stringify({
          token: data.Token,
          originalTransactionId: data.TransactionId,
        }),
      }).onConflictDoUpdate({
        target: subscription.id,
        set: {
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriodEnd,
          modifiedAt: now,
        },
      });
    }

    // Инвалидировать кэш пользователя
    invalidateUserCaches(userId);
    console.log('✅ Payment processed successfully:', data.TransactionId);
  } catch (error) {
    console.error('💥 Error processing successful payment:', error);
    throw error;
  }
}

// Обработка неуспешного платежа
async function handleFailedPayment(data: CloudPaymentsWebhookData) {
  console.log('❌ Processing failed payment:', data.TransactionId);

  try {
    let userId = data.AccountId;
    
    if (data.Email) {
      const userByEmail = await db.query.user.findFirst({
        where: eq(user.email, data.Email),
        columns: { id: true },
      });
      if (userByEmail) {
        userId = userByEmail.id;
      }
    }

    if (!userId) {
      console.error('User not found for failed payment:', data.TransactionId);
      return;
    }

    // Записать неуспешный платеж
    await db.insert(payment).values({
      id: data.TransactionId.toString(),
      createdAt: new Date(data.DateTime),
      updatedAt: new Date(),
      currency: data.Currency,
      status: 'failed',
      totalAmount: Math.round(data.Amount * 100),
      paymentMethod: 'card',
      userId: userId,
      errorCode: data.ReasonCode?.toString(),
      errorMessage: data.Reason,
      metadata: {
        transactionId: data.TransactionId,
        testMode: data.TestMode === 1,
        reasonCode: data.ReasonCode,
        reason: data.Reason,
      },
    }).onConflictDoUpdate({
      target: payment.id,
      set: {
        status: 'failed',
        updatedAt: new Date(),
        errorCode: data.ReasonCode?.toString(),
        errorMessage: data.Reason,
      },
    });

    // Инвалидировать кэш пользователя
    invalidateUserCaches(userId);
    console.log('✅ Failed payment recorded:', data.TransactionId);
  } catch (error) {
    console.error('💥 Error processing failed payment:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('X-CP-Signature') || '';

    // Проверить подпись webhook
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data: CloudPaymentsWebhookData = JSON.parse(body);
    console.log('🔔 CloudPayments webhook received:', data.OperationType, data.Status);

    // Обработать различные типы уведомлений
    switch (data.Status) {
      case 'Completed':
        await handleSuccessfulPayment(data);
        break;
      case 'Declined':
      case 'Cancelled':
        await handleFailedPayment(data);
        break;
      default:
        console.log('Unhandled payment status:', data.Status);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CloudPayments webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Обработка GET запросов (для проверки endpoint)
export async function GET() {
  return NextResponse.json({ message: 'CloudPayments webhook endpoint' });
}