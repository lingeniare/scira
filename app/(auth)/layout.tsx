'use client';

import Link from 'next/link';
import type React from 'react';
import { SciraLogo } from '@/components/logos/scira-logo';



export default function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex items-center justify-between h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 h-full bg-muted/30 flex-col">
        <div className="flex-1 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <SciraLogo className="size-8" />
              <span className="text-lg font-medium">Vega AI</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-3">VEGA AI - сервис, где находят ответы.</h2>
              <p className="text-muted-foreground">Лучшие AI-модели, передовые инструменты и гибкие тарифы.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Тарифы:
              </h3>

              <div className="w-full">
                <div className="relative h-full flex flex-col bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-6">
                  <div className="text-sm text-muted-foreground flex-1 space-y-2">
                    <p><span className="font-semibold text-foreground">Без авторизации</span> - 1 запрос в сутки</p>
                    <p><span className="font-semibold text-foreground">Free (бесплатный тариф)</span> - 5 запросов в день к Mini</p>
                    <p><span className="font-semibold text-foreground">Pro (1000 рублей в месяц)</span> - 30 запросов к Pro в день, безлимит к Mini</p>
                    <p><span className="font-semibold text-foreground">Ultra (2000 рублей в месяц)</span> - 30 запросов к Ultra в день, безлимит к Pro и Mini</p>
                    <p>
                      Подробнее о тарифах и что они включают, здесь {'>'} <Link href="/pricing" className="underline underline-offset-2 hover:text-foreground">/pricing</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a
                href="https://git.new/scira"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Открытый код
              </a>
              <span>•</span>
              <span>Живой поиск</span>
              <span>•</span>
              <span>Более 1М поисковых запросов</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Представлено на{' '}
              <a
                href="https://vega.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Vercel
              </a>{' '}
              •{' '}
              <a
                href="https://vega.chat"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                #1 Продукт недели на Peerlist
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center px-4 md:px-8">{children}</div>
    </div>
  );
}
