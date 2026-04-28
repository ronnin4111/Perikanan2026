export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('auth-token');
}

export function getUser() {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = localStorage.getItem('auth-user');
  return userStr ? JSON.parse(userStr) : null;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('auth-token', token);
}

export function setUser(user: any): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('auth-user', JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('auth-token');
  localStorage.removeItem('auth-user');
}

export function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  return fetch(url, {
    ...options,
    headers
  });
}
