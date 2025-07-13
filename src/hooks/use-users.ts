import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { UserInvitationCreate } from '@/services/user.service';

export function useUserSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => userService.searchUsers(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}

export function useUsers(params?: {
  search?: string;
  organization_id?: string;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.listUsers(params),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userService.getUser(userId),
    enabled: !!userId,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitation: UserInvitationCreate) => userService.createInvitation(invitation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useInvitations(params?: {
  status?: string;
  sent_by_me?: boolean;
  received_by_me?: boolean;
}) {
  return useQuery({
    queryKey: ['invitations', params],
    queryFn: () => userService.listInvitations(params),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => userService.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => userService.declineInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}