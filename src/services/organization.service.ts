import { apiClient } from '@/lib/api-client';
import { Organization, OrganizationStats } from '@/types/api';

export class OrganizationService {
  private readonly basePath = '/api/v1/organizations';

  async getCurrentOrganization(): Promise<Organization> {
    return apiClient.get(`${this.basePath}/current`);
  }

  async updateOrganization(data: Partial<Organization>): Promise<Organization> {
    return apiClient.put(`${this.basePath}/current`, data);
  }

  async getOrganizationStats(): Promise<OrganizationStats> {
    return apiClient.get(`${this.basePath}/current/stats`);
  }

  async createOrganization(data: { name: string }): Promise<Organization> {
    return apiClient.post(`${this.basePath}/create`, data);
  }

  async deleteOrganization(): Promise<{ message: string }> {
    return apiClient.delete(`${this.basePath}/current`);
  }
}

export const organizationService = new OrganizationService();