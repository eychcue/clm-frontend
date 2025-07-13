'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { NegotiationSummary } from '@/services/negotiation.service';

interface NegotiationListProps {
  negotiations: NegotiationSummary[];
  isLoading?: boolean;
}

const statusColors = {
  initiated: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  abandoned: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  initiated: 'Initiated',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  abandoned: 'Abandoned',
  expired: 'Expired',
};

export default function NegotiationList({ negotiations, isLoading }: NegotiationListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLastActivity = (dateString: string | undefined) => {
    if (!dateString) return 'No activity';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (negotiations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="mx-auto h-12 w-12 mb-4" />
        <p>No negotiations started</p>
        <p className="text-sm">Start a negotiation to collaborate on terms</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {negotiations.map((negotiation) => (
        <Card key={negotiation.negotiation_id} className="hover:shadow-md transition-shadow">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium truncate">{negotiation.title}</h4>
                  <Badge
                    className={statusColors[negotiation.status as keyof typeof statusColors]}
                    variant="secondary"
                  >
                    {statusLabels[negotiation.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{negotiation.total_rounds} rounds</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{negotiation.active_participants} participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatLastActivity(negotiation.last_activity)}</span>
                  </div>
                  <span>•</span>
                  <span>Active {negotiation.days_active} days</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link href={`/negotiations/${negotiation.negotiation_id}`}>
                  View <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}