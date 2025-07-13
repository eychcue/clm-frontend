import { apiClient } from '@/lib/api-client';

export interface NegotiationParticipant {
  user_id: string;
  role: 'initiator' | 'counterparty' | 'observer' | 'legal_counsel' | 'delegate';
  organization_id?: string;
  permissions?: {
    can_propose?: boolean;
    can_comment?: boolean;
    can_invite_others?: boolean;
    can_view_private_notes?: boolean;
    can_end_negotiation?: boolean;
  };
}

export interface NegotiationCreate {
  agreement_id: string;
  title: string;
  description?: string;
  deadline?: string;
  settings?: Record<string, any>;
  participants: NegotiationParticipant[];
}

export interface NegotiationResponse {
  id: string;
  agreement_id: string;
  title: string;
  description?: string;
  deadline?: string;
  settings?: Record<string, any>;
  status: 'initiated' | 'active' | 'paused' | 'completed' | 'abandoned' | 'expired';
  created_by: string;
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
  current_round?: number;
  total_rounds?: number;
  version: number;
}

export interface NegotiationSummary {
  negotiation_id: string;
  title: string;
  status: string;
  total_rounds: number;
  active_participants: number;
  last_activity?: string;
  days_active: number;
  created_at: string;
}

export interface NegotiationWithParticipants extends NegotiationResponse {
  participants: ParticipantWithDetails[];
  current_user_role: string;
  can_edit: boolean;
  can_respond: boolean;
}

export interface ParticipantWithDetails {
  id: string;
  negotiation_id: string;
  user_id: string;
  role: string;
  organization_id?: string;
  permissions?: Record<string, boolean>;
  is_active: boolean;
  invited_by?: string;
  joined_at?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  organization_name?: string;
}

export interface RoundCreate {
  title: string;
  description?: string;
  proposal_data?: Record<string, any>;
  changes_summary?: string;
  deadline?: string;
}

export interface RoundResponse {
  id: string;
  negotiation_id: string;
  round_number: number;
  title: string;
  description?: string;
  proposal_data?: Record<string, any>;
  changes_summary?: string;
  deadline?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'superseded';
  created_by: string;
  parent_round_id?: string;
  response_notes?: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  version: number;
}

export interface MessageCreate {
  round_id?: string;
  parent_message_id?: string;
  content: string;
  message_type: 'proposal' | 'counter_proposal' | 'comment' | 'question' | 'system' | 'private_note';
  metadata?: Record<string, any>;
  is_private?: boolean;
  mentioned_users?: string[];
}

export interface MessageResponse {
  id: string;
  negotiation_id: string;
  round_id?: string;
  parent_message_id?: string;
  content: string;
  message_type: string;
  metadata?: Record<string, any>;
  is_private: boolean;
  created_by: string;
  mentioned_users?: string[];
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface NegotiationActivity {
  id: string;
  negotiation_id: string;
  activity_type: string;
  description: string;
  user_id: string;
  user_name?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NegotiationStats {
  total_negotiations: number;
  active_negotiations: number;
  completed_negotiations: number;
  average_rounds_per_negotiation: number;
  average_completion_time_days?: number;
  success_rate: number;
}

export class NegotiationService {
  private readonly basePath = '/api/v1/negotiations';

  async createNegotiation(data: NegotiationCreate): Promise<NegotiationResponse> {
    return apiClient.post(this.basePath, data);
  }

  async listNegotiations(filters?: {
    skip?: number;
    limit?: number;
    status?: string;
    agreement_id?: string;
  }): Promise<NegotiationSummary[]> {
    return apiClient.get(this.basePath, filters);
  }

  async getNegotiation(negotiationId: string): Promise<NegotiationWithParticipants> {
    return apiClient.get(`${this.basePath}/${negotiationId}`);
  }

  async updateNegotiation(negotiationId: string, data: Partial<NegotiationCreate>): Promise<NegotiationResponse> {
    return apiClient.put(`${this.basePath}/${negotiationId}`, data);
  }

  async addParticipant(negotiationId: string, participant: NegotiationParticipant): Promise<any> {
    return apiClient.post(`${this.basePath}/${negotiationId}/participants`, participant);
  }

  async createRound(negotiationId: string, roundData: RoundCreate): Promise<RoundResponse> {
    return apiClient.post(`${this.basePath}/${negotiationId}/rounds`, roundData);
  }

  async listRounds(negotiationId: string, options?: { skip?: number; limit?: number }): Promise<RoundResponse[]> {
    return apiClient.get(`${this.basePath}/${negotiationId}/rounds`, options);
  }

  async submitRound(negotiationId: string, roundId: string): Promise<{ message: string; round: RoundResponse }> {
    return apiClient.put(`${this.basePath}/${negotiationId}/rounds/${roundId}/submit`);
  }

  async respondToRound(
    negotiationId: string, 
    roundId: string, 
    status: 'accepted' | 'rejected',
    responseNotes?: string
  ): Promise<{ message: string; round: RoundResponse }> {
    return apiClient.put(`${this.basePath}/${negotiationId}/rounds/${roundId}/respond`, {
      status,
      response_notes: responseNotes,
    });
  }

  async createMessage(negotiationId: string, messageData: MessageCreate): Promise<MessageResponse> {
    return apiClient.post(`${this.basePath}/${negotiationId}/messages`, messageData);
  }

  async listMessages(negotiationId: string, options?: {
    round_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<MessageResponse[]> {
    return apiClient.get(`${this.basePath}/${negotiationId}/messages`, options);
  }

  async getActivity(negotiationId: string, options?: {
    skip?: number;
    limit?: number;
  }): Promise<NegotiationActivity[]> {
    return apiClient.get(`${this.basePath}/${negotiationId}/activity`, options);
  }

  async pauseNegotiation(negotiationId: string): Promise<{ message: string }> {
    return apiClient.post(`${this.basePath}/${negotiationId}/pause`);
  }

  async resumeNegotiation(negotiationId: string): Promise<{ message: string }> {
    return apiClient.post(`${this.basePath}/${negotiationId}/resume`);
  }

  async abandonNegotiation(negotiationId: string, reason?: string): Promise<{ message: string }> {
    return apiClient.delete(`${this.basePath}/${negotiationId}`, { reason });
  }

  async getOrganizationStats(): Promise<NegotiationStats> {
    return apiClient.get(`${this.basePath}/stats/organization`);
  }
}

export const negotiationService = new NegotiationService();