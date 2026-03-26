const getTimestamp = (): string => {
  return new Date().toISOString();
};

export const logger = {
  info: (tag: string, message: string, data?: unknown): void => {
    console.log(`[${getTimestamp()}] [INFO] [${tag}] ${message}`, data ? JSON.stringify(data) : '');
  },

  warn: (tag: string, message: string, data?: unknown): void => {
    console.warn(`[${getTimestamp()}] [WARN] [${tag}] ${message}`, data ? JSON.stringify(data) : '');
  },

  error: (tag: string, message: string, error?: unknown): void => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${getTimestamp()}] [ERROR] [${tag}] ${message}`, errorMessage);
  },
};
