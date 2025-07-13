import { apiClient } from '@/lib/api-client';

export interface UserListResponse {
  id: string;
  email: string;
  full_name: string;
  organizations: Array<{
    id: string;
    name: string;
    role?: string;
    permissions?: Record<string, boolean>;
  }>;
  created_at: string;
}

export interface UserInvitationCreate {
  email: string;
  organization_id?: string;
  agreement_id?: string;
  role?: string;
  permissions?: Record<string, boolean>;
  message?: string;
}

export interface UserInvitationResponse {
  id: string;
  email: string;
  invited_by: string;
  organization_id?: string;
  agreement_id?: string;
  role: string;
  permissions?: Record<string, boolean>;
  message?: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at?: string;
  responded_at?: string;
  created_at: string;
  inviter_name?: string;
  inviter_email?: string;
}

export class UserService {
  private readonly basePath = '/api/v1/users';

  async searchUsers(query: string, excludeCurrent = true, limit = 10): Promise<UserListResponse[]> {
    return apiClient.get(`${this.basePath}/search`, {
      q: query,
      exclude_current: excludeCurrent,
      limit,
    });
  }

  async listUsers(params?: {
    search?: string;
    organization_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<UserListResponse[]> {
    return apiClient.get(this.basePath, params);
  }

  async getUser(userId: string): Promise<UserListResponse> {
    return apiClient.get(`${this.basePath}/${userId}`);
  }

  async createInvitation(invitation: UserInvitationCreate): Promise<UserInvitationResponse> {
    return apiClient.post(`${this.basePath}/invitations`, invitation);
  }

  async listInvitations(params?: {
    status?: string;
    sent_by_me?: boolean;
    received_by_me?: boolean;
  }): Promise<UserInvitationResponse[]> {
    return apiClient.get(`${this.basePath}/invitations`, params);
  }

  async acceptInvitation(token: string): Promise<{ message: string }> {
    return apiClient.post(`${this.basePath}/invitations/${token}/accept`);
  }

  async declineInvitation(token: string): Promise<{ message: string }> {
    return apiClient.post(`${this.basePath}/invitations/${token}/decline`);
  }
}

export const userService = new UserService();