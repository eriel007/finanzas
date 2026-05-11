export function env(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function envOr(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}
