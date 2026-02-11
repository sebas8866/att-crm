'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Loader2 } from 'lucide-react';
import { cn, formatPhoneNumber, getStatusColor, getStatusLabel } from '@/lib/utils';

export interface Message {
  id: string;
  body: string;
  direction: string;
  status?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  phoneNumber: string;
  name: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export interface Conversation {
  id: string;
  status: string;
  lastMessageAt: string;
  customer: Customer;
  messages: Message[];
  availabilityChecks?: Array<{
    id: string;
    status: string;
    services: string[];
    fiberSpeeds?: string[];
    internetAir?: boolean;
    notes?: string;
    checkedAt?: string;
  }>;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  loading: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Conversations</h2>
        <p className="text-sm text-gray-500 mt-1">
          {conversations.length} total
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <MessageSquare className="w-12 h-12 mb-3" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                  selectedId === conversation.id && 'bg-blue-50 hover:bg-blue-50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conversation.customer.name || formatPhoneNumber(conversation.customer.phoneNumber)}
                    </p>
                    
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conversation.messages[0]?.body || 'No messages'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                        addSuffix: true,
                      })}
                    </span>
                    
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        getStatusColor(conversation.status)
                      )}
                    >
                      {getStatusLabel(conversation.status)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
