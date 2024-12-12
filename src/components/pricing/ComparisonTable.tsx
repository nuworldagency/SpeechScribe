"use client";

import { Plan } from '@/types/subscription';

interface ComparisonTableProps {
  plans: Plan[];
}

const featureCategories = [
  {
    name: 'Core Features',
    features: [
      'Audio Hours',
      'Access Duration',
      'Transcription Accuracy',
      'Download Formats',
      'Basic Summary',
    ],
  },
  {
    name: 'Advanced Features',
    features: [
      'Speaker Diarization',
      'Custom Vocabulary',
      'Profanity Filtering',
      'Entity Detection',
      'Sentiment Analysis',
      'Topic Detection',
    ],
  },
  {
    name: 'Enterprise Features',
    features: [
      'API Access',
      'Team Collaboration',
      'Custom Integration',
      'Priority Support',
      'SLA Guarantee',
    ],
  },
];

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ plans }) => {
  const getFeatureAvailability = (planId: string, feature: string): { available: boolean; detail?: string } => {
    switch (feature) {
      case 'Audio Hours':
        const plan = plans.find(p => p.id === planId);
        return { available: true, detail: `${plan?.maxAudioHours} hours` };
      case 'Access Duration':
        const duration = plans.find(p => p.id === planId)?.duration;
        return { available: true, detail: duration };
      case 'Transcription Accuracy':
        return { 
          available: true, 
          detail: planId === 'starter' ? '93%+' : planId === 'professional' ? '95%+' : '97%+'
        };
      case 'Download Formats':
        return { 
          available: true,
          detail: planId === 'starter' ? 'TXT, DOC' : 'All Formats'
        };
      default:
        const features = plans.find(p => p.id === planId)?.features || [];
        return { available: features.some(f => f.toLowerCase().includes(feature.toLowerCase())) };
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="py-3 pl-6 bg-gray-50 text-left text-sm font-semibold text-gray-900 sm:pl-3">
              Features
            </th>
            {plans.map((plan) => (
              <th key={plan.id} className="px-3 py-3 bg-gray-50 text-center text-sm font-semibold text-gray-900">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {featureCategories.map((category) => (
            <>
              <tr key={`${category.name}-header`} className="bg-gray-50">
                <th
                  colSpan={plans.length + 1}
                  className="py-2 pl-6 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                >
                  {category.name}
                </th>
              </tr>
              {category.features.map((feature, featureIdx) => (
                <tr key={feature} className={featureIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-4 pl-6 text-sm font-medium text-gray-900 sm:pl-3">
                    {feature}
                  </td>
                  {plans.map((plan) => {
                    const { available, detail } = getFeatureAvailability(plan.id, feature);
                    return (
                      <td key={`${plan.id}-${feature}`} className="px-3 py-4 text-center">
                        {detail ? (
                          <span className="text-sm text-gray-900">{detail}</span>
                        ) : available ? (
                          <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-300 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};
