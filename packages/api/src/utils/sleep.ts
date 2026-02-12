/**
 * Sleep utility for orkwork v2
 * Provides async sleep functionality with optional cancellation
 */

export class Sleep {
  private timeoutId?: NodeJS.Timeout;
  private abortController?: AbortController;

  /**
   * Sleep for specified duration
   * @param ms Duration in milliseconds
   * @param signal Optional AbortSignal for cancellation
   */
  static async for(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error('Sleep was aborted'));
        return;
      }

      const timeoutId = setTimeout(() => {
        resolve();
      }, ms);

      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Sleep was aborted'));
        });
      }
    });
  }

  /**
   * Sleep until specific time
   * @param date Target date/time
   * @param signal Optional AbortSignal for cancellation
   */
  static async until(date: Date, signal?: AbortSignal): Promise<void> {
    const now = new Date();
    const ms = date.getTime() - now.getTime();
    
    if (ms <= 0) {
      return; // Already past target time
    }
    
    return Sleep.for(ms, signal);
  }

  /**
   * Sleep with exponential backoff
   * @param attempt Current attempt number (0-based)
   * @param baseMs Base delay in milliseconds
   * @param maxMs Maximum delay in milliseconds
   * @param signal Optional AbortSignal for cancellation
   */
  static async withBackoff(
    attempt: number, 
    baseMs: number = 1000, 
    maxMs: number = 30000,
    signal?: AbortSignal
  ): Promise<void> {
    const delay = Math.min(baseMs * Math.pow(2, attempt), maxMs);
    return Sleep.for(delay, signal);
  }

  /**
   * Sleep with jitter to avoid thundering herd
   * @param baseMs Base delay in milliseconds
   * @param jitterMs Maximum jitter in milliseconds
   * @param signal Optional AbortSignal for cancellation
   */
  static async withJitter(
    baseMs: number, 
    jitterMs: number = baseMs * 0.1,
    signal?: AbortSignal
  ): Promise<void> {
    const jitter = Math.random() * jitterMs;
    const delay = baseMs + jitter;
    return Sleep.for(delay, signal);
  }
}

/**
 * Simple sleep function - shorthand for Sleep.for
 * @param ms Duration in milliseconds
 */
export const sleep = (ms: number): Promise<void> => Sleep.for(ms);

/**
 * Sleep for random duration between min and max
 * @param minMs Minimum duration in milliseconds
 * @param maxMs Maximum duration in milliseconds
 */
export const randomSleep = (minMs: number, maxMs: number): Promise<void> => {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return Sleep.for(ms);
};