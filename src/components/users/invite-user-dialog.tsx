'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
// Removed complex command components for simplicity
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Mail, User } from 'lucide-react';
import { useCreateInvitation, useUserSearch } from '@/hooks/use-users';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

const invitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Role is required'),
  message: z.string().optional(),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface InviteUserDialogProps {
  agreementId?: string;
  organizationId?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const roleOptions = [
  { value: 'member', label: 'Member', description: 'Basic access to view and comment' },
  { value: 'editor', label: 'Editor', description: 'Can edit agreements and documents' },
  { value: 'admin', label: 'Admin', description: 'Full administrative access' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export default function InviteUserDialog({ 
  agreementId, 
  organizationId,
  children,
  onSuccess 
}: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [emailSearch, setEmailSearch] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { toast } = useToast();
  const createInvitationMutation = useCreateInvitation();

  // Debounce the email search to avoid too many API calls
  const debouncedEmailSearch = useDebounce(emailSearch, 300);
  
  const { data: searchResults = [], isLoading: isSearching } = useUserSearch(
    debouncedEmailSearch,
    debouncedEmailSearch.length >= 2
  );

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    },
  });

  const watchedEmail = form.watch('email');

  useEffect(() => {
    setEmailSearch(watchedEmail);
  }, [watchedEmail]);

  const onSubmit = async (data: InvitationFormData) => {
    try {
      const invitationData = {
        email: data.email,
        role: data.role,
        message: data.message || undefined,
        agreement_id: agreementId,
        organization_id: organizationId,
        permissions: getDefaultPermissions(data.role),
      };

      await createInvitationMutation.mutateAsync(invitationData);

      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${data.email}`,
      });

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: error?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          can_edit: true,
          can_delete: true,
          can_invite: true,
          can_manage: true,
        };
      case 'editor':
        return {
          can_edit: true,
          can_delete: false,
          can_invite: false,
          can_manage: false,
        };
      case 'member':
        return {
          can_edit: false,
          can_delete: false,
          can_invite: false,
          can_manage: false,
        };
      case 'viewer':
        return {
          can_edit: false,
          can_delete: false,
          can_invite: false,
          can_manage: false,
        };
      default:
        return {};
    }
  };

  const selectUser = (user: any) => {
    form.setValue('email', user.email);
    setShowUserSearch(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on this {agreementId ? 'agreement' : 'organization'}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter email address"
                          onChange={(e) => {
                            field.onChange(e);
                            setEmailSearch(e.target.value);
                            setShowUserSearch(e.target.value.length >= 2);
                          }}
                        />
                        <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* User Search Results */}
              {showUserSearch && searchResults.length > 0 && (
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium mb-2">Existing users:</p>
                    <div className="space-y-2">
                      {searchResults.slice(0, 5).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => selectUser(user)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {user.organizations.map((org, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {org.name}
                              </Badge>
                            ))}
                            <Button variant="ghost" size="sm">
                              Select
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {role.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add a personal message to the invitation..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be included in the invitation email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createInvitationMutation.isPending}
              >
                {createInvitationMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}