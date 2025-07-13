'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Search, 
  Users, 
  Mail,
  Settings,
  Crown,
  Eye
} from 'lucide-react';
import InviteUserDialog from '@/components/users/invite-user-dialog';
import InvitationsList from '@/components/users/invitations-list';
import { useUsers, useInvitations } from '@/hooks/use-users';

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useUsers({
    search: searchTerm || undefined,
  });
  
  const { data: sentInvitations = [] } = useInvitations({ sent_by_me: true });
  const { data: receivedInvitations = [] } = useInvitations({ received_by_me: true });

  const pendingSentInvitations = sentInvitations.filter(inv => inv.status === 'pending');
  const pendingReceivedInvitations = receivedInvitations.filter(inv => inv.status === 'pending');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'editor':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members and invitations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {pendingReceivedInvitations.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {pendingReceivedInvitations.length} pending invite{pendingReceivedInvitations.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <InviteUserDialog>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </InviteUserDialog>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">
            Team Members ({teamMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations-received">
            Received Invitations ({pendingReceivedInvitations.length})
          </TabsTrigger>
          <TabsTrigger value="invitations-sent">
            Sent Invitations ({pendingSentInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          {isLoadingMembers ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">No team members found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start by inviting team members'}
                    </p>
                  </div>
                  {!searchTerm && (
                    <InviteUserDialog>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite First Member
                      </Button>
                    </InviteUserDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{member.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          {member.organizations.length > 0 && (
                            <div className="flex items-center space-x-2 mt-1">
                              {member.organizations.map((org, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {org.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {member.organizations.map((org, index) => (
                          org.role && (
                            <div key={index} className="flex items-center space-x-2">
                              {getRoleIcon(org.role)}
                              <Badge 
                                className={getRoleBadgeColor(org.role)}
                                variant="secondary"
                              >
                                {org.role}
                              </Badge>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations-received" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invitations You've Received</CardTitle>
              <CardDescription>
                Invitations from other organizations or teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationsList showReceived={true} showSent={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations-sent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invitations You've Sent</CardTitle>
              <CardDescription>
                Track the status of invitations you've sent to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationsList showReceived={false} showSent={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}