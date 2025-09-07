import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/env/server';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// Тестовый endpoint для проверки SMTP соединения
export async function GET() {
  try {
    // Готовим корректные типы и значения для транспорта
    const port = parseInt(serverEnv.SMTP_PORT, 10);
    const secure = port === 465;

    // Создаем транспорт c явно типизированными опциями SMTP
    const transportOptions: SMTPTransport.Options = {
      host: serverEnv.SMTP_HOST,
      port,
      secure,
      auth: {
        user: serverEnv.SMTP_USER,
        pass: serverEnv.SMTP_PASS,
      },
    };

    const transporter = nodemailer.createTransport(transportOptions);

    // Проверяем соединение
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: serverEnv.SMTP_HOST,
        port,
        user: serverEnv.SMTP_USER,
        secure,
      },
    });
  } catch (error) {
    console.error('SMTP Test Error:', error);
    // Возвращаем диагностическую информацию без утечки чувствительных данных
    const port = parseInt(serverEnv.SMTP_PORT, 10);
    const secure = port === 465;
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        config: {
          host: serverEnv.SMTP_HOST,
          port,
          user: serverEnv.SMTP_USER,
          secure,
        },
      },
      { status: 500 }
    );
  }
}

// Отправка тестового письма
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Готовим корректные типы и значения для транспорта
    const port = parseInt(serverEnv.SMTP_PORT, 10);
    const secure = port === 465;

    const transportOptions: SMTPTransport.Options = {
      host: serverEnv.SMTP_HOST,
      port,
      secure,
      auth: {
        user: serverEnv.SMTP_USER,
        pass: serverEnv.SMTP_PASS,
      },
    };

    const transporter = nodemailer.createTransport(transportOptions);

    // Отправляем тестовое письмо
    const info = await transporter.sendMail({
      from: serverEnv.SMTP_USER,
      to: email,
      subject: 'SMTP Test Email',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a test email to verify SMTP configuration.</p>',
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('SMTP Send Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}