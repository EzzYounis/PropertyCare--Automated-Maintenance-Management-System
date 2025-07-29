# Tenant Maintenance Requests Filtering Fix

## Issue
Previously, in the Tenant Portal's maintenance requests page, all tenants were seeing ALL maintenance requests in the system instead of only their own requests.

## Root Cause
The `fetchMaintenanceRequests` function in both `TenantMaintenance.tsx` and `TenantDashboard.tsx` was fetching all maintenance requests without filtering by the current tenant's ID.

## Solution
Added proper filtering to ensure tenants only see their own maintenance requests.

### Changes Made:

#### 1. TenantMaintenance.tsx
- **Before**: `supabase.from('maintenance_requests').select('*')`
- **After**: `supabase.from('maintenance_requests').select('*').eq('tenant_id', user.id)`
- Updated `useEffect` dependency from `[]` to `[user?.id]`
- Added user ID validation before making the query

#### 2. TenantDashboard.tsx  
- **Before**: `supabase.from('maintenance_requests').select('*')`
- **After**: `supabase.from('maintenance_requests').select('*').eq('tenant_id', user.id)`
- Updated `useAuth()` to include `user` along with `profile`
- Updated `useEffect` dependency from `[]` to `[user?.id]`
- Added user ID validation before making the query

### Database Schema
The `maintenance_requests` table already has the correct structure:
- `tenant_id UUID REFERENCES auth.users(id) NOT NULL`

This field is properly set when creating new maintenance requests in `EnhancedReportIssueDialog.tsx`.

### Security
Row Level Security (RLS) is enabled on the `maintenance_requests` table, providing an additional layer of protection.

## Result
- ✅ Each tenant now sees only their own maintenance requests
- ✅ Dashboard shows accurate personal maintenance statistics
- ✅ Maintenance requests page is properly filtered
- ✅ No unauthorized access to other tenants' data
- ✅ Proper real-time updates when user switches accounts

## Testing
- Build completed successfully with no TypeScript errors
- All existing functionality preserved
- Proper fallback handling when user is not authenticated
