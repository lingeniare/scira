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
    id: 'web' as const,
    name: 'Web',
    description: 'Поиск по всему интернету на базе Exa AI',
    icon: GlobalSearchIcon,
    show: true,
  },
    {
    id: 'chat' as const,
    name: 'Chat',
    description: 'Общение с моделью напрямую.',
    icon: ChattingIcon,
    show: true,
  },
    {
    id: 'academic' as const,
    name: 'Academic',
    description: 'Поиск научных статей на базе Exa',
    icon: MicroscopeIcon,
    show: true,
  },
  {
    id: 'x' as const,
    name: 'X',
    description: 'Поиск постов в X',
    icon: NewTwitterIcon,
    show: false, // Скрыто по запросу пользователя
  },
  {
    id: 'stocks' as const,
    name: 'Stocks',
    description: 'Информация об акциях и валютах',
    icon: AppleStocksIcon,
    show: true,
  },
  {
    id: 'reddit' as const,
    name: 'Reddit',
    description: 'Поиск постов в Reddit',
    icon: RedditIcon,
    show: false, // Скрыто по запросу пользователя
  },
  {
    id: 'memory' as const,
    name: 'Memory',
    description: 'Ваш персональный помощник памяти',
    icon: Database02Icon,
    show: true,
    requireAuth: true,
  },
  {
    id: 'crypto' as const,
    name: 'Crypto',
    description: 'Исследование криптовалют на базе CoinGecko',
    icon: Bitcoin02Icon,
    show: true,
  },
  {
    id: 'youtube' as const,
    name: 'YouTube',
    description: 'Поиск видео YouTube на базе Exa',
    icon: YoutubeIcon,
    show: true,
  },
  {
    id: 'extreme' as const,
    name: 'Extreme',
    description: 'Глубокое исследование с множественными источниками и анализом',
    icon: AtomicPowerIcon,
    show: true,
  },
] as const;

export type SearchGroup = (typeof searchGroups)[number];

export function invalidateChatsCache() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('invalidate-chats-cache');
    window.dispatchEvent(event);
  }
}
