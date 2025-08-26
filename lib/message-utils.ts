import { Message } from '@/lib/db/schema';
import { UIMessagePart } from 'ai';
import { ChatMessage, ChatTools, CustomUIDataTypes } from '@/lib/types';
import { formatISO } from 'date-fns';

/**
 * Конвертирует сообщения из базы данных в формат UI
 */
export function convertToUIMessages(messages: Message[]): ChatMessage[] {
  console.log('Messages: ', messages);

  return messages.map((message) => {
    // Handle the parts array which comes from JSON in the database
    const partsArray = Array.isArray(message.parts) ? message.parts : [];
    const convertedParts = partsArray
      // First convert legacy tool invocations
      .map((part: unknown) => convertLegacyToolInvocation(part))
      // Then convert legacy reasoning parts
      .map((part: unknown) => convertLegacyReasoningPart(part));

    return {
      id: message.id,
      role: message.role as 'user' | 'assistant' | 'system',
      parts: convertedParts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
      metadata: {
        createdAt: formatISO(message.createdAt),
      },
    };
  });
}

/**
 * Конвертирует устаревшие вызовы инструментов в новый формат
 */
function convertLegacyToolInvocation(part: unknown): unknown {
  // Check if this is a legacy tool-invocation part
  if (
    typeof part === 'object' &&
    part !== null &&
    'type' in part &&
    part.type === 'tool-invocation' &&
    'toolInvocation' in part &&
    typeof part.toolInvocation === 'object' &&
    part.toolInvocation !== null &&
    'toolName' in part.toolInvocation
  ) {
    const toolInvocation = part.toolInvocation as {
      toolName: string;
      toolCallId: string;
      state: string;
      args: unknown;
      result: unknown;
    };

    // Map old state to new state
    const mapState = (oldState: string): string => {
      switch (oldState) {
        case 'result':
          return 'output-available';
        case 'partial-result':
          return 'input-available';
        case 'call':
          return 'input-streaming';
        default:
          return oldState; // Keep unknown states as-is
      }
    };

    // Return the new format
    return {
      type: `tool-${toolInvocation.toolName}`,
      toolCallId: toolInvocation.toolCallId,
      state: mapState(toolInvocation.state),
      input: toolInvocation.args,
      output: toolInvocation.result,
    };
  }

  // Return the part unchanged if it's not a legacy tool-invocation
  return part;
}

/**
 * Конвертирует устаревшие структуры рассуждений в стандартный формат ReasoningUIPart
 */
function convertLegacyReasoningPart(part: unknown): unknown {
  if (typeof part !== 'object' || part === null || !('type' in part)) {
    return part;
  }

  // Narrow the type
  const maybePart = part as {
    type?: unknown;
    text?: unknown;
    reasoning?: unknown;
    details?: unknown;
  };

  // Only handle legacy reasoning-like entries
  if (maybePart.type === 'reasoning') {
    // If already in the desired shape (has string text), keep as-is
    if (typeof maybePart.text === 'string' && maybePart.text.length > 0) {
      return part;
    }

    // Collect text from possible legacy fields
    const mainText = typeof maybePart.reasoning === 'string' ? maybePart.reasoning : '';

    let detailsText = '';
    if (Array.isArray(maybePart.details)) {
      const collected: string[] = [];
      for (const entry of maybePart.details as Array<unknown>) {
        if (
          typeof entry === 'object' &&
          entry !== null &&
          'type' in entry &&
          (entry as { type?: unknown }).type === 'text' &&
          'text' in entry &&
          typeof (entry as { text?: unknown }).text === 'string'
        ) {
          collected.push((entry as { text: string }).text);
        }
      }
      if (collected.length > 0) {
        detailsText = collected.join('\n\n');
      }
    }

    const combinedText = [mainText, detailsText].filter((v) => v && v.trim().length > 0).join('\n\n');

    return {
      type: 'reasoning',
      text: combinedText,
    };
  }

  // Some logs store step markers; ignore or pass-through for non-reasoning types
  return part;
}