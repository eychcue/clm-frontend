import { apiClient } from '@/lib/api-client';
import {
  SignUpRequest,
  SignInRequest,
  AuthTokens,
  InvitationCreate,
  InvitationResponse,
  AcceptInvitationRequest,
  SwitchOrganizationRequest,
  OrganizationRole,
  UserWithOrganizations,
  Organization,
} from '@/types/api';

export class AuthService {
  private readonly basePath = '/api/v1/auth';

  async signUp(data: SignUpRequest): Promise<{ message: string; user_id: string; organization_id?: string }> {
    return apiClient.post(`${this.basePath}/signup`, data);
  }

  async signIn(data: SignInRequest): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>(`${this.basePath}/signin`, data);
    
    // Store the token
    this.setAuthToken(response.access_token);
    
    // The backend only returns basic user info, we'll get full user data after login
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }
    
    return response;
  }

  async signOut(): Promise<void> {
    this.removeAuthToken();
  }

  async createInvitation(data: InvitationCreate): Promise<InvitationResponse> {
    return apiClient.post(`${this.basePath}/invitations`, data);
  }

  async acceptInvitation(data: AcceptInvitationRequest): Promise<{ message: string; organization_name: string }> {
    return apiClient.post(`${this.basePath}/invitations/accept`, data);
  }

  async switchOrganization(data: SwitchOrganizationRequest): Promise<{
    organization: Organization;
    role: string;
    message: string;
  }> {
    return apiClient.post(`${this.basePath}/organizations/switch`, data);
  }

  async getCurrentOrganization(): Promise<{
    organization: Organization;
    role: string;
  }> {
    return apiClient.get(`${this.basePath}/organizations/current`);
  }

  async getMyOrganizations(): Promise<OrganizationRole[]> {
    return apiClient.get(`${this.basePath}/organizations`);
  }

  async getOrganizationUsers(): Promise<UserWithOrganizations[]> {
    return apiClient.get(`${this.basePath}/users`);
  }

  async removeUserFromOrganization(userId: string): Promise<{ message: string }> {
    return apiClient.delete(`${this.basePath}/users/${userId}`);
  }

  async updateUserRole(userId: string, role: string): Promise<{ message: string }> {
    return apiClient.put(`${this.basePath}/users/${userId}/role`, { role });
  }

  async getCurrentUserProfile(): Promise<any> {
    // This will use the get_current_user_data dependency 
    // We can call any authenticated endpoint to get the full user data
    const response = await this.getCurrentOrganization();
    // The backend's get_current_user_data should include user info
    return response;
  }

  // Helper methods
  getCurrentUser(): any | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  async refreshUserData(): Promise<any> {
    try {
      const currentOrg = await this.getCurrentOrganization();
      const user = this.getCurrentUser();
      
      if (user) {
        const updatedUser = {
          ...user,
          current_organization: currentOrg.organization,
          role: currentOrg.role,
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
        }
        
        return updatedUser;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
    return null;
  }
}

export const authService = new AuthService();