'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useCurrentOrganization, useOrganizationUsers } from '@/hooks/use-auth';
import { 
  FileText, 
  Users, 
  Building, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Edit,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: orgData } = useCurrentOrganization();
  const { data: orgUsers } = useOrganizationUsers();

  const stats = [
    {
      title: 'Total Agreements',
      value: '0',
      description: 'All agreements in system',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Active Agreements',
      value: '0',
      description: 'Currently active',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Pending Approvals',
      value: '0',
      description: 'Awaiting approval',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Team Members',
      value: orgUsers?.length?.toString() || '1',
      description: 'Organization members',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'contract_created',
      title: 'Welcome to CLM!',
      description: 'Your account has been successfully created',
      time: 'Just now',
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ];

  const quickActions = [
    {
      title: 'Create Agreement',
      description: 'Start a new agreement',
      href: '/agreements/new',
      icon: Plus,
      color: 'bg-blue-600',
    },
    {
      title: 'View Agreements',
      description: 'Browse all agreements',
      href: '/agreements',
      icon: Eye,
      color: 'bg-purple-600',
    },
    {
      title: 'Manage Team',
      description: 'Invite team members',
      href: '/team',
      icon: Users,
      color: 'bg-green-600',
    },
    {
      title: 'Organization Settings',
      description: 'Configure your org',
      href: '/organization',
      icon: Building,
      color: 'bg-orange-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your agreements today.
          </p>
        </div>
        <Button asChild>
          <Link href="/agreements/new">
            <Plus className="mr-2 h-4 w-4" />
            New Agreement
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium group-hover:text-primary">
                          {action.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <Icon className={`h-4 w-4 mt-1 ${activity.color}`} />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Section */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to set up your CLM system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Create your account</p>
              <p className="text-sm text-muted-foreground">
                You've successfully created your account
              </p>
            </div>
            <Badge variant="secondary">Complete</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">2</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Set up your organization</p>
              <p className="text-sm text-muted-foreground">
                Configure your organization settings and invite team members
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/organization">Set Up</Link>
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">3</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Create your first agreement</p>
              <p className="text-sm text-muted-foreground">
                Start managing your agreements with CLM
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/agreements/new">Create</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}