import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Типы для CloudPayments API
interface CreateSubscriptionRequest {
  amount: number; // Сумма в рублях
  currency: string; // Валюта (RUB)
  interval: 'Month' | 'Week' | 'Day'; // Интервал списания
  period: number; // Период (1 = каждый месяц)
  maxPeriods?: number; // Максимальное количество платежей (12 для годовой подписки)
  startDate?: string; // Дата начала подписки
  description: string; // Описание подписки
  requireConfirmation?: boolean; // Требовать подтверждение 3DS
}

interface CloudPaymentsSubscriptionResponse {
  Success: boolean;
  Message?: string;
  Model?: {
    Id: string;
    AccountId: string;
    Description: string;
    Email: string;
    Amount: number;
    Currency: string;
    RequireConfirmation: boolean;
    StartDate: string;
    Interval: string;
    Period: number;
    MaxPeriods?: number;
    Status: string;
    StatusCode: number;
    SuccessfulTransactionsNumber: number;
    FailedTransactionsNumber: number;
    LastTransactionDate?: string;
    NextTransactionDate?: string;
  };
}

// Функция для создания подписки в CloudPayments
async function createCloudPaymentsSubscription(
  userId: string,
  email: string,
  subscriptionData: CreateSubscriptionRequest
): Promise<CloudPaymentsSubscriptionResponse> {
  const publicId = process.env.CLOUDPAYMENTS_PUBLIC_ID;
  const apiSecret = process.env.CLOUDPAYMENTS_API_SECRET;

  if (!publicId || !apiSecret) {
    throw new Error('CloudPayments credentials not configured');
  }

  const requestData = {
    AccountId: userId,
    Email: email,
    Amount: subscriptionData.amount,
    Currency: subscriptionData.currency,
    Description: subscriptionData.description,
    Interval: subscriptionData.interval,
    Period: subscriptionData.period,
    MaxPeriods: subscriptionData.maxPeriods,
    StartDate: subscriptionData.startDate,
    RequireConfirmation: subscriptionData.requireConfirmation || false,
  };

  const auth = Buffer.from(`${publicId}:${apiSecret}`).toString('base64');

  const response = await fetch('https://api.cloudpayments.ru/subscriptions/create', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error(`CloudPayments API error: ${response.status}`);
  }

  return await response.json();
}

// Функция для получения токена для виджета
function generateWidgetToken(
  userId: string,
  amount: number,
  currency: string,
  description: string
): string {
  const publicId = process.env.CLOUDPAYMENTS_PUBLIC_ID;
  const apiSecret = process.env.CLOUDPAYMENTS_API_SECRET;

  if (!publicId || !apiSecret) {
    throw new Error('CloudPayments credentials not configured');
  }

  // Создаем подпись для виджета
  const data = `${publicId}${amount}${currency}${userId}${description}`;
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(data)
    .digest('hex');

  return signature;
}

// GET endpoint для создания подписки через URL параметры
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.redirect('/sign-in');
    }

    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('plan') || 'pro';
    const duration = parseInt(searchParams.get('duration') || '12');

    return await createSubscriptionLogic(session, planType, duration);
  } catch (error) {
    console.error('Create subscription GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
    const { planType = 'pro', duration = 12 } = body;

    return await createSubscriptionLogic(session, planType, duration);
  } catch (error) {
    console.error('Create subscription POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Общая логика создания подписки
async function createSubscriptionLogic(session: any, planType: string, duration: number) {
  try {

    // Настройки планов подписки
    const plans = {
      pro: {
        monthly: {
          amount: 990, // 990 рублей в месяц
          description: 'Scira Pro - Месячная подписка',
        },
        yearly: {
          amount: 790, // 790 рублей в месяц при годовой подписке (скидка 20%)
          description: 'Scira Pro - Годовая подписка (ежемесячное списание)',
        },
      },
      ultra: {
        monthly: {
          amount: 1990, // 1990 рублей в месяц
          description: 'Scira Ultra - Месячная подписка',
        },
        yearly: {
          amount: 1590, // 1590 рублей в месяц при годовой подписке (скидка 20%)
          description: 'Scira Ultra - Годовая подписка (ежемесячное списание)',
        },
      },
    };

    const planConfig = plans[planType as keyof typeof plans];
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Определить тип подписки (месячная или годовая)
    const subscriptionType = duration >= 12 ? 'yearly' : 'monthly';
    const selectedPlan = planConfig[subscriptionType];

    // Создать подписку в CloudPayments
    const subscriptionData: CreateSubscriptionRequest = {
      amount: selectedPlan.amount,
      currency: 'RUB',
      interval: 'Month',
      period: 1,
      maxPeriods: duration, // 12 месяцев для годовой подписки
      description: selectedPlan.description,
      requireConfirmation: true, // Требовать 3DS для безопасности
    };

    const result = await createCloudPaymentsSubscription(
      session.user.id,
      session.user.email!,
      subscriptionData
    );

    if (!result.Success) {
      return NextResponse.json(
        { error: result.Message || 'Failed to create subscription' },
        { status: 400 }
      );
    }

    // Генерировать данные для виджета
    const widgetData = {
      publicId: process.env.CLOUDPAYMENTS_PUBLIC_ID,
      amount: selectedPlan.amount,
      currency: 'RUB',
      accountId: session.user.id,
      email: session.user.email,
      description: selectedPlan.description,
      subscriptionId: result.Model?.Id,
      signature: generateWidgetToken(
        session.user.id,
        selectedPlan.amount,
        'RUB',
        selectedPlan.description
      ),
    };

    return NextResponse.json({
      success: true,
      subscription: result.Model,
      widget: widgetData,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint для получения информации о доступных планах
export async function GET() {
  const plans = {
    pro: {
      name: 'Scira Pro',
      amount: 990,
      currency: 'RUB',
      features: [
        'Безлимитные поисковые запросы',
        'Доступ к премиум моделям ИИ',
        'Приоритетная поддержка',
      ],
    },
    ultra: {
      name: 'Scira Ultra',
      amount: 1990,
      currency: 'RUB',
      features: [
        'Все возможности Pro',
        'Расширенные инструменты поиска',
        'API доступ',
        'Персональный менеджер',
      ],
    },
  };

  return NextResponse.json({ plans });
}