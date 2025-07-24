import { supabase } from '@/integrations/supabase/client';

export const createDemoUsers = async () => {
  const demoUsers = [
    {
      username: 'furkan',
      password: '123456789',
      role: 'tenant' as const,
      name: 'Furkan'
    },
    {
      username: 'Murat',
      password: '123456789',
      role: 'agent' as const,
      name: 'Murat'
    },
    {
      username: 'Ezzaldeen',
      password: '123456789',
      role: 'landlord' as const,
      name: 'Ezzaldeen'
    }
  ];

  const results = [];
  
  for (const user of demoUsers) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${user.username}@propertycare.app`,
        password: user.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: user.username,
            role: user.role,
            name: user.name
          }
        }
      });

      if (error) {
        console.error(`Error creating user ${user.username}:`, error);
        results.push({ username: user.username, success: false, error: error.message });
      } else {
        console.log(`User ${user.username} created successfully`);
        results.push({ username: user.username, success: true, data });
      }
    } catch (error) {
      console.error(`Error creating user ${user.username}:`, error);
      results.push({ username: user.username, success: false, error: 'Unexpected error' });
    }
  }

  return results;
};

// Call this function in the browser console to create demo users
// Usage: import { createDemoUsers } from '@/utils/createDemoUsers'; createDemoUsers();