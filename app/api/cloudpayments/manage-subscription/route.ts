import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { subscription } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { invalidateUserCaches } from '@/lib/performance-cache';

// Типы для управления подписками CloudPayments
interface CloudPaymentsManageResponse {
  Success: boolean;
  Message?: string;
  Model?: any;
}

// Функция для отправки запросов к CloudPayments API
async function callCloudPaymentsAPI(
  endpoint: string,
  data: any
): Promise<CloudPaymentsManageResponse> {
  const publicId = process.env.CLOUDPAYMENTS_PUBLIC_ID;
  const apiSecret = process.env.CLOUDPAYMENTS_API_SECRET;

  if (!publicId || !apiSecret) {
    throw new Error('CloudPayments credentials not configured');
  }

  const auth = Buffer.from(`${publicId}:${apiSecret}`).toString('base64');

  const response = await fetch(`https://api.cloudpayments.ru${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`CloudPayments API error: ${response.status}`);
  }

  return await response.json();
}

// Функция для отмены подписки
async function cancelSubscription(subscriptionId: string): Promise<CloudPaymentsManageResponse> {
  return await callCloudPaymentsAPI('/subscriptions/cancel', {
    Id: subscriptionId,
  });
}

// Функция для заморозки подписки
async function pauseSubscription(
  subscriptionId: string,
  pauseUntil: string
): Promise<CloudPaymentsManageResponse> {
  return await callCloudPaymentsAPI('/subscriptions/update', {
    Id: subscriptionId,
    StartDate: pauseUntil, // Дата возобновления
  });
}

// Функция для возобновления подписки
async function resumeSubscription(subscriptionId: string): Promise<CloudPaymentsManageResponse> {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  return await callCloudPaymentsAPI('/subscriptions/update', {
    Id: subscriptionId,
    StartDate: nextMonth.toISOString().split('T')[0], // Возобновить со следующего месяца
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, subscriptionId, pauseDuration } = body;

    if (!action || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Найти подписку пользователя
    const userSubscription = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, session.user.id),
          eq(subscription.cloudpaymentsSubscriptionId, subscriptionId)
        )
      )
      .limit(1);

    if (userSubscription.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const currentSubscription = userSubscription[0];
    let result: CloudPaymentsManageResponse;
    let newStatus: string;
    let newCurrentPeriodEnd: Date | null = null;

    switch (action) {
      case 'cancel':
        // Отменить подписку начиная со следующего периода
        result = await cancelSubscription(subscriptionId);
        newStatus = 'canceled';
        
        // Подписка остается активной до конца текущего периода
        newCurrentPeriodEnd = currentSubscription.currentPeriodEnd;
        break;

      case 'pause':
        // Заморозить подписку на указанный период (максимум 2 месяца)
        if (!pauseDuration || pauseDuration > 2) {
          return NextResponse.json(
            { error: 'Invalid pause duration. Maximum 2 months allowed.' },
            { status: 400 }
          );
        }

        const pauseUntilDate = new Date();
        pauseUntilDate.setMonth(pauseUntilDate.getMonth() + pauseDuration);
        
        result = await pauseSubscription(
          subscriptionId,
          pauseUntilDate.toISOString().split('T')[0]
        );
        newStatus = 'paused';
        newCurrentPeriodEnd = pauseUntilDate;
        break;

      case 'resume':
        // Возобновить подписку
        result = await resumeSubscription(subscriptionId);
        newStatus = 'active';
        
        // Установить новую дату окончания периода
        const resumeDate = new Date();
        resumeDate.setMonth(resumeDate.getMonth() + 1);
        newCurrentPeriodEnd = resumeDate;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.Success) {
      return NextResponse.json(
        { error: result.Message || 'Failed to manage subscription' },
        { status: 400 }
      );
    }

    // Обновить статус подписки в базе данных
    await db
      .update(subscription)
      .set({
        status: newStatus,
        currentPeriodEnd: newCurrentPeriodEnd,
        cancelAtPeriodEnd: action === 'cancel',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(subscription.userId, session.user.id),
          eq(subscription.cloudpaymentsSubscriptionId, subscriptionId)
        )
      );

    // Инвалидировать кэш пользователя
    await invalidateUserCaches(session.user.id);

    console.log(`Subscription ${action} successful:`, {
      userId: session.user.id,
      subscriptionId,
      newStatus,
      action,
    });

    return NextResponse.json({
      success: true,
      message: `Subscription ${action} successful`,
      subscription: {
        id: subscriptionId,
        status: newStatus,
        currentPeriodEnd: newCurrentPeriodEnd,
        cancelAtPeriodEnd: action === 'cancel',
      },
    });
  } catch (error) {
    console.error('Manage subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint для получения информации о подписке
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получить все подписки пользователя
    const userSubscriptions = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, session.user.id));

    return NextResponse.json({
      subscriptions: userSubscriptions.map(sub => ({
        id: sub.id,
        cloudpaymentsSubscriptionId: sub.cloudpaymentsSubscriptionId,
        status: sub.status,
        amount: sub.amount,
        currency: sub.currency,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        productId: sub.productId,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}