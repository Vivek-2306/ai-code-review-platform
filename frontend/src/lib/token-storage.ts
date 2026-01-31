const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REMEMBER_KEY = 'auth_remember';

function getStorage(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage;
}

export const tokenStorage = {
  setTokens(
    accessToken: string,
    refreshToken: string,
    remember: boolean = false
  ): void {
    const storage = getStorage(remember);
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (remember) {
      storage.setItem(REMEMBER_KEY, 'true');
    } else {
      storage.removeItem(REMEMBER_KEY);
    }
  },

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  },

  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  },
};
