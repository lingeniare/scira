import { eq } from 'drizzle-orm';
import { subscription } from './db/schema';
import { db } from './db';
import { auth } from './auth';
import { headers } from 'next/headers';
import {
  subscriptionCache,
  createSubscriptionKey,
  getProUserStatus,
  setProUserStatus,
} from './performance-cache';

export type SubscriptionDetails = {
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

export type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: 'CANCELED' | 'EXPIRED' | 'GENERAL';
};

// Check CloudPayments Pro status
async function getCloudPaymentsProStatus(
  userId: string,
): Promise<{ isProUser: boolean; source: 'cloudpayments' | 'none' }> {
  try {
    // Check all subscriptions for user
    const userSubscriptions = await db.select().from(subscription).where(eq(subscription.userId, userId));
    
    // Check for active CloudPayments subscription
    const activeCloudPaymentsSubscription = userSubscriptions.find(
      (sub) => sub.status === 'active' && sub.paymentProvider === 'cloudpayments'
    );
    
    if (activeCloudPaymentsSubscription) {
      console.log('🔥 CloudPayments subscription found for user:', userId);
      return { isProUser: true, source: 'cloudpayments' };
    }

    return { isProUser: false, source: 'none' };
  } catch (error) {
    console.error('Error getting CloudPayments pro status:', error);
    return { isProUser: false, source: 'none' };
  }
}

export async function getSubscriptionDetails(): Promise<SubscriptionDetailsResult> {
  'use server';

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { hasSubscription: false };
    }

    // Check cache first
    const cacheKey = createSubscriptionKey(session.user.id);
    const cached = subscriptionCache.get(cacheKey);
    if (cached) {
      // Update pro user status with CloudPayments check
      const proStatus = await getCloudPaymentsProStatus(session.user.id);
      setProUserStatus(session.user.id, proStatus.isProUser);
      return cached;
    }

    const userSubscriptions = await db.select().from(subscription).where(eq(subscription.userId, session.user.id));

    if (!userSubscriptions.length) {
      const proStatus = await getCloudPaymentsProStatus(session.user.id);
      const result = { hasSubscription: false };
      subscriptionCache.set(cacheKey, result);
      setProUserStatus(session.user.id, proStatus.isProUser);
      return result;
    }

    // Get the most recent active CloudPayments subscription
    const activeSubscription = userSubscriptions
      .filter((sub) => sub.status === 'active' && sub.paymentProvider === 'cloudpayments')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (!activeSubscription) {
      // Check for canceled or expired CloudPayments subscriptions
      const latestSubscription = userSubscriptions
        .filter((sub) => sub.paymentProvider === 'cloudpayments')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (latestSubscription) {
        const now = new Date();
        const isExpired = new Date(latestSubscription.currentPeriodEnd) < now;
        const isCanceled = latestSubscription.status === 'canceled';

        const result = {
          hasSubscription: true,
          subscription: {
            id: latestSubscription.id,
            productId: latestSubscription.productId,
            status: latestSubscription.status,
            amount: latestSubscription.amount,
            currency: latestSubscription.currency,
            recurringInterval: latestSubscription.recurringInterval,
            currentPeriodStart: latestSubscription.currentPeriodStart,
            currentPeriodEnd: latestSubscription.currentPeriodEnd,
            cancelAtPeriodEnd: latestSubscription.cancelAtPeriodEnd,
            canceledAt: latestSubscription.canceledAt,
            organizationId: null,
          },
          error: isCanceled
            ? 'Subscription has been canceled'
            : isExpired
              ? 'Subscription has expired'
              : 'Subscription is not active',
          errorType: (isCanceled ? 'CANCELED' : isExpired ? 'EXPIRED' : 'GENERAL') as
            | 'CANCELED'
            | 'EXPIRED'
            | 'GENERAL',
        };
        subscriptionCache.set(cacheKey, result);
        setProUserStatus(session.user.id, false);
        return result;
      }

      const fallbackResult = { hasSubscription: false };
      subscriptionCache.set(cacheKey, fallbackResult);
      setProUserStatus(session.user.id, false);
      return fallbackResult;
    }

    const result = {
      hasSubscription: true,
      subscription: {
        id: activeSubscription.id,
        productId: activeSubscription.productId,
        status: activeSubscription.status,
        amount: activeSubscription.amount,
        currency: activeSubscription.currency,
        recurringInterval: activeSubscription.recurringInterval,
        currentPeriodStart: activeSubscription.currentPeriodStart,
        currentPeriodEnd: activeSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
        canceledAt: activeSubscription.canceledAt,
        organizationId: null,
      },
    };
    subscriptionCache.set(cacheKey, result);
    setProUserStatus(session.user.id, true);
    return result;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return {
      hasSubscription: false,
      error: 'Failed to load subscription details',
      errorType: 'GENERAL',
    };
  }
}

// Simple helper to check if user has an active CloudPayments subscription
export async function isUserSubscribed(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return false;
    }

    const proStatus = await getCloudPaymentsProStatus(session.user.id);
    return proStatus.isProUser;
  } catch (error) {
    console.error('Error checking user subscription status:', error);
    return false;
  }
}

// Fast pro user status check using cache
export async function isUserProCached(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return false;
  }

  // Try cache first
  const cached = getProUserStatus(session.user.id);
  if (cached !== null) {
    return cached;
  }

  // Fallback to CloudPayments check
  const proStatus = await getCloudPaymentsProStatus(session.user.id);
  setProUserStatus(session.user.id, proStatus.isProUser);
  return proStatus.isProUser;
}

// Helper to check if user has access to a specific product/tier
export async function hasAccessToProduct(productId: string): Promise<boolean> {
  const result = await getSubscriptionDetails();
  return (
    result.hasSubscription && result.subscription?.status === 'active' && result.subscription?.productId === productId
  );
}

// Helper to get user's current subscription status
export async function getUserSubscriptionStatus(): Promise<'active' | 'canceled' | 'expired' | 'none'> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return 'none';
    }

    const proStatus = await getCloudPaymentsProStatus(session.user.id);

    if (proStatus.isProUser) {
      return 'active';
    }

    // Get detailed status from subscription
    const result = await getSubscriptionDetails();

    if (!result.hasSubscription) {
      return 'none';
    }

    if (result.subscription?.status === 'active') {
      return 'active';
    }

    if (result.errorType === 'CANCELED') {
      return 'canceled';
    }

    if (result.errorType === 'EXPIRED') {
      return 'expired';
    }

    return 'none';
  } catch (error) {
    console.error('Error getting user subscription status:', error);
    return 'none';
  }
}

// Export the CloudPayments pro status function for UI components
export async function getProStatusWithSource(): Promise<{
  isProUser: boolean;
  source: 'cloudpayments' | 'none';
  expiresAt?: Date;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { isProUser: false, source: 'none' };
    }

    const proStatus = await getCloudPaymentsProStatus(session.user.id);

    // If Pro status comes from CloudPayments, get expiration from subscription
    if (proStatus.source === 'cloudpayments' && proStatus.isProUser) {
      const userSubscriptions = await db.select().from(subscription).where(eq(subscription.userId, session.user.id));
      const activeCloudPaymentsSubscription = userSubscriptions.find(
        (sub) => sub.status === 'active' && sub.paymentProvider === 'cloudpayments'
      );
      
      if (activeCloudPaymentsSubscription?.currentPeriodEnd) {
        return { ...proStatus, expiresAt: new Date(activeCloudPaymentsSubscription.currentPeriodEnd) };
      }
    }

    return proStatus;
  } catch (error) {
    console.error('Error getting pro status with source:', error);
    return { isProUser: false, source: 'none' };
  }
}
