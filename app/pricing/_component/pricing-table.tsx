'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/constants';
import { DiscountBanner } from '@/components/ui/discount-banner';
import { getDiscountConfigAction } from '@/app/actions';
import { DiscountConfig } from '@/lib/discount';
import { useLocation } from '@/hooks/use-location';

type SubscriptionDetails = {
  id: string;
  productId: string;
  status: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  organizationId: string | null;
};

type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: 'CANCELED' | 'EXPIRED' | 'GENERAL';
};

interface PricingTableProps {
  subscriptionDetails: SubscriptionDetailsResult;
  user: any;
}

export default function PricingTable({ subscriptionDetails, user }: PricingTableProps) {
  const router = useRouter();
  const location = useLocation();
  const [isYearly, setIsYearly] = useState(false);

  const [discountConfig, setDiscountConfig] = useState<DiscountConfig>({ enabled: false });

  useEffect(() => {
    const fetchDiscountConfig = async () => {
      try {
        const config = await getDiscountConfigAction();
        const isDevMode = config.dev || process.env.NODE_ENV === 'development';

        if ((config.enabled || isDevMode) && !config.originalPrice) {
          config.originalPrice = PRICING.PRO_MONTHLY;
        }
        setDiscountConfig(config);
      } catch (error) {
        console.error('Failed to fetch discount config:', error);
      }
    };

    fetchDiscountConfig();
  }, []);

  // Helper function to calculate discounted price
  const getDiscountedPrice = (originalPrice: number, isINR: boolean = false) => {
    const isDevMode = discountConfig.dev || process.env.NODE_ENV === 'development';
    const shouldApplyDiscount = isDevMode
      ? discountConfig.code && discountConfig.message
      : discountConfig.enabled && discountConfig.code && discountConfig.message;

    if (!shouldApplyDiscount) {
      return originalPrice;
    }

    // Use INR price directly if available
    if (isINR && discountConfig.inrPrice) {
      return discountConfig.inrPrice;
    }

    // Apply percentage discount
    if (discountConfig.percentage) {
      return Math.round(originalPrice - (originalPrice * discountConfig.percentage) / 100);
    }

    return originalPrice;
  };

  // Check if discount should be shown
  const shouldShowDiscount = () => {
    const isDevMode = discountConfig.dev || process.env.NODE_ENV === 'development';
    return isDevMode
      ? discountConfig.code && discountConfig.message && (discountConfig.percentage || discountConfig.inrPrice)
      : discountConfig.enabled &&
          discountConfig.code &&
          discountConfig.message &&
          (discountConfig.percentage || discountConfig.inrPrice);
  };

  const handleCheckout = async (productId: string, slug: string, paymentMethod?: 'dodo' | 'cloudpayments') => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      if (paymentMethod === 'dodo') {
        router.push('/checkout');
      } else if (paymentMethod === 'cloudpayments') {
        // Redirect to CloudPayments subscription creation
        const planType = productId === ULTRA_TIER ? 'ultra' : 'pro';
        const duration = isYearly ? 'yearly' : 'monthly';
        router.push(`/api/cloudpayments/create-subscription?plan=${planType}&duration=${duration}`);
      } else {
        // Default CloudPayments checkout
        const planType = productId === ULTRA_TIER ? 'ultra' : 'pro';
        const duration = isYearly ? 'yearly' : 'monthly';
        router.push(`/api/cloudpayments/create-subscription?plan=${planType}&duration=${duration}`);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Что-то пошло не так. Попробуйте еще раз.');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const proSource = getProAccessSource();
      const ultraSource = getUltraAccessSource();
      
      if (proSource === 'cloudpayments' || ultraSource === 'cloudpayments') {
        // Redirect to CloudPayments management API
        router.push('/api/cloudpayments/manage-subscription');
      } else if (proSource === 'dodo') {
        // Legacy DodoPayments portal - redirect to CloudPayments management
        router.push('/api/cloudpayments/manage-subscription');
      } else {
        // Default CloudPayments management
        router.push('/api/cloudpayments/manage-subscription');
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      toast.error('Не удалось открыть управление подпиской');
    }
  };

  const STARTER_TIER = process.env.NEXT_PUBLIC_STARTER_TIER;
  const STARTER_SLUG = process.env.NEXT_PUBLIC_STARTER_SLUG;
  const ULTRA_TIER = process.env.NEXT_PUBLIC_ULTRA_TIER;
  const ULTRA_SLUG = process.env.NEXT_PUBLIC_ULTRA_SLUG;

  if (!STARTER_TIER || !STARTER_SLUG || !ULTRA_TIER || !ULTRA_SLUG) {
    throw new Error('Missing required environment variables for Starter and Ultra tiers');
  }

  const isCurrentPlan = (tierProductId: string) => {
    return (
      subscriptionDetails.hasSubscription &&
      subscriptionDetails.subscription?.productId === tierProductId &&
      subscriptionDetails.subscription?.status === 'active'
    );
  };

  // Check if user has any Pro status (DodoPayments or CloudPayments)
  const hasProAccess = () => {
    const hasDodoProAccess = user?.isProUser && user?.proSource === 'dodo';
    const hasCloudPaymentsProAccess = user?.isProUser && user?.proSource === 'cloudpayments';
    return hasDodoProAccess || hasCloudPaymentsProAccess;
  };

  // Check if user has Ultra access (CloudPayments)
  const hasUltraAccess = () => {
    const hasCloudPaymentsUltraAccess = user?.isUltraUser && user?.ultraSource === 'cloudpayments';
    return hasCloudPaymentsUltraAccess;
  };

  // Get the source of Pro access for display
  const getProAccessSource = () => {
    if (user?.proSource === 'dodo') return 'dodo';
    if (user?.proSource === 'cloudpayments') return 'cloudpayments';
    return null;
  };

  // Get the source of Ultra access for display
  const getUltraAccessSource = () => {
    if (user?.ultraSource === 'cloudpayments') return 'cloudpayments';
    return null;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDiscountClaim = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Код скидки "${code}" скопирован в буфер обмена!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад на главную
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-medium text-foreground mb-4 font-be-vietnam-pro">Тарифы</h1>
          <p className="text-xl text-muted-foreground">Выберите подходящий план</p>
          {!location.loading && location.isIndia && (
            <Badge variant="secondary" className="mt-4">
              🇮🇳 Доступны специальные цены для Индии
            </Badge>
          )}
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8 p-1 bg-muted rounded-lg w-fit mx-auto">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isYearly 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ежемесячно
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isYearly 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ежегодно
              <Badge variant="secondary" className="ml-2 text-xs">Скидка 20%</Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Discount Banner */}
      {shouldShowDiscount() && (
        <div className="max-w-4xl mx-auto px-6 sm:px-16 mb-8">
          <DiscountBanner discountConfig={discountConfig} onClaim={handleDiscountClaim} className="mx-auto" />
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="pb-4">
              <h3 className="text-xl font-medium">Бесплатный</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-light">$0</span>
                <span className="text-muted-foreground ml-2">/месяц</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3 flex-shrink-0"></div>
                  20 поисков в день
                </li>
                <li className="flex items-center text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3 flex-shrink-0"></div>
                  Базовые AI модели
                </li>
                <li className="flex items-center text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-3 flex-shrink-0"></div>
                  История поиска
                </li>
              </ul>

              <Button variant="outline" className="w-full" disabled={!hasProAccess()}>
                {!hasProAccess() ? 'Текущий план' : 'Бесплатный план'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-primary">
            {hasProAccess() && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Текущий план</Badge>
              </div>
            )}
            {!hasProAccess() && shouldShowDiscount() && (
              <div className="absolute -top-3 right-4">
                <Badge variant="green">{discountConfig.percentage}% OFF</Badge>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium">Scira Pro</h3>
                <Badge variant="secondary">Популярный</Badge>
              </div>

              {/* Pricing Display */}
              {hasProAccess() ? (
                // Show user's current pricing method
                getProAccessSource() === 'dodo' ? (
                  <div className="flex items-baseline">
                    <span className="text-4xl font-light">₹{PRICING.PRO_MONTHLY_INR}</span>
                    <span className="text-muted-foreground ml-2">+GST</span>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-4xl font-light">₽{PRICING.PRO_MONTHLY_INR}</span>
                    <span className="text-muted-foreground ml-2">/месяц</span>
                  </div>
                )
              ) : !location.loading && location.isIndia ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* INR Option */}
                    <div className="p-3 border rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        {(shouldShowDiscount() || isYearly) ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{PRICING.PRO_MONTHLY_INR}
                            </span>
                            <span className="text-xl font-light">
                              ₹{isYearly 
                                ? Math.round(getDiscountedPrice(PRICING.PRO_MONTHLY_INR, true) * 0.8) 
                                : getDiscountedPrice(PRICING.PRO_MONTHLY_INR, true)
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-light">₹{PRICING.PRO_MONTHLY_INR}</span>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {isYearly ? '/месяц (оплата за год)' : '+18% GST'}
                        </div>
                        <div className="text-xs">{isYearly ? 'Доступ на 12 месяцев' : 'Доступ на 1 месяц'}</div>
                        <div className="text-xs text-muted-foreground">🇮🇳 UPI, Cards, QR</div>
                      </div>
                    </div>

                    {/* USD Option */}
                    <div className="p-3 border rounded-lg">
                      <div className="space-y-1">
                        {(shouldShowDiscount() || isYearly) ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">${PRICING.PRO_MONTHLY}</span>
                            <span className="text-xl font-light">
                              ${isYearly 
                                ? Math.round(getDiscountedPrice(PRICING.PRO_MONTHLY) * 0.8) 
                                : getDiscountedPrice(PRICING.PRO_MONTHLY)
                              }
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-light">${PRICING.PRO_MONTHLY}</span>
                        )}
                        <div className="text-xs text-muted-foreground">USD</div>
                        <div className="text-xs">{isYearly ? 'Годовая подписка' : 'Месячная подписка'}</div>
                        <div className="text-xs text-muted-foreground">💳 Card payment</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline">
                  {(shouldShowDiscount() || isYearly) ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-xl text-muted-foreground line-through">₽{PRICING.PRO_MONTHLY_INR}</span>
                      <span className="text-4xl font-light">
                        ₽{isYearly 
                          ? Math.round(getDiscountedPrice(PRICING.PRO_MONTHLY_INR, true) * 0.8) 
                          : getDiscountedPrice(PRICING.PRO_MONTHLY_INR, true)
                        }
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-light">₽{PRICING.PRO_MONTHLY_INR}</span>
                  )}
                  <span className="text-muted-foreground ml-2">
                    {isYearly ? '/месяц (оплата за год)' : '/месяц'}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Неограниченный поиск
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Pro AI модели
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Анализ PDF
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Приоритетная поддержка
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                  Scira Lookout
                </li>
              </ul>

              {hasProAccess() ? (
                <div className="space-y-4">
                  <Button className="w-full" onClick={handleManageSubscription}>
                    {getProAccessSource() === 'dodo' ? 'Управление платежами' : 
                     getProAccessSource() === 'cloudpayments' ? 'Управление CloudPayments' : 'Управление подпиской'}
                  </Button>
                  {getProAccessSource() === 'dodo' && user?.expiresAt && (
                    <p className="text-sm text-muted-foreground text-center">
                      Доступ истекает {formatDate(new Date(user.expiresAt))}
                    </p>
                  )}
                  {getProAccessSource() === 'cloudpayments' && user?.expiresAt && (
                    <p className="text-sm text-muted-foreground text-center">
                      Подписка CloudPayments истекает {formatDate(new Date(user.expiresAt))}
                    </p>
                  )}
                </div>
              ) : !location.loading && location.isIndia ? (
                !user ? (
                  <Button className="w-full group" onClick={() => handleCheckout(STARTER_TIER, STARTER_SLUG)}>
                    Зарегистрироваться на Pro
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full group" onClick={() => handleCheckout(STARTER_TIER, STARTER_SLUG, 'dodo')}>
                      🇮🇳 Оплатить ₹{getDiscountedPrice(PRICING.PRO_MONTHLY_INR, true)}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      className="w-full group"
                      onClick={() => handleCheckout(STARTER_TIER, STARTER_SLUG, 'cloudpayments')}
                    >
                      💳 CloudPayments ₽{isYearly 
                        ? Math.round(getDiscountedPrice(PRICING.PRO_MONTHLY_INR, true) * 0.8) 
                        : getDiscountedPrice(PRICING.PRO_MONTHLY_INR, true)
                      }{isYearly ? '/месяц (год)' : '/месяц'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {isYearly ? 'Годовая подписка • Ежемесячное списание' : 'Месячная подписка • CloudPayments'}
                    </p>
                    {shouldShowDiscount() && discountConfig.discountAvail && (
                      <p className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                        {discountConfig.discountAvail}
                      </p>
                    )}
                  </div>
                )
              ) : (
                <Button
                  className="w-full group"
                  onClick={() => handleCheckout(STARTER_TIER, STARTER_SLUG)}
                  disabled={location.loading}
                >
                  {location.loading ? 'Загрузка...' : !user ? 'Зарегистрироваться на Pro' : 'Перейти на Pro'}
                  {!location.loading && (
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Ultra Plan */}
          <Card className="relative border-2 border-yellow-500">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-500 text-yellow-900">Ultra</Badge>
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium">Scira Ultra</h3>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Премиум</Badge>
              </div>

              <div className="flex items-baseline">
                <span className="text-4xl font-light">
                  ₽{isYearly 
                    ? Math.round(PRICING.ULTRA_MONTHLY_INR * 0.8) 
                    : PRICING.ULTRA_MONTHLY_INR
                  }
                </span>
                <span className="text-muted-foreground ml-2">
                  {isYearly ? '/месяц (оплата за год)' : '/месяц'}
                </span>
              </div>
              {isYearly && (
                <div className="flex items-center text-sm">
                  <span className="line-through text-muted-foreground mr-2">
                    ₽{PRICING.ULTRA_MONTHLY_INR}
                  </span>
                  <Badge variant="green" className="text-xs">20% OFF</Badge>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                  Unlimited searches
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                  Все AI модели + Ultra модели
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                  Расширенный анализ PDF
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                  Priority support
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                  Scira Lookout Pro
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                  Ранний доступ к новым функциям
                </li>
              </ul>

              {hasUltraAccess() ? (
                <div className="space-y-4">
                  <Button className="w-full" onClick={handleManageSubscription}>
                    {getUltraAccessSource() === 'cloudpayments' ? 'Управление CloudPayments' : 'Управление подпиской'}
                  </Button>
                  {getUltraAccessSource() === 'cloudpayments' && user?.ultraExpiresAt && (
                    <p className="text-sm text-muted-foreground text-center">
                      CloudPayments Ultra истекает {formatDate(new Date(user.ultraExpiresAt))}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    className="w-full group bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
                    onClick={() => handleCheckout(ULTRA_TIER, ULTRA_SLUG, 'cloudpayments')}
                  >
                    💳 {!user ? 'Зарегистрироваться на Ultra' : 'Перейти на Ultra'} 
                    ₽{isYearly ? Math.round(PRICING.ULTRA_MONTHLY_INR * 0.8) : PRICING.ULTRA_MONTHLY_INR}
                    {isYearly ? '/месяц (год)' : '/месяц'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {isYearly ? 'Годовая подписка • Ежемесячное списание' : 'Месячная подписка • CloudPayments'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Discount */}
        <Card className="max-w-2xl mx-auto mt-16">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-medium mb-2">Доступна скидка для студентов</h3>
              <p className="text-sm text-muted-foreground mb-4">Получите Pro за $5/месяц с действующим студенческим удостоверением</p>
              <Button variant="outline" asChild>
                <a href="mailto:zaid@scira.ai?subject=Student%20Discount%20Request">Подать заявку на скидку</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-sm text-muted-foreground">
            Подписываясь, вы соглашаетесь с нашими{' '}
            <Link href="/terms" className="text-foreground hover:underline">
              Условиями обслуживания
            </Link>{' '}
            и{' '}
            <Link href="/privacy-policy" className="text-foreground hover:underline">
              Политикой конфиденциальности
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Вопросы?{' '}
            <a href="mailto:zaid@scira.ai" className="text-foreground hover:underline">
              Свяжитесь с нами
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
