'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { useCurrentOrganization, useOrganizationUsers, useCreateInvitation } from '@/hooks/use-auth';
import {
  Building,
  Users,
  UserPlus,
  Mail,
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
  Shield,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'user', 'viewer'], {
    required_error: 'Please select a role',
  }),
});

type InviteFormData = z.infer<typeof inviteSchema>;

const roleIcons = {
  admin: Crown,
  user: Shield,
  viewer: Eye,
};

const roleLabels = {
  admin: 'Admin',
  user: 'User',
  viewer: 'Viewer',
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  user: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export default function OrganizationPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: orgData } = useCurrentOrganization();
  const { data: orgUsers, refetch: refetchUsers } = useOrganizationUsers();
  const createInvitationMutation = useCreateInvitation();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'user',
    },
  });

  const onInviteSubmit = async (data: InviteFormData) => {
    try {
      await createInvitationMutation.mutateAsync(data);
      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${data.email}`,
      });
      setIsInviteDialogOpen(false);
      form.reset();
      refetchUsers();
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: error?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const currentUserRole = orgUsers?.find(u => u.id === user?.id)?.organizations?.[0]?.role;
  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization and team members
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Organization Information</span>
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={orgData?.organization?.name || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-id">Organization ID</Label>
                  <Input
                    id="org-id"
                    value={orgData?.organization?.id || ''}
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="created-at">Created</Label>
                <Input
                  id="created-at"
                  value={orgData?.organization?.created_at ? new Date(orgData.organization.created_at).toLocaleDateString() : ''}
                  disabled
                />
              </div>
              {isAdmin && (
                <div className="pt-4">
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Organization
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Team Members</span>
                  </CardTitle>
                  <CardDescription>
                    Manage who has access to your organization
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your organization
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onInviteSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="colleague@company.com"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="viewer">Viewer - Can view contracts</SelectItem>
                                    <SelectItem value="user">User - Can create and edit contracts</SelectItem>
                                    <SelectItem value="admin">Admin - Full access</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Choose the appropriate access level for this team member
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsInviteDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createInvitationMutation.isPending}>
                              Send Invitation
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orgUsers?.map((member) => {
                  const memberRole = member.organizations?.[0]?.role || 'user';
                  const RoleIcon = roleIcons[memberRole as keyof typeof roleIcons];
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 
                             member.email.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.full_name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <Badge className={roleColors[memberRole as keyof typeof roleColors]} variant="secondary">
                          <RoleIcon className="mr-1 h-3 w-3" />
                          {roleLabels[memberRole as keyof typeof roleLabels]}
                        </Badge>
                        {member.id === user?.id && (
                          <Badge variant="outline">You</Badge>
                        )}
                      </div>

                      {isAdmin && member.id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Resend Invitation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}