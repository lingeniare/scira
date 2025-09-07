import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Экспортируем обработчики напрямую
export const { GET, POST } = toNextJsHandler(auth.handler);