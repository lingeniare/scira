import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import { Resend } from 'resend';
import {
  user,
  session,
  verification,
  account,
  chat,
  message,
  extremeSearchUsage,
  messageUsage,
  subscription,
  payment,
  customInstructions,
  stream,
  lookout,
} from '@/lib/db/schema';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { config } from 'dotenv';
import { serverEnv } from '@/env/server';
import { checkout, polar, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import {
  dodopayments,
  checkout as dodocheckout,
  portal as dodoportal,
  webhooks as dodowebhooks,
} from '@dodopayments/better-auth';
import DodoPayments from 'dodopayments';
import { eq } from 'drizzle-orm';
import { invalidateUserCaches } from './performance-cache';

config({
  path: '.env.local',
});

// Инициализация Resend для отправки email
const resend = new Resend(serverEnv.RESEND_API_KEY);

// Экспортируемая функция для отправки Magic Link
export async function sendMagicLink(email: string): Promise<void> {
  try {
    // Используем встроенный API better-auth для отправки magic link
    const response = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send magic link');
    }
  } catch (error) {
    console.error('Error sending magic link:', error);
    throw error;
  }
}

// Utility function to safely parse dates
function safeParseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  ...(process.env.NODE_ENV === 'production' ? {} : { server: 'sandbox' }),
});

export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  ...(process.env.NODE_ENV === 'production' ? { environment: 'live_mode' } : { environment: 'test_mode' }),
});

export const auth = betterAuth({
  rateLimit: {
    max: 50,
    window: 60,
  },
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      verification,
      account,
      chat,
      message,
      extremeSearchUsage,
      messageUsage,
      subscription,
      payment,
      customInstructions,
      stream,
      lookout,
    },
  }),
  socialProviders: {
    vk: {
      clientId: serverEnv.VK_CLIENT_ID,
      clientSecret: serverEnv.VK_CLIENT_SECRET,
    },
  },
  pluginRoutes: {
    autoNamespace: true,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }, request) => {
        // Отправка magic link через Resend
        try {
          await resend.emails.send({
            from: 'Scira AI <noreply@scira.ai>',
            to: [email],
            subject: 'Войти в Scira AI',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Войти в Scira AI</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">Scira AI</h1>
                  </div>
                  
                  <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #1e293b;">Войти в аккаунт</h2>
                    <p style="margin: 0 0 25px 0; color: #64748b;">Нажмите на кнопку ниже, чтобы войти в свой аккаунт Scira AI:</p>
                    
                    <div style="text-align: center;">
                      <a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Войти в Scira AI</a>
                    </div>
                  </div>
                  
                  <div style="text-align: center; color: #64748b; font-size: 14px;">
                    <p>Если вы не запрашивали этот email, просто проигнорируйте его.</p>
                    <p>Ссылка действительна в течение 15 минут.</p>
                  </div>
                </body>
              </html>
            `,
          });
          console.log('Magic link sent successfully to:', email);
        } catch (error) {
          console.error('Failed to send magic link:', error);
          throw new Error('Failed to send magic link email');
        }
      },
    }),
    dodopayments({
      client: dodoPayments,
      createCustomerOnSignUp: true,
      use: [
        dodocheckout({
          products: [
            {
              productId:
                process.env.NEXT_PUBLIC_PREMIUM_TIER ||
                (() => {
                  throw new Error('NEXT_PUBLIC_PREMIUM_TIER environment variable is required');
                })(),
              slug:
                process.env.NEXT_PUBLIC_PREMIUM_SLUG ||
                (() => {
                  throw new Error('NEXT_PUBLIC_PREMIUM_SLUG environment variable is required');
                })(),
            },
          ],
          successUrl: '/success',
          authenticatedUsersOnly: true,
        }),
        dodoportal(),
        dodowebhooks({
          webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
          onPayload: async (payload) => {
            console.log('🔔 Received Dodo Payments webhook:', payload.type);
            console.log('📦 Payload data:', JSON.stringify(payload.data, null, 2));

            if (
              payload.type === 'payment.succeeded' ||
              payload.type === 'payment.failed' ||
              payload.type === 'payment.cancelled' ||
              payload.type === 'payment.processing'
            ) {
              console.log('🎯 Processing payment webhook:', payload.type);

              try {
                const data = payload.data;

                // Extract user ID from customer data if available
                let validUserId = null;
                if (data.customer?.email) {
                  try {
                    const userExists = await db.query.user.findFirst({
                      where: eq(user.email, data.customer.email),
                      columns: { id: true },
                    });
                    validUserId = userExists ? userExists.id : null;

                    if (!userExists) {
                      console.warn(
                        `⚠️ User with email ${data.customer.email} not found, creating payment without user link`,
                      );
                    }
                  } catch (error) {
                    console.error('Error checking user existence:', error);
                  }
                }

                // Build payment data
                const paymentData = {
                  id: data.payment_id,
                  createdAt: new Date(data.created_at),
                  updatedAt: data.updated_at ? new Date(data.updated_at) : null,
                  brandId: data.brand_id || null,
                  businessId: data.business_id || null,
                  cardIssuingCountry: data.card_issuing_country || null,
                  cardLastFour: data.card_last_four || null,
                  cardNetwork: data.card_network || null,
                  cardType: data.card_type || null,
                  currency: data.currency,
                  digitalProductsDelivered: data.digital_products_delivered || false,
                  discountId: data.discount_id || null,
                  errorCode: data.error_code || null,
                  errorMessage: data.error_message || null,
                  paymentLink: data.payment_link || null,
                  paymentMethod: data.payment_method || null,
                  paymentMethodType: data.payment_method_type || null,
                  settlementAmount: data.settlement_amount || null,
                  settlementCurrency: data.settlement_currency || null,
                  settlementTax: data.settlement_tax || null,
                  status: data.status || null,
                  subscriptionId: data.subscription_id || null,
                  tax: data.tax || null,
                  totalAmount: data.total_amount,
                  // JSON fields
                  billing: data.billing || null,
                  customer: data.customer || null,
                  disputes: data.disputes || null,
                  metadata: data.metadata || null,
                  productCart: data.product_cart || null,
                  refunds: data.refunds || null,
                  userId: validUserId,
                };

                console.log('💾 Final payment data:', {
                  id: paymentData.id,
                  status: paymentData.status,
                  userId: paymentData.userId,
                  totalAmount: paymentData.totalAmount,
                  currency: paymentData.currency,
                });

                // Use Drizzle's onConflictDoUpdate for proper upsert
                await db
                  .insert(payment)
                  .values(paymentData)
                  .onConflictDoUpdate({
                    target: payment.id,
                    set: {
                      updatedAt: paymentData.updatedAt || new Date(),
                      status: paymentData.status,
                      errorCode: paymentData.errorCode,
                      errorMessage: paymentData.errorMessage,
                      digitalProductsDelivered: paymentData.digitalProductsDelivered,
                      disputes: paymentData.disputes,
                      refunds: paymentData.refunds,
                      metadata: paymentData.metadata,
                      userId: paymentData.userId,
                    },
                  });

                console.log('✅ Upserted payment:', data.payment_id);

                // Invalidate user caches when payment status changes
                if (validUserId) {
                  invalidateUserCaches(validUserId);
                  console.log('🗑️ Invalidated caches for user:', validUserId);
                }
              } catch (error) {
                console.error('💥 Error processing payment webhook:', error);
                // Don't throw - let webhook succeed to avoid retries
              }
            }
          },
        }),
      ],
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      getCustomerCreateParams: async ({ user: newUser }) => {
        console.log('🚀 getCustomerCreateParams called for user:', newUser.id);

        try {
          // Look for existing customer by email
          const { result: existingCustomers } = await polarClient.customers.list({
            email: newUser.email,
          });

          const existingCustomer = existingCustomers.items[0];

          if (existingCustomer && existingCustomer.externalId && existingCustomer.externalId !== newUser.id) {
            console.log(
              `🔗 Found existing customer ${existingCustomer.id} with external ID ${existingCustomer.externalId}`,
            );
            console.log(`🔄 Updating user ID from ${newUser.id} to ${existingCustomer.externalId}`);

            // Update the user's ID in database to match the existing external ID
            await db.update(user).set({ id: existingCustomer.externalId }).where(eq(user.id, newUser.id));

            console.log(`✅ Updated user ID to match existing external ID: ${existingCustomer.externalId}`);
          }

          return {};
        } catch (error) {
          console.error('💥 Error in getCustomerCreateParams:', error);
          return {};
        }
      },
      use: [
        checkout({
          products: [
            {
              productId:
                process.env.NEXT_PUBLIC_STARTER_TIER ||
                (() => {
                  throw new Error('NEXT_PUBLIC_STARTER_TIER environment variable is required');
                })(),
              slug:
                process.env.NEXT_PUBLIC_STARTER_SLUG ||
                (() => {
                  throw new Error('NEXT_PUBLIC_STARTER_SLUG environment variable is required');
                })(),
            },
          ],
          successUrl: `/success`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret:
            process.env.POLAR_WEBHOOK_SECRET ||
            (() => {
              throw new Error('POLAR_WEBHOOK_SECRET environment variable is required');
            })(),
          onPayload: async ({ data, type }) => {
            if (
              type === 'subscription.created' ||
              type === 'subscription.active' ||
              type === 'subscription.canceled' ||
              type === 'subscription.revoked' ||
              type === 'subscription.uncanceled' ||
              type === 'subscription.updated'
            ) {
              console.log('🎯 Processing subscription webhook:', type);
              console.log('📦 Payload data:', JSON.stringify(data, null, 2));

              try {
                // STEP 1: Extract user ID from customer data
                const userId = data.customer?.externalId;

                // STEP 1.5: Check if user exists to prevent foreign key violations
                let validUserId = null;
                if (userId) {
                  try {
                    const userExists = await db.query.user.findFirst({
                      where: eq(user.id, userId),
                      columns: { id: true },
                    });
                    validUserId = userExists ? userId : null;

                    if (!userExists) {
                      console.warn(
                        `⚠️ User ${userId} not found, creating subscription without user link - will auto-link when user signs up`,
                      );
                    }
                  } catch (error) {
                    console.error('Error checking user existence:', error);
                  }
                } else {
                  console.error('🚨 No external ID found for subscription', {
                    subscriptionId: data.id,
                    customerId: data.customerId,
                  });
                }
                // STEP 2: Build subscription data
                const subscriptionData = {
                  id: data.id,
                  createdAt: new Date(data.createdAt),
                  modifiedAt: safeParseDate(data.modifiedAt),
                  amount: data.amount,
                  currency: data.currency,
                  recurringInterval: data.recurringInterval,
                  status: data.status,
                  currentPeriodStart: safeParseDate(data.currentPeriodStart) || new Date(),
                  currentPeriodEnd: safeParseDate(data.currentPeriodEnd) || new Date(),
                  cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
                  canceledAt: safeParseDate(data.canceledAt),
                  startedAt: safeParseDate(data.startedAt) || new Date(),
                  endsAt: safeParseDate(data.endsAt),
                  endedAt: safeParseDate(data.endedAt),
                  customerId: data.customerId,
                  productId: data.productId,
                  discountId: data.discountId || null,
                  checkoutId: data.checkoutId || '',
                  customerCancellationReason: data.customerCancellationReason || null,
                  customerCancellationComment: data.customerCancellationComment || null,
                  metadata: data.metadata ? JSON.stringify(data.metadata) : null,
                  customFieldData: data.customFieldData ? JSON.stringify(data.customFieldData) : null,
                  userId: validUserId,
                };

                console.log('💾 Final subscription data:', {
                  id: subscriptionData.id,
                  status: subscriptionData.status,
                  userId: subscriptionData.userId,
                  amount: subscriptionData.amount,
                });

                // STEP 3: Use Drizzle's onConflictDoUpdate for proper upsert
                await db
                  .insert(subscription)
                  .values(subscriptionData)
                  .onConflictDoUpdate({
                    target: subscription.id,
                    set: {
                      modifiedAt: subscriptionData.modifiedAt || new Date(),
                      amount: subscriptionData.amount,
                      currency: subscriptionData.currency,
                      recurringInterval: subscriptionData.recurringInterval,
                      status: subscriptionData.status,
                      currentPeriodStart: subscriptionData.currentPeriodStart,
                      currentPeriodEnd: subscriptionData.currentPeriodEnd,
                      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
                      canceledAt: subscriptionData.canceledAt,
                      startedAt: subscriptionData.startedAt,
                      endsAt: subscriptionData.endsAt,
                      endedAt: subscriptionData.endedAt,
                      customerId: subscriptionData.customerId,
                      productId: subscriptionData.productId,
                      discountId: subscriptionData.discountId,
                      checkoutId: subscriptionData.checkoutId,
                      customerCancellationReason: subscriptionData.customerCancellationReason,
                      customerCancellationComment: subscriptionData.customerCancellationComment,
                      metadata: subscriptionData.metadata,
                      customFieldData: subscriptionData.customFieldData,
                      userId: subscriptionData.userId,
                    },
                  });

                console.log('✅ Upserted subscription:', data.id);

                // Invalidate user caches when subscription changes
                if (validUserId) {
                  invalidateUserCaches(validUserId);
                  console.log('🗑️ Invalidated caches for user:', validUserId);
                }
              } catch (error) {
                console.error('💥 Error processing subscription webhook:', error);
                // Don't throw - let webhook succeed to avoid retries
              }
            }
          },
        }),
      ],
    }),
    nextCookies(),
  ],
  trustedOrigins: ['https://localhost:3000', 'https://scira.ai', 'https://www.scira.ai'],
  allowedOrigins: ['https://localhost:3000', 'https://scira.ai', 'https://www.scira.ai'],
});
