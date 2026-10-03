export class ExceptionHandler {
  static handle(error: unknown, contextMessage?: string): void {
    let errorMessage = "An unexpected error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    const finalMessage = contextMessage 
      ? `${contextMessage}: ${errorMessage}`
      : errorMessage;

    console.error(`[Error] ${finalMessage}`);
  }
}

export function withErrorHandler<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  contextMessage?: string
): (...args: Args) => Promise<T | undefined> {
  return async (...args: Args): Promise<T | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      ExceptionHandler.handle(error, contextMessage);
      return undefined;
    }
  };
}

export function withSyncErrorHandler<T, Args extends any[]>(
  fn: (...args: Args) => T,
  contextMessage?: string
): (...args: Args) => T | undefined {
  return (...args: Args): T | undefined => {
    try {
      return fn(...args);
    } catch (error) {
      ExceptionHandler.handle(error, contextMessage);
      return undefined;
    }
  };
}
