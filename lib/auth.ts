import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import nodemailer from 'nodemailer';
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

import { eq } from 'drizzle-orm';
import { invalidateUserCaches } from './performance-cache';

config({
  path: '.env.local',
});

// Инициализация Resend для отправки email
// Создание SMTP транспорта для mail.ru
const transporter = nodemailer.createTransport({
  host: serverEnv.SMTP_HOST,
  port: parseInt(serverEnv.SMTP_PORT),
  secure: true, // true для порта 465
  auth: {
    user: serverEnv.SMTP_USER,
    pass: serverEnv.SMTP_PASS,
  },
  tls: {
    // Игнорировать самоподписанные сертификаты
    rejectUnauthorized: false,
  },
});

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



export const auth = betterAuth({
  baseURL: serverEnv.BETTER_AUTH_URL,
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
        // Отправка magic link через SMTP mail.ru
        try {
          await transporter.sendMail({
            from: 'Vega AI <mail@vega.chat>',
            to: email,
            subject: 'Войти в Vega AI',
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
                    <h1 style="color: #2563eb; margin: 0;">Vega AI</h1>
                  </div>
                  
                  <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #1e293b; text-align: center;">Войти в аккаунт</h2>
                    <p style="margin: 0 0 25px 0; color: #64748b; text-align: center;">Нажмите на кнопку ниже, чтобы войти в свой аккаунт Vega AI:</p>
                    
                    <div style="text-align: center;">
                      <a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Войти в Vega AI</a>
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


    nextCookies(),
  ],
  trustedOrigins: ['http://localhost:3000', 'https://localhost:3000', 'https://vega.chat'],
  allowedOrigins: ['http://localhost:3000', 'https://localhost:3000', 'https://vega.chat'],
});
