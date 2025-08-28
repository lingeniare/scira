'use client';

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { BinocularsIcon, Archive01Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  children?: React.ReactNode;
  variant?: 'default' | 'dashed';
}

export function EmptyState({
  icon = BinocularsIcon,
  title,
  description,
  children,
  variant = 'dashed',
}: EmptyStateProps) {
  return (
    <Card className={variant === 'dashed' ? 'border-dashed shadow-none' : 'shadow-none'}>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <HugeiconsIcon
            icon={icon}
            size={20}
            color="currentColor"
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        </div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{description}</p>
        {children}
      </CardContent>
    </Card>
  );
}

// Preset empty states for common scenarios
export function NoActiveLookoutsEmpty() {
  return (
    <EmptyState
      icon={BinocularsIcon}
      title="Начните с добавления lookout"
      description="Запланируйте lookout для автоматизации поиска и получения уведомлений о завершении."
    />
  );
}

export function NoArchivedLookoutsEmpty() {
  return (
    <EmptyState
      icon={Archive01Icon}
      title="Нет архивированных lookout"
      description="Архивированные lookout будут отображаться здесь."
      variant="default"
    />
  );
}
