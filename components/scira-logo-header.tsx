import React from 'react';
import { SciraLogo } from './logos/scira-logo';

export const VegaLogoHeader = () => (
  <div className="flex items-center gap-2">
    <SciraLogo className="size-7" />
    <h2 className="text-xl font-normal font-roboto text-foreground dark:text-foreground">Vega</h2>
  </div>
);
