'use client';

import { useState } from 'react';
import { Search, Wifi, Zap, AlertCircle, Loader2, Check } from 'lucide-react';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';

interface AvailabilityCheck {
  id: string;
  status: string;
  services: string[];
  fiberSpeeds?: string[];
  internetAir?: boolean;
  notes?: string;
  checkedAt: string;
}

interface Customer {
  id: string;
  phoneNumber: string;
  name: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

interface ATTCheckerProps {
  customer: Customer;
  conversationId: string;
  availabilityChecks: AvailabilityCheck[];
}

export function ATTChecker({
  customer,
  conversationId,
  availabilityChecks,
}: ATTCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AvailabilityCheck | null>(null);
  const [manualAddress, setManualAddress] = useState({
    street: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    zipCode: customer.zipCode || '',
  });

  const handleCheck = async () => {
    if (!manualAddress.street || !manualAddress.city || !manualAddress.state || !manualAddress.zipCode) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/att/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          conversationId,
          address: manualAddress,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          id: 'new',
          status: data.result.status,
          services: data.result.services,
          fiberSpeeds: data.result.fiberSpeeds,
          internetAir: data.result.internetAir,
          notes: data.result.notes,
          checkedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const latestCheck = result || availabilityChecks[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Wifi className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">AT&T Service Checker</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Street Address"
          value={manualAddress.street}
          onChange={(e) => setManualAddress({ ...manualAddress, street: e.target.value })}
          className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="text"
          placeholder="City"
          value={manualAddress.city}
          onChange={(e) => setManualAddress({ ...manualAddress, city: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="text"
          placeholder="State"
          value={manualAddress.state}
          onChange={(e) => setManualAddress({ ...manualAddress, state: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <input
          type="text"
          placeholder="ZIP Code"
          value={manualAddress.zipCode}
          onChange={(e) => setManualAddress({ ...manualAddress, zipCode: e.target.value })}
          className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleCheck}
        disabled={loading || !manualAddress.street || !manualAddress.city || !manualAddress.state || !manualAddress.zipCode}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Check Availability
          </>
        )}
      </button>

      {latestCheck && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">Last Check Result</span>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full font-medium',
                getStatusColor(latestCheck.status)
              )}
            >
              {getStatusLabel(latestCheck.status)}
            </span>
          </div>

          {latestCheck.status === 'FIBER_AVAILABLE' && (
            <div className="flex items-start gap-3 text-green-700">
              <Zap className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">AT&T Fiber Available!</p>
                {latestCheck.fiberSpeeds && latestCheck.fiberSpeeds.length > 0 && (
                  <p className="text-sm">
                    Speeds up to: {latestCheck.fiberSpeeds.join(', ')} Mbps
                  </p>
                )}
              </div>
            </div>
          )}

          {latestCheck.status === 'INTERNET_AIR_AVAILABLE' && (
            <div className="flex items-start gap-3 text-blue-700">
              <Wifi className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Internet Air Available!</p>
                <p className="text-sm">High-speed wireless internet via 5G</p>
              </div>
            </div>
          )}

          {latestCheck.status === 'NOT_AVAILABLE' && (
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Not Available</p>
                <p className="text-sm">AT&T services are not available at this address</p>
              </div>
            </div>
          )}

          {latestCheck.notes && (
            <p className="text-sm text-gray-600 mt-2">{latestCheck.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
