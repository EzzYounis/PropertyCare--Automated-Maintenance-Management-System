import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Bell, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

const getRoleColor = (role: string) => {
  switch (role) {
    case 'tenant': return 'bg-tenant text-white';
    case 'agent': return 'bg-agent text-white';
    case 'landlord': return 'bg-landlord text-white';
    default: return 'bg-primary text-primary-foreground';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'tenant': return 'Tenant';
    case 'agent': return 'Agent';
    case 'landlord': return 'Landlord';
    default: return 'User';
  }
};

export const Header = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-foreground">
              {user.role === 'tenant' && 'PropertyHub'}
              {user.role === 'agent' && 'Maintenance Portal'}
              {user.role === 'landlord' && 'PropertyCare'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Badge className={getRoleColor(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};