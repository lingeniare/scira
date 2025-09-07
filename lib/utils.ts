// /lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  GlobalSearchIcon,
  Database02Icon,
  AtomicPowerIcon,
  Bitcoin02Icon,
  MicroscopeIcon,
  NewTwitterIcon,
  RedditIcon,
  YoutubeIcon,
  ChattingIcon,
  AppleStocksIcon,
} from '@hugeicons/core-free-icons';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SearchGroupId =
  | 'web'
  | 'x'
  | 'academic'
  | 'youtube'
  | 'reddit'
  | 'stocks'
  | 'chat'
  | 'extreme'
  | 'memory'
  | 'crypto';

export const searchGroups = [
  {
    id: 'chat' as const,
    name: 'Чат',
    description: 'Общение c AI',
    icon: ChattingIcon,
    show: true,
    requiresPro: false, // Доступен всем пользователям
  },
  {
    id: 'web' as const,
    name: 'Веб',
    description: 'AI поиск в интернете',
    icon: GlobalSearchIcon,
    show: true,
    requiresPro: true, // Требует Pro подписку
  },
    {
    id: 'academic' as const,
    name: 'Наука',
    description: 'Поиск научных статей',
    icon: MicroscopeIcon,
    show: true,
    requiresPro: true, // Требует Pro подписку
  },
  {
    id: 'x' as const,
    name: 'X',
    description: 'Поиск постов в X',
    icon: NewTwitterIcon,
    show: false, // Скрыто по запросу пользователя
    requiresPro: true, // Требует Pro подписку
  },
  {
    id: 'stocks' as const,
    name: 'Котировки',
    description: 'Информация об акциях и валюте',
    icon: AppleStocksIcon,
    show: true,
    requiresPro: true, // Требует Pro подписку
  },
  {
    id: 'reddit' as const,
    name: 'Reddit',
    description: 'Поиск постов в Reddit',
    icon: RedditIcon,
    show: false, // Скрыто по запросу пользователя
    requiresPro: true, // Требует Pro подписку
  },
  {
    id: 'memory' as const,
    name: 'Память',
    description: 'Ваш помощник памяти',
    icon: Database02Icon,
    show: false,
    requireAuth: true,
    requiresPro: true, // Требует Pro подписку
  },
  {
    id: 'crypto' as const,
    name: 'Крипта',
    description: 'Анализ критовалют',
    icon: Bitcoin02Icon,
    show: true,
    requiresPro: true, // Требует Pro подписку
  },
  {
    id: 'youtube' as const,
    name: 'YouTube',
    description: 'Поиск видео на YouTube',
    icon: YoutubeIcon,
    show: true,
    requiresPro: true, // Требует Pro подписку
  },
  {
    id: 'extreme' as const,
    name: 'Extreme',
    description: 'Глубокое исследование и анализ',
    icon: AtomicPowerIcon,
    show: true,
    requiresPro: true, // Требует Pro подписку
  },
] as const;

export type SearchGroup = (typeof searchGroups)[number];

export function invalidateChatsCache() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('invalidate-chats-cache');
    window.dispatchEvent(event);
  }
}
