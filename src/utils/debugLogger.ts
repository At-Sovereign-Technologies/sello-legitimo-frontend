/**
 * Debug logger utility for development and troubleshooting
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface DebugLogEntry {
  timestamp: string;
  module: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

const isDebugEnabled = (): boolean => {
  return (
    typeof import.meta !== "undefined" &&
    import.meta.env.DEV === true
  );
};

const formatTimestamp = (): string => {
  return new Date().toISOString();
};

const log = (module: string, level: LogLevel, message: string, data?: unknown): void => {
  if (!isDebugEnabled()) return;

  const entry: DebugLogEntry = {
    timestamp: formatTimestamp(),
    module,
    level,
    message,
    data,
  };

  const prefix = `[${entry.timestamp}] [${entry.module}] [${entry.level.toUpperCase()}]`;

  switch (level) {
    case "debug":
    case "info":
      console.log(`${prefix} ${message}`, data ?? "");
      break;
    case "warn":
      console.warn(`${prefix} ${message}`, data ?? "");
      break;
    case "error":
      console.error(`${prefix} ${message}`, data ?? "");
      break;
  }
};

export const debugLog = (module: string, message: string, data?: unknown): void => {
  log(module, "debug", message, data);
};

export const infoLog = (module: string, message: string, data?: unknown): void => {
  log(module, "info", message, data);
};

export const warnLog = (module: string, message: string, data?: unknown): void => {
  log(module, "warn", message, data);
};

export const errorLog = (module: string, message: string, data?: unknown): void => {
  log(module, "error", message, data);
};
