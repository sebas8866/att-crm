'use client';

import { useState, useEffect } from 'react';
import { ConversationList } from '@/components/ConversationList';
import { MessageThread } from '@/components/MessageThread';
import { ATTChecker } from '@/components/ATTChecker';

interface Conversation {
  id: string;
  status: string;
  lastMessageAt: string;
  customer: {
    id: string;
    phoneNumber: string;
    name: string | null;
  };
  messages: Array<{
    id: string;
    body: string;
    direction: string;
    createdAt: string;
  }>;
  availabilityChecks: Array<{
    id: string;
    status: string;
    services: string[];
  }>;
}

export default function DashboardPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectConversation = async (conversation: Conversation) => {
    // Fetch full conversation details
    try {
      const response = await fetch(`/api/conversations/${conversation.id}`);
      const data = await response.json();
      setSelectedConversation(data.conversation);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  const handleSendMessage = async (body: string) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch('/api/twilio/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          body,
        }),
      });

      if (response.ok) {
        // Refresh conversation
        handleSelectConversation(selectedConversation);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStatusChange = async (conversationId: string, status: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchConversations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Conversation List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          loading={loading}
        />
      </div>

      {/* Message Thread */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <MessageThread
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* AT&T Checker */}
        {selectedConversation && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ATTChecker
              customer={selectedConversation.customer}
              conversationId={selectedConversation.id}
              availabilityChecks={selectedConversation.availabilityChecks}
            />
          </div>
        )}
      </div>
    </div>
  );
}
