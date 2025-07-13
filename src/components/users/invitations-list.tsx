'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Clock, 
  Check, 
  X, 
  User, 
  Calendar,
  MessageSquare 
} from 'lucide-react';
import { useInvitations, useAcceptInvitation, useDeclineInvitation } from '@/hooks/use-users';
import type { UserInvitationResponse } from '@/services/user.service';

interface InvitationsListProps {
  showSent?: boolean;
  showReceived?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
};

export default function InvitationsList({ 
  showSent = false, 
  showReceived = true 
}: InvitationsListProps) {
  const { toast } = useToast();
  const { data: invitations = [], isLoading, refetch } = useInvitations({
    sent_by_me: showSent,
    received_by_me: showReceived,
  });

  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();

  const handleAccept = async (invitation: UserInvitationResponse) => {
    try {
      await acceptInvitationMutation.mutateAsync(invitation.token);
      toast({
        title: 'Invitation accepted',
        description: 'You have successfully joined the organization',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Failed to accept invitation',
        description: error?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const handleDecline = async (invitation: UserInvitationResponse) => {
    try {
      await declineInvitationMutation.mutateAsync(invitation.token);
      toast({
        title: 'Invitation declined',
        description: 'The invitation has been declined',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Failed to decline invitation',
        description: error?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (invitation: UserInvitationResponse) => {
    if (!invitation.expires_at) return false;
    return new Date(invitation.expires_at) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="mx-auto h-12 w-12 mb-4" />
        <p>No invitations found</p>
        <p className="text-sm">
          {showReceived ? 'You have no pending invitations' : 'You haven\'t sent any invitations'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="hover:shadow-md transition-shadow">
          <CardContent className="py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {showSent ? `Invitation to ${invitation.email}` : 'Organization Invitation'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {showSent 
                        ? `Role: ${invitation.role}` 
                        : `From: ${invitation.inviter_name || invitation.inviter_email}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Sent {formatDate(invitation.created_at)}</span>
                  </div>
                  {invitation.expires_at && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Expires {formatDate(invitation.expires_at)}</span>
                    </div>
                  )}
                </div>

                {invitation.message && (
                  <div className="bg-muted p-3 rounded-lg mb-3">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 mt-0.5" />
                      <p className="text-sm">{invitation.message}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Badge
                  className={statusColors[invitation.status as keyof typeof statusColors]}
                  variant="secondary"
                >
                  {statusLabels[invitation.status as keyof typeof statusLabels]}
                </Badge>

                {/* Action buttons for received invitations */}
                {showReceived && invitation.status === 'pending' && !isExpired(invitation) && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(invitation)}
                      disabled={acceptInvitationMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecline(invitation)}
                      disabled={declineInvitationMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}

                {/* Show expired status */}
                {invitation.status === 'pending' && isExpired(invitation) && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Expired
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}