import { wrapLanguageModel, customProvider, extractReasoningMiddleware } from 'ai';

import { openai, createOpenAI } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

const huggingface = createOpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HF_TOKEN,
});

// OpenRouter провайдер для замены OpenAI
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const scira = customProvider({
  languageModels: {
    'scira-default': openrouter.chat('openai/gpt-5-nano'),
    'scira-grok-3': xai('grok-3-fast'),
    'scira-grok-4': xai('grok-4'),
   
    // Новые модели через OpenRouter
    'scira-5-nano': openrouter.chat('openai/gpt-5-nano'),
    'scira-5-mini': openrouter.chat('openai/gpt-5-mini'),
    'scira-5': openrouter.chat('openai/gpt-5-chat'),

    'scira-glm': wrapLanguageModel({
      model: huggingface.chat('zai-org/GLM-4.5:fireworks-ai'),
      middleware,
    }),
    'scira-glm-air': huggingface.chat('zai-org/GLM-4.5-Air:fireworks-ai'),
    'scira-qwen-235': huggingface.chat('Qwen/Qwen3-235B-A22B-Instruct-2507:together'),
    'scira-kimi-k2': groq('moonshotai/kimi-k2-instruct'),
    'scira-mistral-medium': mistral('mistral-medium-2508'),
    'scira-google-lite': google('gemini-2.5-flash-lite'),
    'scira-google': google('gemini-2.5-flash'),
    'scira-google-pro': google('gemini-2.5-pro'),
    'scira-anthropic': anthropic('claude-sonnet-4-20250514'),
    'scira-llama-4': groq('meta-llama/llama-4-maverick-17b-128e-instruct'),
    
    // Новые модели через OpenRouter

    'scira-kimi-k2-new': openrouter.chat('moonshotai/kimi-k2'),
    'scira-glm-4-5v': openrouter.chat('z-ai/glm-4.5v'),
    
    // DeepSeek V3.1 модели
    'scira-deepseek-chat': deepseek.chat('deepseek-chat'),
    'scira-deepseek-reasoner': wrapLanguageModel({
      model: deepseek.chat('deepseek-reasoner'),
      middleware,
    })
  },
});

interface Model {
  value: string;
  label: string;
  description: string;
  vision: boolean;
  reasoning: boolean;
  experimental: boolean;
  category: string;
  pdf: boolean;
  pro: boolean;
  ultra: boolean; // Новое поле для Ultra моделей
  requiresAuth: boolean;
  freeUnlimited: boolean;
  maxOutputTokens: number;
}

export const models: Model[] = [
  // Mini Models
  {
    value: 'scira-5-nano',
    label: 'GPT 5 Nano',
    description: "OpenAI's latest flagship nano LLM (via OpenRouter)",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Mini',
    pdf: true,
    pro: false,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 128000,
  },
  {
    value: 'scira-google-lite',
    label: 'Gemini 2.5 Flash Lite',
    description: "Google's advanced smallest LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Mini',
    pdf: true,
    pro: false,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 10000,
  },

  // Pro Models
  {
    value: 'scira-default',
    label: 'Grok 3 Mini',
    description: "xAI's most efficient reasoning LLM.",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'scira-5-mini',
    label: 'GPT 5 Mini',
    description: "OpenAI's latest flagship mini LLM (via OpenRouter)",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 128000,
  },
  {
    value: 'scira-google',
    label: 'Gemini 2.5 Flash',
    description: "Google's advanced small LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-kimi-k2-new',
    label: 'Kimi K2',
    description: "MoonShot AI's advanced base LLM",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 200000,
  },
  {
    value: 'scira-glm-4-5v',
    label: 'GLM 4.5V',
    description: "Zhipu AI's multimodal model with vision capabilities",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
  {
    value: 'scira-deepseek-chat',
    label: 'DeepSeek V3.1 Chat',
    description: "DeepSeek's advanced model",
    vision: true,
    reasoning: false,
    experimental: false,
    category: 'Pro',
    pdf: true,
    pro: true,
    ultra: false,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 8192,
  },

  // Ultra Models
  {
    value: 'scira-grok-4',
    label: 'Grok 4',
    description: "xAI's most intelligent vision LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Ultra',
    pdf: true,
    pro: false,
    ultra: true,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 16000,
  },
  {
    value: 'scira-5',
    label: 'GPT 5',
    description: "OpenAI's latest flagship LLM (via OpenRouter)",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Ultra',
    pdf: true,
    pro: false,
    ultra: true,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 128000,
  },
  {
    value: 'scira-anthropic',
    label: 'Claude 4 Sonnet',
    description: "Anthropic's most advanced LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Ultra',
    pdf: true,
    pro: false,
    ultra: true,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 8000,
  },
  {
    value: 'scira-google-pro',
    label: 'Gemini 2.5 Pro',
    description: "Google's most advanced LLM",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Ultra',
    pdf: true,
    pro: false,
    ultra: true,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 10000,
  },
  {
    value: 'scira-deepseek-reasoner',
    label: 'DeepSeek V3.1 Reasoner',
    description: "DeepSeek's reasoning model with advanced problem-solving capabilities",
    vision: true,
    reasoning: true,
    experimental: false,
    category: 'Ultra',
    pdf: true,
    pro: false,
    ultra: true,
    requiresAuth: false,
    freeUnlimited: false,
    maxOutputTokens: 8192,
  },
];

// Helper functions for model access checks
export function getModelConfig(modelValue: string) {
  return models.find((model) => model.value === modelValue);
}

export function requiresAuthentication(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.requiresAuth || false;
}

export function requiresProSubscription(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pro || false;
}

export function requiresUltraSubscription(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.ultra || false;
}

export function isFreeUnlimited(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.freeUnlimited || false;
}

export function hasVisionSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.vision || false;
}

export function hasPdfSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.pdf || false;
}

export function hasReasoningSupport(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.reasoning || false;
}

export function isExperimentalModel(modelValue: string): boolean {
  const model = getModelConfig(modelValue);
  return model?.experimental || false;
}

export function getMaxOutputTokens(modelValue: string): number {
  const model = getModelConfig(modelValue);
  return model?.maxOutputTokens || 8000;
}

// Access control helper
export function canUseModel(modelValue: string, user: any, isProUser: boolean, isUltraUser?: boolean): { canUse: boolean; reason?: string } {
  const model = getModelConfig(modelValue);

  if (!model) {
    return { canUse: false, reason: 'Model not found' };
  }

  // Check if model requires authentication
  if (model.requiresAuth && !user) {
    return { canUse: false, reason: 'authentication_required' };
  }

  // Check if model requires Ultra subscription
  if (model.ultra && !isUltraUser) {
    return { canUse: false, reason: 'ultra_subscription_required' };
  }

  // Check if model requires Pro subscription (but not Ultra)
  if (model.pro && !isProUser && !isUltraUser) {
    return { canUse: false, reason: 'pro_subscription_required' };
  }

  return { canUse: true };
}

// Helper to check if user should bypass rate limits
export function shouldBypassRateLimits(modelValue: string, user: any): boolean {
  const model = getModelConfig(modelValue);
  return Boolean(user && model?.freeUnlimited);
}

// Get acceptable file types for a model
export function getAcceptedFileTypes(modelValue: string, isProUser: boolean): string {
  const model = getModelConfig(modelValue);
  if (model?.pdf && isProUser) {
    return 'image/*,.pdf';
  }
  return 'image/*';
}

// Legacy arrays for backward compatibility (deprecated - use helper functions instead)
export const authRequiredModels = models.filter((m) => m.requiresAuth).map((m) => m.value);
export const proRequiredModels = models.filter((m) => m.pro).map((m) => m.value);
export const freeUnlimitedModels = models.filter((m) => m.freeUnlimited).map((m) => m.value);