import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agreementService } from '@/services/agreement.service';
import { AgreementCreate, AgreementResponse, AgreementFilters } from '@/types/api';

// Query keys
export const agreementKeys = {
  all: ['agreements'] as const,
  lists: () => [...agreementKeys.all, 'list'] as const,
  list: (filters?: AgreementFilters) => [...agreementKeys.lists(), { filters }] as const,
  details: () => [...agreementKeys.all, 'detail'] as const,
  detail: (id: string) => [...agreementKeys.details(), id] as const,
};

// Hook to fetch all agreements
export function useAgreements(filters?: AgreementFilters) {
  return useQuery({
    queryKey: agreementKeys.list(filters),
    queryFn: () => agreementService.getAgreements(filters),
    select: (data) => {
      // Handle both paginated and direct array responses
      return Array.isArray(data) ? data : data.data || [];
    },
  });
}

// Hook to fetch a single agreement
export function useAgreement(agreementId: string) {
  return useQuery({
    queryKey: agreementKeys.detail(agreementId),
    queryFn: () => agreementService.getAgreement(agreementId),
    enabled: !!agreementId,
  });
}

// Hook to create an agreement
export function useCreateAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AgreementCreate) => agreementService.createAgreement(data),
    onSuccess: (newAgreement) => {
      // Invalidate and refetch agreements list
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() });
      
      // Optionally add the new agreement to the cache
      queryClient.setQueryData(agreementKeys.detail(newAgreement.id), newAgreement);
    },
  });
}

// Hook to update an agreement
export function useUpdateAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agreementId, data }: { agreementId: string; data: any }) =>
      agreementService.updateAgreement(agreementId, data),
    onSuccess: (updatedAgreement, { agreementId }) => {
      // Update the specific agreement in cache
      queryClient.setQueryData(agreementKeys.detail(agreementId), updatedAgreement);
      
      // Invalidate agreements list to ensure consistency
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() });
    },
  });
}

// Hook to delete an agreement
export function useDeleteAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agreementId: string) => agreementService.deleteAgreement(agreementId),
    onSuccess: (_, agreementId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: agreementKeys.detail(agreementId) });
      
      // Invalidate agreements list
      queryClient.invalidateQueries({ queryKey: agreementKeys.lists() });
    },
  });
}