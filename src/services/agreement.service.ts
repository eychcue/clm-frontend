import { apiClient } from '@/lib/api-client';
import {
  AgreementCreate,
  AgreementUpdate,
  AgreementResponse,
  AgreementWithWorkflows,
  AgreementFilters,
  PaginatedResponse,
} from '@/types/api';

export class AgreementService {
  private readonly basePath = '/api/v1/agreements';

  async createAgreement(data: AgreementCreate): Promise<AgreementResponse> {
    return apiClient.post(this.basePath, data);
  }

  async getAgreements(filters?: AgreementFilters): Promise<PaginatedResponse<AgreementResponse>> {
    return apiClient.get(this.basePath, filters);
  }

  async getAgreement(agreementId: string): Promise<AgreementWithWorkflows> {
    return apiClient.get(`${this.basePath}/${agreementId}`);
  }

  async updateAgreement(agreementId: string, data: AgreementUpdate): Promise<AgreementResponse> {
    return apiClient.put(`${this.basePath}/${agreementId}`, data);
  }

  async deleteAgreement(agreementId: string): Promise<{ message: string }> {
    return apiClient.delete(`${this.basePath}/${agreementId}`);
  }

  async getAgreementApprovalStatus(agreementId: string): Promise<any> {
    return apiClient.get(`/api/v1/agreements/${agreementId}/approval-status`);
  }
}

export const agreementService = new AgreementService();