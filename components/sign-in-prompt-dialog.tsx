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

// Функция валидации email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

  // Проверка валидности email и согласия с условиями
  const isEmailValid = isValidEmail(email);
  const canProceed = termsAccepted && privacyAccepted;

  // Обработчик отправки Magic Link
  const handleMagicLink = async () => {
    if (!isEmailValid || !canProceed) return;
    
    setMagicLinkLoading(true);
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
        {/* Заголовок */}
        <div className="mb-6 text-center">
          <h2 className="text-lg font-medium text-foreground mb-1">Создать или войти в аккаунт</h2>
          <p className="text-sm text-muted-foreground">чтобы получить больше возможностей</p>
        </div>

        {/* Magic Link секция */}
        <div className="space-y-3 mb-0">
          <div className="space-y-2 text-center">

            <Button
              variant="outline"
              className="relative w-full h-10 px-4 font-normal text-sm justify-center"
              disabled={magicLinkLoading}
              onClick={() => {
                // Фокус на поле ввода при клике на кнопку
                document.getElementById('email')?.focus();
              }}
            >
              <Input
                id="email"
                type="email"
                placeholder="Войти через Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-full"
                style={{ backgroundColor: 'transparent' }}
                disabled={magicLinkLoading}
              />
            </Button>
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
              className="mt-0.5 transition-all duration-200"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
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
              className="mt-0.5 transition-all duration-200"
            />
            <label htmlFor="privacy" className="text-xs text-muted-foreground leading-relaxed">
              Я принимаю{' '}
              <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                Политику обработки персональных данных
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
      </DialogContent>
    </Dialog>
  );
}
