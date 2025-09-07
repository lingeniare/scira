'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { authClient } from '@/lib/auth-client';

interface AuthCardProps {
  title: string;
  description: string;
  mode: 'sign-in' | 'sign-up';
}

export default function AuthCard({ title, description, mode }: AuthCardProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [shakeCheckboxes, setShakeCheckboxes] = useState(false);
  const [shakeEmailField, setShakeEmailField] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false); // Состояние фокуса поля email

  // Проверка валидности email с улучшенной валидацией
  const isValidEmail = (email: string) => {
    // RFC 5322 совместимый regex для email валидации
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Дополнительные проверки
    if (!email || email.length > 254) return false; // Максимальная длина email
    if (email.startsWith('.') || email.endsWith('.')) return false; // Не должен начинаться или заканчиваться точкой
    if (email.includes('..')) return false; // Не должен содержать последовательные точки
    if ((email.match(/@/g) || []).length !== 1) return false; // Должен содержать ровно один @
    
    return emailRegex.test(email);
  };

  // Проверка готовности формы
  const isFormReady = isValidEmail(email) && privacyAccepted && termsAccepted;

  // Функция для анимации вибрации чекбоксов
  const triggerCheckboxShake = () => {
    setShakeCheckboxes(true);
    setTimeout(() => setShakeCheckboxes(false), 600);
  };

  // Функция для анимации поля email
  const triggerEmailFieldShake = () => {
    setShakeEmailField(true);
    setTimeout(() => setShakeEmailField(false), 600);
  };

  const handleMagicLinkSignIn = async () => {
    // Проверяем согласие с условиями
    if (!privacyAccepted || !termsAccepted) {
      triggerCheckboxShake();
      return;
    }

    // Проверяем валидность email
    if (!isValidEmail(email)) {
      triggerEmailFieldShake();
      return;
    }

    setLoading(true);
    try {
      // Отправка magic link через Better Auth
      await authClient.signIn.magicLink({
        email,
        callbackURL: '/',
      });
      setEmailSent(true);
    } catch (error) {
      console.error('Ошибка отправки magic link:', error);
    } finally {
      setLoading(false);
    }
  };

  // Авторизация через VK
  const handleVKSignIn = async () => {
    // Проверяем согласие с условиями
    if (!privacyAccepted || !termsAccepted) {
      triggerCheckboxShake();
      return;
    }

    try {
      await authClient.signIn.social({
        provider: 'vk',
        callbackURL: '/'
      });
    } catch (error) {
      console.error('Ошибка авторизации через VK:', error);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="rounded-lg border shadow-sm p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="pt-6 space-y-4 text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Ссылка для входа отправлена на {email}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                Проверьте почту и перейдите по ссылке для входа
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="w-full"
            >
              Отправить на другой email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-lg border shadow-sm p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="pt-6 space-y-4">
          {/* Email поле */}
          <div className={`space-y-2 transition-transform duration-150 ${shakeEmailField ? 'animate-pulse' : ''}`}>
            <Input
              type="email"
              placeholder={isEmailFocused || email ? '' : 'Войти через Email'} // Убираем placeholder при фокусе или наличии текста
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsEmailFocused(true)} // Устанавливаем фокус
              onBlur={() => setIsEmailFocused(false)} // Убираем фокус
              className={`text-center transition-all duration-200 ${shakeEmailField ? 'animate-bounce ring-2 ring-red-400 ring-opacity-75' : ''} ${isEmailFocused ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
              disabled={loading}
            />
          </div>

          {/* Кнопка входа по ссылке */}
          <Button
            onClick={handleMagicLinkSignIn}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Отправляем...' : 'Клик'}
          </Button>

          {/* Разделитель */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-muted-foreground">или</span>
            </div>
          </div>

          {/* Кнопка авторизации через VK */}
          <Button
            onClick={handleVKSignIn}
            variant="outline"
            className="w-full"
          >
            Войти через VK
          </Button>

          {/* Чекбоксы */}
          <div className={`space-y-3 transition-transform duration-150 ${shakeCheckboxes ? 'animate-pulse' : ''}`}>
            <div className={`flex items-start space-x-2 ${shakeCheckboxes ? 'animate-bounce' : ''}`}>
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                className={`mt-0.5 text-foreground ${shakeCheckboxes ? 'ring-2 ring-red-400 ring-opacity-75' : ''}`}
              />
              <label htmlFor="privacy" className="text-[11px] text-foreground leading-relaxed">
                Согласие с{' '}
                <Link 
                  href="/privacy-policy" 
                  target="_blank"
                  className="text-foreground underline-offset-2 underline"
                >
                  политикой обработки персональных данных
                </Link>
              </label>
            </div>

            <div className={`flex items-start space-x-2 ${shakeCheckboxes ? 'animate-bounce' : ''}`}>
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className={`mt-0.5 text-foreground ${shakeCheckboxes ? 'ring-2 ring-red-400 ring-opacity-75' : ''}`}
              />
              <label htmlFor="terms" className="text-[11px] text-foreground leading-relaxed">
                Согласие с{' '}
                <Link 
                  href="/terms" 
                  target="_blank"
                  className="text-foreground underline-offset-2 underline"
                >
                  условиями сервиса
                </Link>
              </label>
            </div>
          </div>

          {/* Забыли Email */}
          <div className="pt-4">
            <p className="text-sm text-center text-muted-foreground">
              Забыли Email? {' '}
              <Link 
                href="mailto:help@vega.chat" 
                className="text-foreground font-medium hover:underline underline-offset-4"
              >
                help@vega.chat
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
