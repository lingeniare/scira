export type ErrorType =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'upgrade_required'
  | 'model_restricted'
  | 'offline';

export type Surface = 'chat' | 'auth' | 'api' | 'stream' | 'database' | 'history' | 'model';

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = 'response' | 'log' | 'none';

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: 'log',
  chat: 'response',
  auth: 'response',
  stream: 'response',
  api: 'response',
  history: 'response',
  model: 'response',
};

export class ChatSDKError extends Error {
  public type: ErrorType;
  public surface: Surface;
  public statusCode: number;

  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(':');

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  public toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === 'log') {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: '', message: 'Что-то пошло не так. Пожалуйста, попробуйте еще раз позже.' },
        { status: statusCode },
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  if (errorCode.includes('database')) {
    return 'Произошла ошибка при выполнении запроса к базе данных.';
  }

  switch (errorCode) {
    case 'bad_request:api':
      return "Запрос не может быть обработан. Пожалуйста, проверьте введенные данные и попробуйте снова.";
    case 'rate_limit:api':
      return 'Вы достигли дневного лимита для этой функции. Обновитесь до Pro для неограниченного доступа.';

    case 'unauthorized:auth':
      return 'Вам необходимо войти, прежде чем продолжить.';
    case 'forbidden:auth':
      return 'Ваша учетная запись не имеет доступа к этой функции.';
    case 'upgrade_required:auth':
      return 'Эта функция требует подписки Pro. Войдите и обновитесь, чтобы продолжить.';

    case 'rate_limit:chat':
      return 'Вы превысили максимальное количество сообщений за день. Пожалуйста, попробуйте еще раз позже.';
    case 'upgrade_required:chat':
      return 'Вы достигли дневного лимита поиска. Обновитесь до Pro для неограниченного поиска.';
    case 'not_found:chat':
      return 'Запрошенный чат не найден. Пожалуйста, проверьте ID чата и попробуйте снова.';
    case 'forbidden:chat':
      return 'Этот чат принадлежит другому пользователю. Пожалуйста, проверьте ID чата и попробуйте снова.';
    case 'unauthorized:chat':
      return 'Вам необходимо войти, чтобы просмотреть этот чат. Пожалуйста, войдите и попробуйте снова.';
    case 'offline:chat':
      return "У нас проблемы с отправкой вашего сообщения. Пожалуйста, проверьте подключение к интернету и попробуйте снова.";

    case 'unauthorized:model':
      return 'Вам необходимо войти, чтобы получить доступ к этой модели ИИ.';
    case 'forbidden:model':
      return 'Эта модель ИИ требует подписки Pro.';
    case 'model_restricted:model':
      return 'Доступ к этой модели ИИ ограничен. Пожалуйста, обновитесь до Pro или свяжитесь со службой поддержки.';
    case 'upgrade_required:model':
      return 'Эта премиальная модель ИИ доступна только с подпиской Pro.';
    case 'rate_limit:model':
      return 'Вы достигли лимита использования для этой модели ИИ. Обновитесь до Pro для неограниченного доступа.';

    case 'forbidden:api':
      return 'Доступ запрещен';

    default:
      return 'Что-то пошло не так. Пожалуйста, попробуйте еще раз позже.';
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case 'bad_request':
      return 400;
    case 'unauthorized':
      return 401;
    case 'forbidden':
      return 403;
    case 'not_found':
      return 404;
    case 'rate_limit':
      return 429;
    case 'upgrade_required':
      return 402; // Payment Required
    case 'model_restricted':
      return 403;
    case 'offline':
      return 503;
    default:
      return 500;
  }
}

// Utility functions for error handling
export function isAuthError(error: ChatSDKError): boolean {
  return error.surface === 'auth';
}

export function isUpgradeRequiredError(error: ChatSDKError): boolean {
  return error.type === 'upgrade_required';
}

export function isModelError(error: ChatSDKError): boolean {
  return error.surface === 'model';
}

export function isSignInRequired(error: ChatSDKError): boolean {
  return (
    error.type === 'unauthorized' && (error.surface === 'auth' || error.surface === 'chat' || error.surface === 'model')
  );
}

export function isProRequired(error: ChatSDKError): boolean {
  return error.type === 'upgrade_required' || error.type === 'forbidden' || error.type === 'model_restricted';
}

export function isRateLimited(error: ChatSDKError): boolean {
  return error.type === 'rate_limit';
}

// Helper function to get error action suggestions
export function getErrorActions(error: ChatSDKError): {
  primary?: { label: string; action: string };
  secondary?: { label: string; action: string };
} {
  if (isSignInRequired(error)) {
    return {
      primary: { label: 'Войти', action: 'signin' },
      secondary: { label: 'Попробовать снова', action: 'retry' },
    };
  }

  if (isProRequired(error)) {
    return {
      primary: { label: 'Обновиться до Pro', action: 'upgrade' },
      secondary: { label: 'Проверить снова', action: 'refresh' },
    };
  }

  if (isRateLimited(error)) {
    return {
      primary: { label: 'Обновиться до Pro', action: 'upgrade' },
      secondary: { label: 'Попробовать позже', action: 'retry' },
    };
  }

  return {
    primary: { label: 'Попробовать снова', action: 'retry' },
  };
}

// Helper function to get error icon type
export function getErrorIcon(error: ChatSDKError): 'warning' | 'error' | 'upgrade' | 'auth' {
  if (isSignInRequired(error)) return 'auth';
  if (isProRequired(error) || isRateLimited(error)) return 'upgrade';
  if (error.type === 'offline') return 'warning';
  return 'error';
}
