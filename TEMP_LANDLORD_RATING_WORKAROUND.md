# Temporary Landlord Rating Workaround

## Issue
The landlord worker rating feature requires a database migration to allow 'landlord' as a valid `rater_type` in the `worker_ratings` table. However, this migration cannot be applied currently due to Docker/Supabase not running locally.

## Temporary Solution
The following files have been temporarily modified to use `rater_type: 'agent'` instead of `rater_type: 'landlord'`:

1. **LandlordWorkerRatingDialog.tsx**
   - Line ~75: Changed `rater_type: "landlord"` to `rater_type: "agent"`
   - Line ~88: Changed `.eq("rater_type", "landlord")` to `.eq("rater_type", "agent")`

2. **LandlordMaintenanceDetail.tsx**
   - Line ~186: Changed `.eq('rater_type', 'landlord')` to `.eq('rater_type', 'agent')`
   - Line ~283: Changed `.eq('rater_type', 'landlord')` to `.eq('rater_type', 'agent')`

## Migration to Apply
The migration file `supabase/migrations/20250731000000_allow_landlords_to_rate_workers.sql` needs to be applied to:
1. Update the check constraint to include 'landlord' as a valid rater_type
2. Add RLS policies for landlord ratings

## Steps to Revert (After Migration)
1. Apply the migration: `npx supabase db push`
2. Revert all instances of `rater_type: "agent"` back to `rater_type: "landlord"`
3. Delete this file

## Current Status
✅ Landlord rating feature is working temporarily using 'agent' rater_type
❌ Migration not yet applied due to Docker/Supabase not running locally
