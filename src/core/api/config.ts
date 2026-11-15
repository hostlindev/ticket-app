/**
 * When `VITE_USE_MOCK` is the string "true", services
 * answer with local mock data instead of calling the Laravel API.
 */
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'false') === 'true'
