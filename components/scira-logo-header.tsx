import React from 'react';
import { SciraLogo } from './logos/scira-logo';
import { getModelConfig } from '@/ai/providers';

interface VegaLogoHeaderProps {
  selectedModel?: string;
}

export const VegaLogoHeader = ({ selectedModel }: VegaLogoHeaderProps) => {
  const modelConfig = selectedModel ? getModelConfig(selectedModel) : null;
  
  return (
    <div className="flex items-center gap-2">
      <SciraLogo className="size-7" />
      <div className="flex items-center gap-1">
        <h2 className="text-xl font-normal font-roboto text-foreground dark:text-foreground">Vega</h2>
        {modelConfig && (
          <span 
            className="font-medium self-end" 
            style={{ 
              fontSize: '0.7rem',
              color: 'hsl(var(--primary))'
            }}
          >
            {modelConfig.label}
          </span>
        )}
      </div>
    </div>
  );
};
