// Run this migration to add the special_circumstances column
import { supabase } from './src/integrations/supabase/client.js';

async function runMigration() {
  try {
    console.log('Adding special_circumstances column to maintenance_requests table...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.maintenance_requests 
        ADD COLUMN IF NOT EXISTS special_circumstances TEXT;
        
        COMMENT ON COLUMN public.maintenance_requests.special_circumstances 
        IS 'Special circumstances or warnings for the maintenance visit (e.g., pregnant resident, baby in house, etc.)';
      `
    });

    if (error) {
      console.error('Migration failed:', error);
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration();
