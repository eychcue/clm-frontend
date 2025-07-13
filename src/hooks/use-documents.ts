import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService, DocumentResponse } from '@/services/document.service';

export function useDocuments(agreementId: string) {
  return useQuery({
    queryKey: ['documents', agreementId],
    queryFn: () => documentService.getDocuments(agreementId),
    enabled: !!agreementId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agreementId, file }: { agreementId: string; file: File }) =>
      documentService.uploadDocument(agreementId, file),
    onSuccess: (_, variables) => {
      // Invalidate documents query to refetch the list
      queryClient.invalidateQueries({ 
        queryKey: ['documents', variables.agreementId] 
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => documentService.deleteDocument(documentId),
    onSuccess: () => {
      // Invalidate all documents queries to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['documents'] 
      });
    },
  });
}