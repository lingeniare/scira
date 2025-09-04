// Search limits for free users
export const SEARCH_LIMITS = {
  DAILY_SEARCH_LIMIT: 100,
  EXTREME_SEARCH_LIMIT: 10,
  // Лимиты для mini models
  UNAUTHENTICATED_MINI_MODELS_LIMIT: 5, // Лимит для неаутентифицированных пользователей
  FREE_USER_MINI_MODELS_LIMIT: 10, // Лимит для бесплатных пользователей
} as const;

export const PRICING = {
  PRO_MONTHLY: 15, // USD
  PRO_MONTHLY_INR: 1000, // INR for Indian users (1000₽)
  ULTRA_MONTHLY: 25, // USD
  ULTRA_MONTHLY_INR: 2000, // INR for Indian users (2000₽)
} as const;

export const CURRENCIES = {
  USD: 'USD',
  INR: 'INR',
} as const;

export const SNAPSHOT_NAME = 'scira-analysis:1752127473';
