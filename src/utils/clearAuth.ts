/**
 * Utility function to manually clear authentication tokens
 * This can be used in the browser console or called programmatically
 * to resolve "Invalid Refresh Token" errors
 */

export const clearAllAuthTokens = () => {
  console.log('Clearing all authentication tokens...');
  
  // Clear all possible Supabase auth token keys
  const authKeys = [
    'sb-cdbztlkapkmkmlhlcmal-auth-token',
    'supabase.auth.token',
    'sb-auth-token',
    'supabase-auth-token'
  ];

  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    }
  });

  // Clear any session storage as well
  authKeys.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      console.log(`Removed from session storage: ${key}`);
    }
  });

  console.log('✅ Authentication tokens cleared. Please refresh the page.');
  
  // Optionally reload the page
  if (confirm('Authentication tokens cleared. Reload the page now?')) {
    window.location.reload();
  }
};

// Make it available globally for console use
if (typeof window !== 'undefined') {
  (window as any).clearAllAuthTokens = clearAllAuthTokens;
}
