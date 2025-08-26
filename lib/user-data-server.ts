import 'server-only';

import { eq } from 'drizzle-orm';
import { subscription, user } from './db/schema';
import { db } from './db';
import { auth } from './auth';
import { headers } from 'next/headers';

// Single comprehensive user data type
export type ComprehensiveUserData = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  isProUser: boolean;
  isUltraUser: boolean;
  proSource: 'cloudpayments' | 'none';
  subscriptionStatus: 'active' | 'canceled' | 'expired' | 'none';
  cloudPaymentsSubscription?: {
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
  };
};

const userDataCache = new Map<string, { data: ComprehensiveUserData; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedUserData(userId: string): ComprehensiveUserData | null {
  const cached = userDataCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  userDataCache.delete(userId);
  return null;
}

function setCachedUserData(userId: string, data: ComprehensiveUserData): void {
  userDataCache.set(userId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearUserDataCache(userId: string): void {
  userDataCache.delete(userId);
}

export function clearAllUserDataCache(): void {
  userDataCache.clear();
}

export async function getComprehensiveUserData(): Promise<ComprehensiveUserData | null> {
  try {
    // Get session once
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    // Check cache first
    const cached = getCachedUserData(userId);
    if (cached) {
      return cached;
    }

    // Fetch all data in parallel
    const [userData, cloudPaymentsSubscriptions] = await Promise.all([
      // User basic data
      db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .then((rows) => rows[0]),
      // CloudPayments subscriptions
      db.select().from(subscription).where(eq(subscription.userId, userId)).$withCache(),
    ]);

    if (!userData) {
      return null;
    }

    // Check for active CloudPayments subscription
    const activeCloudPaymentsSubscription = cloudPaymentsSubscriptions.find((sub) => {
      const now = new Date();
      return (
        sub.status === 'active' && 
        sub.paymentProvider === 'cloudpayments' && 
        new Date(sub.currentPeriodEnd) > now
      );
    });

    // Check for active Ultra subscription (CloudPayments)
    const activeUltraSubscription = cloudPaymentsSubscriptions.find((sub) => {
      const now = new Date();
      return (
        sub.status === 'active' &&
        new Date(sub.currentPeriodEnd) > now &&
        sub.paymentProvider === 'cloudpayments' &&
        sub.productId === 'cloudpayments_ultra' // Ultra tier product ID
      );
    });

    // Determine user status
    let isProUser = false;
    let isUltraUser = false;
    let proSource: 'cloudpayments' | 'none' = 'none';
    let subscriptionStatus: 'active' | 'canceled' | 'expired' | 'none' = 'none';

    if (activeCloudPaymentsSubscription) {
      isProUser = true;
      proSource = 'cloudpayments';
      subscriptionStatus = activeCloudPaymentsSubscription.status as 'active' | 'canceled' | 'expired';
    }

    if (activeUltraSubscription) {
      isUltraUser = true;
      isProUser = true; // Ultra users are also Pro users
      proSource = 'cloudpayments';
      subscriptionStatus = activeUltraSubscription.status as 'active' | 'canceled' | 'expired';
    }

    // Build comprehensive data
    const comprehensiveData: ComprehensiveUserData = {
      id: userData.id,
      email: userData.email,
      emailVerified: userData.emailVerified,
      name: userData.name || userData.email.split('@')[0], // Fallback to email prefix if name is null
      image: userData.image,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      isProUser,
      isUltraUser,
      proSource,
      subscriptionStatus,
    };

    // Add CloudPayments subscription details if exists
    if (activeCloudPaymentsSubscription) {
      comprehensiveData.cloudPaymentsSubscription = {
        id: activeCloudPaymentsSubscription.id,
        productId: activeCloudPaymentsSubscription.productId,
        status: activeCloudPaymentsSubscription.status,
        amount: activeCloudPaymentsSubscription.amount,
        currency: activeCloudPaymentsSubscription.currency,
        recurringInterval: activeCloudPaymentsSubscription.recurringInterval,
        currentPeriodStart: activeCloudPaymentsSubscription.currentPeriodStart,
        currentPeriodEnd: activeCloudPaymentsSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: activeCloudPaymentsSubscription.cancelAtPeriodEnd,
        canceledAt: activeCloudPaymentsSubscription.canceledAt,
      };
    }

    // Cache the result
    setCachedUserData(userId, comprehensiveData);

    return comprehensiveData;
  } catch (error) {
    console.error('Error getting comprehensive user data:', error);
    return null;
  }
}

export async function isUserPro(): Promise<boolean> {
  const userData = await getComprehensiveUserData();
  return userData?.isProUser || false;
}

export async function getUserSubscriptionStatus(): Promise<'active' | 'canceled' | 'expired' | 'none'> {
  const userData = await getComprehensiveUserData();
  return userData?.subscriptionStatus || 'none';
}

export async function getProSource(): Promise<'cloudpayments' | 'none'> {
  const userData = await getComprehensiveUserData();
  return userData?.proSource || 'none';
}

export async function isUserUltra(): Promise<boolean> {
  const userData = await getComprehensiveUserData();
  return userData?.isUltraUser || false;
}
