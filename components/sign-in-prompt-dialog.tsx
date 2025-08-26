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
const VKButton = ({ disabled, loading }: { disabled: boolean; loading: boolean }) => {
  return (
    <Button
      variant="outline"
      className="relative w-full h-10 px-4 font-normal text-sm"
      disabled={disabled || loading}
      onClick={() => {
        // TODO: Реализовать авторизацию через VK
        console.log('VK authorization');
      }}
    >
      <div className="flex items-center justify-center w-full gap-3">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-.908-1.49.402v1.608c0 .432-.138.69-1.276.69-1.898 0-4.004-1.15-5.494-3.29-2.242-3.229-2.856-5.648-2.856-6.134 0-.432.174-.624.462-.624h1.744c.346 0 .476.174.61.58.675 2.074 1.744 3.894 2.186 2.448.35-1.148.35-3.674-.174-4.158-.35-.346-.99-.268-1.398-.19.99-1.496 2.884-1.51 3.554-1.51 1.744 0 2.23.174 2.23 1.38v2.23c0 .346.158 1.49.726 1.49.432 0 .864-.268 2.174-1.588 1.24-1.24 2.07-2.91 2.07-2.91.138-.268.346-.432.726-.432h1.744c1.05 0 .864.538.432 1.27-.692 1.183-3.207 4.026-3.207 4.026-.432.538-.346.778 0 1.27 0 0 2.515 2.701 2.784 3.623.138.462-.268.924-.578.924z"/>
            </svg>
            <span>Войти через VK</span>
          </>
        )}
      </div>
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
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-1">Войти в аккаунт</h2>
          <p className="text-sm text-muted-foreground">Сохраняйте беседы и синхронизируйте между устройствами</p>
        </div>

        {/* Magic Link секция */}
        <div className="space-y-3 mb-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email адрес
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10"
                disabled={magicLinkLoading}
              />
            </div>
          </div>
          
          {/* Кнопка Magic Link появляется только при валидном email */}
          {isEmailValid && (
            <Button
              onClick={handleMagicLink}
              disabled={!canProceed || magicLinkLoading}
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
        <div className="mb-4">
          <VKButton disabled={!canProceed} loading={vkLoading} />
        </div>

        {/* Чекбоксы согласия */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              className="mt-0.5"
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
              className="mt-0.5"
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
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
            Политику обработки персональных данных
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
