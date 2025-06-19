import { apiClient } from '@/lib/api-client';
import {
  ContractCreate,
  ContractUpdate,
  ContractResponse,
  ContractWithWorkflows,
  ContractFilters,
  PaginatedResponse,
} from '@/types/api';

export class ContractService {
  private readonly basePath = '/api/v1/contracts';

  async createContract(data: ContractCreate): Promise<ContractResponse> {
    return apiClient.post(this.basePath, data);
  }

  async getContracts(filters?: ContractFilters): Promise<PaginatedResponse<ContractResponse>> {
    return apiClient.get(this.basePath, filters);
  }

  async getContract(contractId: string): Promise<ContractWithWorkflows> {
    return apiClient.get(`${this.basePath}/${contractId}`);
  }

  async updateContract(contractId: string, data: ContractUpdate): Promise<ContractResponse> {
    return apiClient.put(`${this.basePath}/${contractId}`, data);
  }

  async deleteContract(contractId: string): Promise<{ message: string }> {
    return apiClient.delete(`${this.basePath}/${contractId}`);
  }

  async getContractApprovalStatus(contractId: string): Promise<any> {
    return apiClient.get(`/api/v1/contracts/${contractId}/approval-status`);
  }
}

export const contractService = new ContractService();