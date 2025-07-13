'use client';

// Remove unused import
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  DollarSign,
  User,
  Clock,
  Upload,
  MessageSquare,
  Users,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAgreement } from '@/hooks/use-agreements';
import { useDocuments } from '@/hooks/use-documents';
import { useNegotiations } from '@/hooks/use-negotiations';
import { useToast } from '@/hooks/use-toast';
import DocumentUpload from '@/components/documents/document-upload';
import DocumentList from '@/components/documents/document-list';
import CreateNegotiationDialog from '@/components/negotiations/create-negotiation-dialog';
import NegotiationList from '@/components/negotiations/negotiation-list';
import InviteUserDialog from '@/components/users/invite-user-dialog';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  negotiated: 'bg-purple-100 text-purple-800',
  executed: 'bg-blue-100 text-blue-800',
  expired: 'bg-red-100 text-red-800',
};

const statusLabels = {
  draft: 'Draft',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  negotiated: 'Negotiated',
  executed: 'Executed',
  expired: 'Expired',
};

export default function AgreementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agreementId = params.id as string;

  const { data: agreement, isLoading, error } = useAgreement(agreementId);
  const { data: documents = [], isLoading: isLoadingDocuments, refetch: refetchDocuments } = useDocuments(agreementId);
  const { data: negotiations = [], isLoading: isLoadingNegotiations, refetch: refetchNegotiations } = useNegotiations({ 
    agreement_id: agreementId 
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="mx-auto h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-red-600">Error loading agreement</h3>
                <p className="text-muted-foreground">
                  {(error as any)?.detail || 'Agreement not found'}
                </p>
              </div>
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/agreements">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agreements
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{agreement.title}</h1>
            <p className="text-muted-foreground">{agreement.agreement_number}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            className={statusColors[agreement.status as keyof typeof statusColors]}
            variant="secondary"
          >
            {statusLabels[agreement.status as keyof typeof statusLabels]}
          </Badge>
          <Button asChild>
            <Link href={`/agreements/${agreement.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Agreement
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
              <TabsTrigger value="approvals">Approvals</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agreement Information</CardTitle>
                  <CardDescription>
                    Key details and terms of this agreement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Agreement Type
                        </label>
                        <p className="text-sm">
                          {agreement.agreement_type || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Effective Date
                        </label>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(agreement.effective_date)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Expiration Date
                        </label>
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(agreement.expiration_date)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {agreement.value && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Agreement Value
                          </label>
                          <p className="text-sm flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {formatCurrency(agreement.value, agreement.currency)}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Created By
                        </label>
                        <p className="text-sm flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {agreement.created_by || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </label>
                        <p className="text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatDateTime(agreement.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {agreement.metadata?.description && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Description
                        </label>
                        <p className="text-sm mt-2">{agreement.metadata.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Files and attachments related to this agreement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DocumentUpload 
                    agreementId={agreementId} 
                    onUploadSuccess={refetchDocuments}
                  />
                  {isLoadingDocuments ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <DocumentList 
                      documents={documents} 
                      onDocumentDeleted={refetchDocuments}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="negotiations" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Negotiations</CardTitle>
                      <CardDescription>
                        Active and completed negotiations for this agreement
                      </CardDescription>
                    </div>
                    <CreateNegotiationDialog 
                      agreementId={agreementId}
                      onSuccess={refetchNegotiations}
                    >
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Start Negotiation
                      </Button>
                    </CreateNegotiationDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <NegotiationList 
                    negotiations={negotiations}
                    isLoading={isLoadingNegotiations}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approvals" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Approval Workflow</CardTitle>
                      <CardDescription>
                        Approval status and workflow progress
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Request Approval
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>No approval workflow started</p>
                    <p className="text-sm">Request approvals when ready</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    Recent activity and changes to this agreement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">Agreement created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(agreement.created_at)}
                        </p>
                      </div>
                    </div>
                    {agreement.updated_at !== agreement.created_at && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm">Agreement updated</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(agreement.updated_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CreateNegotiationDialog 
                agreementId={agreementId}
                onSuccess={refetchNegotiations}
              >
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Negotiation
                </Button>
              </CreateNegotiationDialog>
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Request Approval
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <InviteUserDialog agreementId={agreementId}>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Share Agreement
                </Button>
              </InviteUserDialog>
            </CardContent>
          </Card>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <Badge
                  className={statusColors[agreement.status as keyof typeof statusColors]}
                  variant="secondary"
                >
                  {statusLabels[agreement.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Documents</span>
                  <span>{documents.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Negotiations</span>
                  <span>{negotiations.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Approvals</span>
                  <span>Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}