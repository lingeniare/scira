'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { X } from 'lucide-react';
import Link from 'next/link';

export function CookieToast() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем toast только для неавторизованных пользователей
    if (!session?.user?.id) {
      // Проверяем, не был ли toast уже закрыт
      const wasClosed = localStorage.getItem('cookie-toast-closed');
      if (!wasClosed) {
        setIsVisible(true);
      }
    }
  }, [session?.user?.id]);

  const handleClose = () => {
    // Сохраняем информацию о закрытии в localStorage
    localStorage.setItem('cookie-toast-closed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-[100px] left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/95 dark:bg-[oklch(0.2134_0_0)]/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-5 py-1 flex items-center justify-between max-w-sm text-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              Мы используем{' '}
              <Link 
                href="/privacy-policy" 
                className="text-[oklch(0.4737_0.064_206.89)] dark:text-[oklch(0.83_0.12_75)] hover:underline font-semibold transition-colors duration-200 hover:opacity-80"
              >
                cookies
              </Link>
            </p>
            <button
              onClick={handleClose}
              className="ml-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Закрыть уведомление"
            >
              <X size={16} />
            </button>
          </div>
        </div>
  );
}