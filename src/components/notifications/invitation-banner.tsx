'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Check, 
  X, 
  Bell,
  ChevronRight,
  Users
} from 'lucide-react';
import { useInvitations, useAcceptInvitation, useDeclineInvitation } from '@/hooks/use-users';
import Link from 'next/link';

export default function InvitationBanner() {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);
  
  const { data: invitations = [], refetch } = useInvitations({ 
    received_by_me: true,
    status: 'pending' 
  });

  const acceptInvitationMutation = useAcceptInvitation();
  const declineInvitationMutation = useDeclineInvitation();

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const handleAccept = async (invitation: any) => {
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

  const handleDecline = async (invitation: any) => {
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

  if (dismissed || pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    You have {pendingInvitations.length} pending invitation{pendingInvitations.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {pendingInvitations.length === 1 
                      ? `From ${pendingInvitations[0].inviter_name || pendingInvitations[0].inviter_email}`
                      : 'Click to view and respond to invitations'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {pendingInvitations.length === 1 ? (
                // Quick actions for single invitation
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(pendingInvitations[0])}
                    disabled={acceptInvitationMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(pendingInvitations[0])}
                    disabled={declineInvitationMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              ) : (
                // Link to team page for multiple invitations
                <Button size="sm" asChild>
                  <Link href="/team">
                    <Users className="h-4 w-4 mr-2" />
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Show invitation details for single invitation */}
          {pendingInvitations.length === 1 && pendingInvitations[0].message && (
            <div className="mt-3 p-3 bg-white rounded border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Message:</strong> {pendingInvitations[0].message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}