import { useState } from 'react';

export const SavingsCalculator = () => {
  const [audioHours, setAudioHours] = useState(5);
  const [timeframe, setTimeframe] = useState('month');

  // Calculate traditional transcription costs (average market rate: $1.50 per minute)
  const traditionalCost = audioHours * 60 * 1.50;
  
  // Calculate our cost based on Professional plan ($129 for 10 hours)
  const ourCost = Math.ceil(audioHours / 10) * 129;
  
  // Calculate savings
  const savings = traditionalCost - ourCost;
  const savingsPercentage = Math.round((savings / traditionalCost) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Calculate Your Savings
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours of Audio
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={audioHours}
            onChange={(e) => setAudioHours(Number(e.target.value))}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>1 hour</span>
            <span>{audioHours} hours</span>
            <span>50 hours</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Frame
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="week">Per Week</option>
            <option value="month">Per Month</option>
            <option value="year">Per Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Traditional Cost
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ${traditionalCost.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Based on industry average
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Our Cost
          </h3>
          <p className="text-3xl font-bold text-purple-900">
            ${ourCost.toFixed(2)}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            Professional plan
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Your Savings
          </h3>
          <p className="text-3xl font-bold text-green-900">
            ${savings.toFixed(2)}
          </p>
          <p className="text-sm text-green-600 mt-1">
            Save {savingsPercentage}% on transcription
          </p>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        * Calculations based on industry average rates of $1.50 per minute for traditional transcription services
      </p>
    </div>
  );
};
