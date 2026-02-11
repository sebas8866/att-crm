'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Phone, MoreVertical, Check, X, Loader2 } from 'lucide-react';
import { cn, formatPhoneNumber, formatTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Conversation, Message, Customer } from './ConversationList';

interface MessageThreadProps {
  conversation: Conversation | null;
  onSendMessage: (message: string) => void;
  onStatusChange: (conversationId: string, status: string) => void;
}

export function MessageThread({
  conversation,
  onSendMessage,
  onStatusChange,
}: MessageThreadProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <MessageSquareIcon className="w-16 h-16 mb-4" />
        <p className="text-lg">Select a conversation to view messages</p>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    await onSendMessage(message);
    setMessage('');
    setSending(false);
  };

  const statuses = ['NEW', 'ADDRESS_REQUESTED', 'CHECKING', 'RESPONDED', 'CLOSED'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          
          <div>
            <p className="font-semibold text-gray-900">
              {conversation.customer.name || formatPhoneNumber(conversation.customer.phoneNumber)}
            </p>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone className="w-3 h-3" />
              {formatPhoneNumber(conversation.customer.phoneNumber)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={conversation.status}
            onChange={(e) => onStatusChange(conversation.id, e.target.value)}
            className={cn(
              'text-sm px-3 py-1.5 rounded-lg border-0 font-medium cursor-pointer',
              getStatusColor(conversation.status)
            )}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Info */}
      {conversation.customer.address && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Address:</span>{' '}
            {conversation.customer.address}
            {conversation.customer.city && `, ${conversation.customer.city}`}
            {conversation.customer.state && `, ${conversation.customer.state}`}
            {conversation.customer.zipCode && ` ${conversation.customer.zipCode}`}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[70%] rounded-2xl px-4 py-2',
                msg.direction === 'OUTBOUND'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              )}
            >
              <p className="text-sm">{msg.body}</p>
              
              <div
                className={cn(
                  'flex items-center gap-1 mt-1 text-xs',
                  msg.direction === 'OUTBOUND' ? 'text-blue-200' : 'text-gray-400'
                )}
              >
                <span>{formatTime(msg.createdAt)}</span>
                
                {msg.direction === 'OUTBOUND' && msg.status === 'DELIVERED' && (
                  <Check className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
