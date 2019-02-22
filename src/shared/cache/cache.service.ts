import * as Bluebird from 'bluebird';
import { Lock } from 'redlock';

export interface ICacheService {
  setItem(key: string, durationInSeconds: number, value: any);
  clearCache(): void;
  ping(): Promise<boolean>;
  lock(resource: string, ttl: number): Bluebird<Lock>;
  getFromCache<T>(key: string): Promise<T>;
  getItemOrElse<T>(
    key: string, durationInSeconds?: number, fetchObject?: () => Promise<T>): Promise<T>;
}

export function getObjectCacheKey(bucket: string, filename: string): string {
  return `${bucket}_${filename}`;
}
