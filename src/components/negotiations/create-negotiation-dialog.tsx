'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Plus, X, UserPlus } from 'lucide-react';
import { useCreateNegotiation } from '@/hooks/use-negotiations';
import type { NegotiationParticipant } from '@/services/negotiation.service';

const participantSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  role: z.enum(['initiator', 'counterparty', 'observer', 'legal_counsel', 'delegate']),
  organization_id: z.string().optional(),
  permissions: z.object({
    can_propose: z.boolean().default(true),
    can_comment: z.boolean().default(true),
    can_invite_others: z.boolean().default(false),
    can_view_private_notes: z.boolean().default(false),
    can_end_negotiation: z.boolean().default(false),
  }).optional(),
});

const negotiationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  participants: z.array(participantSchema).min(1, 'At least one participant is required'),
});

type NegotiationFormData = z.infer<typeof negotiationSchema>;

interface CreateNegotiationDialogProps {
  agreementId: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const roleLabels = {
  initiator: 'Initiator',
  counterparty: 'Counterparty',
  observer: 'Observer',
  legal_counsel: 'Legal Counsel',
  delegate: 'Delegate',
};

const roleDescriptions = {
  initiator: 'Can create proposals and lead the negotiation',
  counterparty: 'Can respond to proposals and create counter-proposals',
  observer: 'Can view negotiation but cannot participate directly',
  legal_counsel: 'Legal advisor with full access to documents and discussions',
  delegate: 'Acting on behalf of another party with specified permissions',
};

export default function CreateNegotiationDialog({ 
  agreementId, 
  children,
  onSuccess 
}: CreateNegotiationDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createNegotiationMutation = useCreateNegotiation();

  const form = useForm<NegotiationFormData>({
    resolver: zodResolver(negotiationSchema),
    defaultValues: {
      title: '',
      description: '',
      deadline: '',
      participants: [{
        user_id: '',
        role: 'counterparty',
        permissions: {
          can_propose: true,
          can_comment: true,
          can_invite_others: false,
          can_view_private_notes: false,
          can_end_negotiation: false,
        },
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  });

  const addParticipant = () => {
    append({
      user_id: '',
      role: 'observer',
      permissions: {
        can_propose: false,
        can_comment: true,
        can_invite_others: false,
        can_view_private_notes: false,
        can_end_negotiation: false,
      },
    });
  };

  const onSubmit = async (data: NegotiationFormData) => {
    try {
      const negotiationData = {
        agreement_id: agreementId,
        title: data.title,
        description: data.description || undefined,
        deadline: data.deadline || undefined,
        settings: {},
        participants: data.participants.map(p => ({
          user_id: p.user_id,
          role: p.role,
          organization_id: p.organization_id,
          permissions: p.permissions || {
            can_propose: p.role === 'initiator' || p.role === 'counterparty',
            can_comment: true,
            can_invite_others: p.role === 'initiator',
            can_view_private_notes: p.role === 'legal_counsel',
            can_end_negotiation: p.role === 'initiator',
          },
        })),
      };

      await createNegotiationMutation.mutateAsync(negotiationData);

      toast({
        title: 'Negotiation created',
        description: `"${data.title}" has been created successfully`,
      });

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Failed to create negotiation',
        description: error?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Start Negotiation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start New Negotiation</DialogTitle>
          <DialogDescription>
            Create a new negotiation to collaborate on agreement terms with other parties.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negotiation Title *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Q1 2024 Software License Terms"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="datetime-local" />
                      </FormControl>
                      <FormDescription>
                        Set a deadline for completing this negotiation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the goals and scope of this negotiation..."
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide context for participants about what will be negotiated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Participants</h3>
                  <p className="text-sm text-muted-foreground">
                    Add parties who will participate in this negotiation
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addParticipant}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Participant {index + 1}
                        </CardTitle>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`participants.${index}.user_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User ID/Email *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="user@example.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`participants.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(roleLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      <div>
                                        <div className="font-medium">{label}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {roleDescriptions[value as keyof typeof roleDescriptions]}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`participants.${index}.organization_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization ID (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Organization identifier"
                              />
                            </FormControl>
                            <FormDescription>
                              Leave empty to use participant's current organization
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <FormLabel>Permissions</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'can_propose', label: 'Create Proposals' },
                            { key: 'can_comment', label: 'Add Comments' },
                            { key: 'can_invite_others', label: 'Invite Others' },
                            { key: 'can_view_private_notes', label: 'View Private Notes' },
                            { key: 'can_end_negotiation', label: 'End Negotiation' },
                          ].map(({ key, label }) => (
                            <FormField
                              key={key}
                              control={form.control}
                              name={`participants.${index}.permissions.${key}` as any}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="rounded"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createNegotiationMutation.isPending}
              >
                {createNegotiationMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Creating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start Negotiation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}