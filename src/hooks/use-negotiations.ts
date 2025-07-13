import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { negotiationService } from '@/services/negotiation.service';
import type { 
  NegotiationCreate, 
  NegotiationParticipant,
  RoundCreate,
  MessageCreate 
} from '@/services/negotiation.service';

export function useNegotiations(filters?: {
  skip?: number;
  limit?: number;
  status?: string;
  agreement_id?: string;
}) {
  return useQuery({
    queryKey: ['negotiations', filters],
    queryFn: () => negotiationService.listNegotiations(filters),
  });
}

export function useNegotiation(negotiationId: string) {
  return useQuery({
    queryKey: ['negotiations', negotiationId],
    queryFn: () => negotiationService.getNegotiation(negotiationId),
    enabled: !!negotiationId,
  });
}

export function useCreateNegotiation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NegotiationCreate) => negotiationService.createNegotiation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

export function useUpdateNegotiation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ negotiationId, data }: { negotiationId: string; data: Partial<NegotiationCreate> }) =>
      negotiationService.updateNegotiation(negotiationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['negotiations', variables.negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

export function useAddParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ negotiationId, participant }: { negotiationId: string; participant: NegotiationParticipant }) =>
      negotiationService.addParticipant(negotiationId, participant),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['negotiations', variables.negotiationId] });
    },
  });
}

export function useRounds(negotiationId: string, options?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['rounds', negotiationId, options],
    queryFn: () => negotiationService.listRounds(negotiationId, options),
    enabled: !!negotiationId,
  });
}

export function useCreateRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ negotiationId, roundData }: { negotiationId: string; roundData: RoundCreate }) =>
      negotiationService.createRound(negotiationId, roundData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rounds', variables.negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations', variables.negotiationId] });
    },
  });
}

export function useSubmitRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ negotiationId, roundId }: { negotiationId: string; roundId: string }) =>
      negotiationService.submitRound(negotiationId, roundId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rounds', variables.negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations', variables.negotiationId] });
    },
  });
}

export function useRespondToRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      negotiationId, 
      roundId, 
      status, 
      responseNotes 
    }: { 
      negotiationId: string; 
      roundId: string; 
      status: 'accepted' | 'rejected';
      responseNotes?: string;
    }) => negotiationService.respondToRound(negotiationId, roundId, status, responseNotes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rounds', variables.negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations', variables.negotiationId] });
    },
  });
}

export function useMessages(negotiationId: string, options?: {
  round_id?: string;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['messages', negotiationId, options],
    queryFn: () => negotiationService.listMessages(negotiationId, options),
    enabled: !!negotiationId,
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ negotiationId, messageData }: { negotiationId: string; messageData: MessageCreate }) =>
      negotiationService.createMessage(negotiationId, messageData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations', variables.negotiationId] });
    },
  });
}

export function useNegotiationActivity(negotiationId: string, options?: {
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['negotiation-activity', negotiationId, options],
    queryFn: () => negotiationService.getActivity(negotiationId, options),
    enabled: !!negotiationId,
  });
}

export function usePauseNegotiation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (negotiationId: string) => negotiationService.pauseNegotiation(negotiationId),
    onSuccess: (_, negotiationId) => {
      queryClient.invalidateQueries({ queryKey: ['negotiations', negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

export function useResumeNegotiation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (negotiationId: string) => negotiationService.resumeNegotiation(negotiationId),
    onSuccess: (_, negotiationId) => {
      queryClient.invalidateQueries({ queryKey: ['negotiations', negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

export function useAbandonNegotiation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ negotiationId, reason }: { negotiationId: string; reason?: string }) =>
      negotiationService.abandonNegotiation(negotiationId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['negotiations', variables.negotiationId] });
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    },
  });
}

export function useOrganizationNegotiationStats() {
  return useQuery({
    queryKey: ['negotiation-stats', 'organization'],
    queryFn: () => negotiationService.getOrganizationStats(),
  });
}