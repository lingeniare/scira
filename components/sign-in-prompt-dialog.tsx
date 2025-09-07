'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { signIn } from '@/lib/auth-client';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

interface SignInPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Функция валидации email с улучшенной проверкой
const isValidEmail = (email: string): boolean => {
  // Проверяем базовую структуру и отсутствие недопустимых символов
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Дополнительные проверки
  if (!email || email.length > 254) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('..')) return false;
  if (email.split('@').length !== 2) return false;
  
  return emailRegex.test(email);
};

// Компонент кнопки VK
const VKButton = ({ disabled, loading, onClick }: { disabled: boolean; loading: boolean; onClick: () => void }) => {
  return (
    <Button
      variant="outline"
      className="relative w-full h-10 px-4 font-normal text-sm"
      disabled={loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Загрузка...
        </>
      ) : (
        'Войти через VK'
      )}
    </Button>
  );
};

export function SignInPromptDialog({ open, onOpenChange }: SignInPromptDialogProps) {
  const [email, setEmail] = useState('');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [vkLoading, setVkLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  // Проверка валидности email и согласия с условиями
  const isEmailValid = isValidEmail(email);
  const canProceed = termsAccepted && privacyAccepted;

  // Обработчик отправки Magic Link
  const handleMagicLink = async () => {
    if (!isEmailValid || !canProceed) return;
    
    setMagicLinkLoading(true);
    try {
      // Отправляем Magic Link через Better Auth client (плагин magicLinkClient)
      // Функционал: обращаемся к серверному эндпоинту Better Auth POST /api/auth/sign-in/magic-link через клиент
      const { error } = await signIn.magicLink({
        email,
        // При необходимости можно добавить callbackURL/newUserCallbackURL/errorCallbackURL
      });

      if (error) {
        throw new Error(error.message || 'Failed to send magic link');
      }

      setMagicLinkSent(true);
    } catch (error) {
      console.error('Ошибка отправки Magic Link:', error);
    } finally {
      setMagicLinkLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-6 gap-0">
        {magicLinkSent ? (
          // Уведомление об отправке Magic Link
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-foreground mb-1">Ссылка для входа отправлена</h2>
              <p className="text-sm text-muted-foreground">
                на <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Проверьте почту и перейдите по ссылке для входа
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setMagicLinkSent(false);
                setEmail('');
              }}
              className="w-full"
            >
              Отправить на другой email
            </Button>
          </div>
        ) : (
          // Основная форма авторизации
          <>
            {/* Заголовок */}
            <div className="mb-6 text-center">
              <h2 className="text-lg font-medium text-foreground mb-1">Создайте или войдите в аккаунт</h2>
              <p className="text-sm text-muted-foreground">чтобы получить больше возможностей</p>
            </div>

        {/* Magic Link секция */}
        <div className="space-y-3 mb-0">
          <div className="space-y-2 text-center">
            {/* Поле ввода email без фона кнопки */}
            <div className="relative w-full">
              <Input
                id="email"
                type="email"
                placeholder={isEmailFocused || email ? "" : "Войти через Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                className="w-full h-10 px-4 text-sm text-center border border-input rounded-md bg-transparent placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors"
                disabled={magicLinkLoading}
              />
              {/* Показываем placeholder как отдельный элемент когда поле не в фокусе и пустое */}
              {!isEmailFocused && !email && (
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm text-muted-foreground"
                  onClick={() => document.getElementById('email')?.focus()}
                >
                  Войти через Email
                </div>
              )}
            </div>
          </div>
          
          {/* Кнопка Magic Link появляется только при валидном email */}
          {isEmailValid && (
            <Button
              onClick={() => {
                if (!canProceed) {
                  // Подсветка чекбоксов с анимацией
                  const termsCheckbox = document.getElementById('terms');
                  const privacyCheckbox = document.getElementById('privacy');
                  
                  if (!termsAccepted && termsCheckbox) {
                    termsCheckbox.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                      termsCheckbox.style.animation = '';
                    }, 500);
                  }
                  
                  if (!privacyAccepted && privacyCheckbox) {
                    privacyCheckbox.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                      privacyCheckbox.style.animation = '';
                    }, 500);
                  }
                  return;
                }
                handleMagicLink();
              }}
              disabled={magicLinkLoading}
              className="w-full h-10"
              variant={magicLinkSent ? "secondary" : "default"}
            >
              {magicLinkLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Отправляем...
                </>
              ) : magicLinkSent ? (
                'Ссылка отправлена!'
              ) : (
                'Получить ссылку'
              )}
            </Button>
          )}
        </div>

        {/* Разделитель */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-background text-muted-foreground">или</span>
          </div>
        </div>

        {/* Кнопка VK */}
        <div className="mb-6">
          <VKButton 
            disabled={false} 
            loading={vkLoading} 
            onClick={() => {
              if (!canProceed) {
                // Подсветка чекбоксов с анимацией
                const termsCheckbox = document.getElementById('terms');
                const privacyCheckbox = document.getElementById('privacy');
                
                if (!termsAccepted && termsCheckbox) {
                  termsCheckbox.style.animation = 'shake 0.5s ease-in-out';
                  setTimeout(() => {
                    termsCheckbox.style.animation = '';
                  }, 500);
                }
                
                if (!privacyAccepted && privacyCheckbox) {
                  privacyCheckbox.style.animation = 'shake 0.5s ease-in-out';
                  setTimeout(() => {
                    privacyCheckbox.style.animation = '';
                  }, 500);
                }
                return;
              }
              // TODO: Реализовать авторизацию через VK
              console.log('VK authorization');
            }}
          />
        </div>

        {/* Чекбоксы согласия */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5 transition-all duration-200 text-foreground"
            />
            <label htmlFor="terms" className="text-xs text-foreground leading-relaxed">
              Я принимаю{' '}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
                Условия использования
              </Link>
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
              className="mt-0.5 transition-all duration-200 text-foreground"
            />
            <label htmlFor="privacy" className="text-xs text-foreground leading-relaxed">
              Я принимаю{' '}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                Политику обработки данных
              </Link>
            </label>
          </div>
        </div>

        {/* Кнопка продолжения без аккаунта */}
        <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full h-10 font-normal text-sm">
          Продолжить без аккаунта
        </Button>

        {/* Текст согласия */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Используя сервис вы принимаете{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Условия
          </Link>
          {' & '}
          <br />
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
            Политику обработки персональных данных
          </Link>
        </p>
        
            {/* CSS для анимации shake */}
            <style jsx>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                20%, 40%, 60%, 80% { transform: translateX(2px); }
              }
            `}</style>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
