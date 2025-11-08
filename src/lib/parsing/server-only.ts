/**
 * Server-only marker
 * This file can be imported to ensure code only runs on the server
 * In client components, this will throw an error
 */

if (typeof window !== 'undefined') {
  throw new Error('This module can only be imported in server-side code (API routes, server components, server actions)');
}
