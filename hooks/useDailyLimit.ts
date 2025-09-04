import { useState, useEffect } from 'react';
import { SEARCH_LIMITS } from '@/lib/constants';
import { ComprehensiveUserData } from '@/lib/user-data-server';

// Функциональный комментарий: Хук для отслеживания ежедневных лимитов запросов на mini models
// Использует localStorage для хранения счетчика и даты
// Лимиты: 5 для неаутентифицированных, 10 для бесплатных аутентифицированных

export function useDailyLimit(user: ComprehensiveUserData | null) {
  const isAuthenticated = !!user;
  const isFreeUser = isAuthenticated && !user.isProUser && !user.isUltraUser;
  const dailyLimit = !isAuthenticated 
    ? SEARCH_LIMITS.UNAUTHENTICATED_MINI_MODELS_LIMIT 
    : (isFreeUser ? SEARCH_LIMITS.FREE_USER_MINI_MODELS_LIMIT : Infinity);

  const [requestsToday, setRequestsToday] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('limitDate');
    const storedCount = parseInt(localStorage.getItem('requestCount') || '0', 10);

    if (storedDate !== today) {
      localStorage.setItem('limitDate', today);
      localStorage.setItem('requestCount', '0');
      setRequestsToday(0);
    } else {
      setRequestsToday(storedCount);
    }
  }, []);

  const increment = () => {
    const newCount = requestsToday + 1;
    setRequestsToday(newCount);
    localStorage.setItem('requestCount', newCount.toString());
  };

  const isLimitExceeded = requestsToday >= dailyLimit;

  return { isLimitExceeded, increment, dailyLimit };
}