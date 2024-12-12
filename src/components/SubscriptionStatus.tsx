import React from 'react';
import { TranscriptionQuota } from '@/types/subscription';

interface SubscriptionStatusProps {
  quota: TranscriptionQuota;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ quota }) => {
  const { remainingHours, totalHours, expiresAt } = quota;
  const usedHours = totalHours - remainingHours;
  const percentageUsed = (usedHours / totalHours) * 100;

  // Format the expiration date
  const expiresFormatted = new Date(expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Subscription Status
      </h3>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{remainingHours} hours remaining</span>
          <span>{totalHours} hours total</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: `${percentageUsed}%` }}
          ></div>
        </div>
      </div>

      {/* Time remaining */}
      <div className="text-sm text-gray-600">
        <p>Expires: {expiresFormatted}</p>
      </div>

      {/* Warning if running low */}
      {remainingHours < totalHours * 0.2 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            Running low on hours! Consider extending your subscription.
          </p>
        </div>
      )}
    </div>
  );
};
