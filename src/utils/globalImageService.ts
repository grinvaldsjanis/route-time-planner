import fetchImageForCoordinate from "./fetchImageForCoordinate";

class GlobalImageService {
    private cache: Record<string, { url: string; timestamp: number }> = {};
    private pendingRequests: Record<
      string,
      Promise<{ imageUrl: string | null }>
    > = {};
    private static instance: GlobalImageService;
  
    private constructor() {}
  
    static getInstance(): GlobalImageService {
      if (!GlobalImageService.instance) {
        GlobalImageService.instance = new GlobalImageService();
      }
      return GlobalImageService.instance;
    }
  
    async fetchImage(
      coord: { lat: string; lon: string },
      maxSize: number,
      maxAgeMs = 300000, // 5 minutes
      retries = 3, // Retry 3 times
      retryDelay = 2000 // 2 seconds delay
    ): Promise<{ imageUrl: string | null }> {
      const cacheKey = `${coord.lat}-${coord.lon}`;
      const now = Date.now();
  
      // Check cache
      const cachedImage = this.cache[cacheKey];
      if (cachedImage && now - cachedImage.timestamp < maxAgeMs) {
        return { imageUrl: cachedImage.url };
      }
  
      // Check pending request
      const pendingRequest = this.pendingRequests[cacheKey];
      if (pendingRequest) {
        return pendingRequest;
      }
  
      // Retry logic
      const fetchWithRetry = async (
        attempt: number
      ): Promise<{ imageUrl: string | null }> => {
        try {
          const result = await fetchImageForCoordinate(coord, maxSize);
          if (result?.imageUrl) {
            this.cache[cacheKey] = { url: result.imageUrl, timestamp: now };
          }
          return result ?? { imageUrl: null };
        } catch (error) {
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return fetchWithRetry(attempt + 1);
          }
          return { imageUrl: null };
        }
      };
  
      const fetchPromise = fetchWithRetry(1).finally(() => {
        delete this.pendingRequests[cacheKey];
      });
  
      this.pendingRequests[cacheKey] = fetchPromise;
      return fetchPromise;
    }
  
    clearCache() {
      this.cache = {};
    }
  }
  
  export const imageService = GlobalImageService.getInstance();
  