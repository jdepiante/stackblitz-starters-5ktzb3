export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  },
  auth: {
    tokenKey: 'auth-token',
  }
} as const;