'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSignOut } from '@/hooks/use-auth';
import { useInvitations } from '@/hooks/use-users';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Settings,
  Bell,
  LogOut,
  MessageSquare,
  BarChart3,
  Search,
  Plus,
  Menu,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Agreements',
    href: '/agreements',
    icon: FileText,
    badge: 'New',
  },
  {
    name: 'Negotiations',
    href: '/negotiations',
    icon: MessageSquare,
  },
  {
    name: 'Organization',
    href: '/organization',
    icon: Building2,
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, currentOrganization, logout } = useAuth();
  const { toast } = useToast();
  const signOutMutation = useSignOut();
  const router = useRouter();
  
  // Get pending invitations for notification badge
  const { data: invitations = [] } = useInvitations({ 
    received_by_me: true,
    status: 'pending' 
  });
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      logout();
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out of your account.',
      });
      router.push('/auth/login');
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">CLM</h1>
                <p className="text-xs text-muted-foreground">Agreement Manager</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-4">
            <div className="mb-4">
              <Button className="w-full justify-start" size="sm" asChild>
                <Link href="/agreements/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Agreement
                </Link>
              </Button>
            </div>

            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.name === 'Team' && pendingInvitations.length > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {pendingInvitations.length}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="space-y-2">
              {currentOrganization && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Organization</p>
                  <p className="text-sm font-medium truncate">
                    {currentOrganization.name}
                  </p>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start h-auto p-3">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{user?.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/organization">Organization Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b bg-background px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search agreements, negotiations..."
                    className="border-0 bg-transparent text-sm focus:outline-none focus:ring-0 w-64"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="relative" asChild>
                  <Link href="/team">
                    <Bell className="h-4 w-4" />
                    {pendingInvitations.length > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                      >
                        {pendingInvitations.length}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}