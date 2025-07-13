'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import Link from 'next/link';
import { AgreementCreate } from '@/types/api';
import { useCreateAgreement } from '@/hooks/use-agreements';

const agreementSchema = z.object({
  title: z.string().min(1, 'Agreement title is required'),
  agreement_number: z.string().min(1, 'Agreement number is required'),
  agreement_type: z.string().optional(),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional(),
  value: z.string().optional(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
});

type AgreementFormData = z.infer<typeof agreementSchema>;

const agreementTypes = [
  'Service Agreement',
  'Software License',
  'Non-Disclosure Agreement',
  'Employment Contract',
  'Vendor Agreement',
  'Partnership Agreement',
  'Lease Agreement',
  'Other',
];

export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createAgreementMutation = useCreateAgreement();

  const form = useForm<AgreementFormData>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      title: '',
      agreement_number: '',
      agreement_type: '',
      effective_date: '',
      expiration_date: '',
      value: '',
      currency: 'USD',
      description: '',
    },
  });

  const onSubmit = async (data: AgreementFormData) => {
    try {
      // Prepare the data for API
      const agreementData: AgreementCreate = {
        title: data.title,
        agreement_number: data.agreement_number,
        agreement_type: data.agreement_type || undefined,
        effective_date: data.effective_date || undefined,
        expiration_date: data.expiration_date || undefined,
        value: data.value ? parseFloat(data.value) : undefined,
        currency: data.currency,
        metadata: {
          description: data.description,
        },
      };

      // Use React Query mutation
      await createAgreementMutation.mutateAsync(agreementData);

      toast({
        title: 'Agreement created successfully',
        description: `Agreement "${data.title}" has been created.`,
      });

      router.push('/agreements');
    } catch (error: any) {
      toast({
        title: 'Failed to create agreement',
        description: error?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/agreements">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agreements
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Agreement</h1>
          <p className="text-muted-foreground">
            Enter the details for your new agreement
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Agreement Information</span>
            </CardTitle>
            <CardDescription>
              Fill in the basic information for your agreement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Agreement Title *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Software License Agreement"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreement_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agreement Number *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., SLA-2024-001"
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for this agreement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreement_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agreement Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select agreement type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {agreementTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="effective_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiration_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Agreement Value</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief description of the agreement purpose and scope..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description to help identify this agreement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAgreementMutation.isPending}>
                    {createAgreementMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Agreement
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}