export const setLocalStorage = (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  };
  
  export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item) as T;
        } catch {
          return item as T;
        }
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return defaultValue;
    }
  };
  
  export const removeLocalStorage = (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  };
  