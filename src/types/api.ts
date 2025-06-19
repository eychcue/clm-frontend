// Base types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  full_name: string;
  current_organization_id?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
  organization_name?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface InvitationCreate {
  email: string;
  role: 'admin' | 'user' | 'viewer';
  message?: string;
}

export interface InvitationResponse {
  id: string;
  email: string;
  organization_name: string;
  role: string;
  expires_at: string;
  invitation_link: string;
}

export interface AcceptInvitationRequest {
  token: string;
  full_name?: string;
  password?: string;
}

export interface SwitchOrganizationRequest {
  organization_id: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRole {
  organization_id: string;
  organization_name: string;
  role: 'admin' | 'user' | 'viewer';
  is_active: boolean;
}

export interface UserWithOrganizations {
  id: string;
  email: string;
  full_name: string;
  organizations: OrganizationRole[];
  current_organization_id?: string;
}

export interface OrganizationStats {
  total_contracts: number;
  active_contracts: number;
  total_users: number;
  total_documents: number;
  pending_approvals: number;
}

// Contract types
export interface ContractBase {
  title: string;
  contract_number: string;
  contract_type?: string;
  effective_date?: string;
  expiration_date?: string;
  value?: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface ContractCreate extends ContractBase {}

export interface ContractUpdate {
  title?: string;
  status?: ContractStatus;
  effective_date?: string;
  expiration_date?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface ContractResponse extends ContractBase {
  id: string;
  organization_id: string;
  status: ContractStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractWithWorkflows extends ContractResponse {
  workflows?: any[];
  approval_status?: any;
}

export type ContractStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'negotiated' | 'executed' | 'expired';

// Document types
export interface DocumentUpload {
  file: File;
  description?: string;
}

export interface DocumentResponse {
  id: string;
  contract_id: string;
  file_name: string;
  file_size: number;
  content_type: string;
  description?: string;
  uploaded_by: string;
  created_at: string;
  download_url: string;
}

// Workflow types
export interface WorkflowCreate {
  contract_id: string;
  approvers: string[];
  notes?: string;
}

export interface BulkApprovalRequest {
  workflow_ids: string[];
  action: 'approve' | 'reject';
  notes?: string;
}

export interface WorkflowUpdate {
  action: 'approve' | 'reject';
  notes?: string;
}

export interface WorkflowResponse {
  id: string;
  contract_id: string;
  status: WorkflowStatus;
  approver_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

export type WorkflowStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStatus {
  total_approvers: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  overall_status: 'pending' | 'approved' | 'rejected';
}

export interface ContractApprovalStatus {
  contract_id: string;
  approval_status: ApprovalStatus;
  approvals: WorkflowResponse[];
}

// Negotiation types
export interface NegotiationCreate {
  contract_id: string;
  title: string;
  description?: string;
  deadline?: string;
  participants: string[];
}

export interface NegotiationResponse {
  id: string;
  contract_id: string;
  title: string;
  description?: string;
  deadline?: string;
  status: NegotiationStatus;
  created_by: string;
  current_round: number;
  total_rounds: number;
  version: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export type NegotiationStatus = 'initiated' | 'active' | 'paused' | 'completed' | 'abandoned' | 'expired';

export interface NegotiationParticipant {
  id: string;
  negotiation_id: string;
  user_id: string;
  role: ParticipantRole;
  organization_id?: string;
  permissions: Record<string, any>;
  is_active: boolean;
  invited_by?: string;
  joined_at: string;
}

export type ParticipantRole = 'initiator' | 'counterparty' | 'observer' | 'legal_counsel' | 'delegate';

export interface NegotiationRound {
  id: string;
  negotiation_id: string;
  round_number: number;
  title: string;
  description?: string;
  proposal_data: Record<string, any>;
  changes_summary?: string;
  deadline?: string;
  status: RoundStatus;
  created_by: string;
  parent_round_id?: string;
  response_notes?: string;
  version: number;
  created_at: string;
  updated_at: string;
  responded_at?: string;
}

export type RoundStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'superseded';

export interface NegotiationMessage {
  id: string;
  negotiation_id: string;
  round_id?: string;
  parent_message_id?: string;
  content: string;
  message_type: MessageType;
  metadata: Record<string, any>;
  is_private: boolean;
  created_by: string;
  mentioned_users: string[];
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export type MessageType = 'proposal' | 'counter_proposal' | 'comment' | 'question' | 'system' | 'private_note';

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: NotificationType;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export type NotificationType = 
  | 'negotiation_created'
  | 'negotiation_updated'
  | 'round_submitted'
  | 'round_responded'
  | 'deadline_approaching'
  | 'message_received'
  | 'mention_received'
  | 'attachment_uploaded'
  | 'conflict_detected';

export interface NotificationStats {
  total_count: number;
  unread_count: number;
  by_type: Record<NotificationType, number>;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  types: Record<NotificationType, boolean>;
}

// Audit Log types
export interface AuditLog {
  id: string;
  user_id: string;
  organization_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API Error types
export interface ApiError {
  detail: string;
  status_code: number;
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ContractFilters extends PaginationParams {
  status?: ContractStatus;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface AuditLogFilters extends PaginationParams {
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}