import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/services/contract.service';
import { ContractCreate, ContractResponse, ContractFilters } from '@/types/api';

// Query keys
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  list: (filters?: ContractFilters) => [...contractKeys.lists(), { filters }] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
};

// Hook to fetch all contracts
export function useContracts(filters?: ContractFilters) {
  return useQuery({
    queryKey: contractKeys.list(filters),
    queryFn: () => contractService.getContracts(filters),
    select: (data) => {
      // Handle both paginated and direct array responses
      return Array.isArray(data) ? data : data.data || [];
    },
  });
}

// Hook to fetch a single contract
export function useContract(contractId: string) {
  return useQuery({
    queryKey: contractKeys.detail(contractId),
    queryFn: () => contractService.getContract(contractId),
    enabled: !!contractId,
  });
}

// Hook to create a contract
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContractCreate) => contractService.createContract(data),
    onSuccess: (newContract) => {
      // Invalidate and refetch contracts list
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      
      // Optionally add the new contract to the cache
      queryClient.setQueryData(contractKeys.detail(newContract.id), newContract);
    },
  });
}

// Hook to update a contract
export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: any }) =>
      contractService.updateContract(contractId, data),
    onSuccess: (updatedContract, { contractId }) => {
      // Update the specific contract in cache
      queryClient.setQueryData(contractKeys.detail(contractId), updatedContract);
      
      // Invalidate contracts list to ensure consistency
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

// Hook to delete a contract
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => contractService.deleteContract(contractId),
    onSuccess: (_, contractId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: contractKeys.detail(contractId) });
      
      // Invalidate contracts list
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}