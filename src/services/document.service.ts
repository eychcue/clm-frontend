import { apiClient } from '@/lib/api-client';

export interface DocumentResponse {
  id: string;
  agreement_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface DocumentUploadResponse {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface DocumentDownloadResponse {
  download_url: string;
  file_name: string;
  expires_in: number;
}

export class DocumentService {
  async uploadDocument(agreementId: string, file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.upload(`/api/v1/agreements/${agreementId}/documents`, formData);
  }

  async getDocuments(agreementId: string): Promise<DocumentResponse[]> {
    return apiClient.get(`/api/v1/agreements/${agreementId}/documents`);
  }

  async downloadDocument(documentId: string): Promise<DocumentDownloadResponse> {
    return apiClient.get(`/api/v1/agreements/documents/${documentId}/download`);
  }

  async deleteDocument(documentId: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/v1/agreements/documents/${documentId}`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text')) return '📃';
    return '📁';
  }
}

export const documentService = new DocumentService();