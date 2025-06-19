import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import {
  SignUpRequest,
  SignInRequest,
  InvitationCreate,
  AcceptInvitationRequest,
  SwitchOrganizationRequest,
} from '@/types/api';

// Query keys
export const authKeys = {
  currentOrganization: ['auth', 'current-organization'] as const,
  organizations: ['auth', 'organizations'] as const,
  organizationUsers: ['auth', 'organization-users'] as const,
} as const;

// Queries
export function useCurrentOrganization() {
  return useQuery({
    queryKey: authKeys.currentOrganization,
    queryFn: () => authService.getCurrentOrganization(),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMyOrganizations() {
  return useQuery({
    queryKey: authKeys.organizations,
    queryFn: () => authService.getMyOrganizations(),
    enabled: authService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useOrganizationUsers() {
  return useQuery({
    queryKey: authKeys.organizationUsers,
    queryFn: () => authService.getOrganizationUsers(),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations
export function useSignUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SignUpRequest) => authService.signUp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.organizations });
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SignInRequest) => authService.signIn(data),
    onSuccess: () => {
      // Invalidate all auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InvitationCreate) => authService.createInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.organizationUsers });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AcceptInvitationRequest) => authService.acceptInvitation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SwitchOrganizationRequest) => authService.switchOrganization(data),
    onSuccess: () => {
      // Invalidate all data when switching organizations
      queryClient.invalidateQueries();
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => authService.removeUserFromOrganization(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.organizationUsers });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      authService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.organizationUsers });
    },
  });
}