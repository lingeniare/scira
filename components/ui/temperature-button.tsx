'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
// Компонент для иконки sun-snow
const SunSnow = ({ size = 16, color = "currentColor", strokeWidth = 2, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`lucide lucide-sun-snow-icon lucide-sun-snow ${className}`}
  >
    <path d="M10 21v-1"/>
    <path d="M10 4V3"/>
    <path d="M10 9a3 3 0 0 0 0 6"/>
    <path d="m14 20 1.25-2.5L18 18"/>
    <path d="m14 4 1.25 2.5L18 6"/>
    <path d="m17 21-3-6 1.5-3H22"/>
    <path d="m17 3-3 6 1.5 3"/>
    <path d="M2 12h1"/>
    <path d="m20 10-1.5 2 1.5 2"/>
    <path d="m3.64 18.36.7-.7"/>
    <path d="m4.34 6.34-.7-.7"/>
  </svg>
);
import { cn } from '@/lib/utils';

interface TemperatureButtonProps {
  temperature: number;
  onTemperatureChange: (temperature: number) => void;
  disabled?: boolean;
}

const TemperatureButton: React.FC<TemperatureButtonProps> = ({
  temperature,
  onTemperatureChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);



  // Функция для получения описания температуры
  const getTemperatureDescription = (temp: number) => {
    if (temp <= 0.3) return 'Conservative - More focused and deterministic';
    if (temp <= 0.7) return 'Balanced - Good mix of creativity and focus';
    return 'Creative - More random and creative responses';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'w-8 h-8 rounded-full',
                'border border-border',
                'bg-background text-foreground',
                'hover:bg-accent transition-colors',
                'focus:!outline-none focus:!ring-0',
                'shadow-none',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              disabled={disabled}
            >
              <SunSnow 
                size={16} 
                color="currentColor" 
                strokeWidth={2}
                className="transition-colors duration-200"
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          className="border-0 backdrop-blur-xs py-2 px-3 !shadow-none"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-[11px]">
              Temperature: {temperature.toFixed(1)}
            </span>
            <span className="text-[10px] text-accent leading-tight">
              {getTemperatureDescription(temperature)}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
      
      <PopoverContent 
        className={cn(
          'w-80 p-4 border-0 backdrop-blur-md bg-background/95',
          'shadow-lg rounded-xl'
        )}
        side="top"
        sideOffset={8}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunSnow 
                size={16} 
                color="currentColor" 
                strokeWidth={2}
                className="transition-colors duration-200"
              />
              <span className="font-medium text-sm">AI Temperature</span>
            </div>
            <span className="text-sm font-mono bg-accent/20 px-2 py-1 rounded">
              {temperature.toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-3">
            <Slider
              value={[temperature]}
              onValueChange={(value) => onTemperatureChange(value[0])}
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0 (Focused)</span>
              <span>1.0 (Balanced)</span>
              <span>2.0 (Creative)</span>
            </div>
          </div>
          
          <div className="p-3 bg-accent/10 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getTemperatureDescription(temperature)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTemperatureChange(0.1)}
              className="flex-1 text-xs"
            >
              Conservative
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTemperatureChange(0.7)}
              className="flex-1 text-xs"
            >
              Balanced
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTemperatureChange(1.2)}
              className="flex-1 text-xs"
            >
              Creative
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TemperatureButton;