'use client';

import React from 'react';
import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, User, Crown, Clock, Trash2 } from 'lucide-react';

interface UserCacheStatusProps {
  className?: string;
}

export function UserCacheStatus({ className }: UserCacheStatusProps) {
  const { user, isLoading, isProUser, isCached, clearCache, refetch, isRefetching, subscriptionStatus, proSource } =
    useUser();

  const handleClearCache = () => {
    clearCache();
    // Optionally refetch after clearing
    setTimeout(() => refetch(), 100);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4" />
          Статус кэша пользователя
          <div className="flex gap-1 ml-auto">
            <Badge variant={isCached ? 'default' : 'secondary'} className="text-xs">
              {isCached ? '💾 Кэшировано' : '🌐 Свежие данные'}
            </Badge>
            {isLoading && (
              <Badge variant="outline" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Загрузка
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Info */}
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Имя:</span>
              <span className="text-sm font-medium">{user.name || 'Н/Д'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm font-medium truncate max-w-[150px]">{user.email || 'Н/Д'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pro статус:</span>
              <div className="flex items-center gap-1">
                {isProUser && <Crown className="h-3 w-3 text-yellow-500" />}
                <span className="text-sm font-medium">{isProUser ? 'Pro пользователь' : 'Бесплатный пользователь'}</span>
              </div>
            </div>

            {isProUser && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Источник:</span>
                  <Badge variant="outline" className="text-xs">
                    {proSource}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Подписка:</span>
                  <Badge variant={subscriptionStatus === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {subscriptionStatus}
                  </Badge>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ID пользователя:</span>
              <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{user.id.slice(-8)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Данные пользователя недоступны</p>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-xs">Загрузка данных пользователя...</span>
              </div>
            )}
          </div>
        )}

        {/* Cache Performance Info */}
        <div className="border-t pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-muted-foreground">Время загрузки: {isCached ? '~0мс' : '~300мс'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${isCached ? 'bg-green-500' : 'bg-blue-500'}`} />
              <span className="text-muted-foreground">{isCached ? 'Мгновенно' : 'Сеть'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching} className="flex-1">
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>

          <Button variant="outline" size="sm" onClick={handleClearCache} disabled={!isCached} className="flex-1">
            <Trash2 className="h-3 w-3 mr-1" />
            Очистить кэш
          </Button>
        </div>

        {/* Cache Info */}
        {isCached && (
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">
              💡 Эти данные были загружены мгновенно из кэша localStorage. Свежие данные загружаются в фоновом режиме
              для следующего раза.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
