import { SubscriptionService } from '@/lib/subscription-service';
import { auth } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { ComparisonTable } from '@/components/pricing/ComparisonTable';
import { SavingsCalculator } from '@/components/pricing/SavingsCalculator';
import { Testimonials } from '@/components/pricing/Testimonials';
import { TrustedBy } from '@/components/pricing/TrustedBy';

export default function PricingPage() {
  const { userId } = auth();
  const plans = SubscriptionService.getAllPlans();

  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen">
      {/* Trusted By Section */}
      <div className="w-full bg-white py-8 border-b border-gray-100">
        <TrustedBy />
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:text-5xl">
              Simple, Time-Based Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your transcription needs. 
              Pay only for the time you need, with no long-term commitments.
            </p>
          </div>

          {/* Savings Calculator */}
          <div className="mb-16">
            <SavingsCalculator />
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-4 mb-16">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative rounded-2xl shadow-lg bg-white p-8 transition-transform duration-300 hover:scale-105 
                  ${plan.id === 'professional' ? 'border-2 border-purple-500 lg:scale-105' : ''}
                  ${plan.id === 'enterprise' ? 'lg:col-span-1' : ''}
                `}
              >
                {plan.id === 'professional' && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-block bg-gradient-to-r from-purple-600 to-purple-400 text-white text-sm px-4 py-1 rounded-full font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-x-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/{plan.duration}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Up to {plan.maxAudioHours} hours of audio</p>
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-4 text-sm text-gray-600">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-purple-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Mobile-optimized button spacing */}
                <div className="mt-8 sm:mt-12">
                  {plan.id === 'enterprise' ? (
                    <Link
                      href="/contact"
                      className="block w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white text-center py-4 sm:py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-500 transition-colors"
                    >
                      Contact Sales
                    </Link>
                  ) : (
                    <Link
                      href={userId ? `/checkout/${plan.id}` : '/sign-up'}
                      className={`block w-full text-center py-4 sm:py-3 px-4 rounded-lg font-medium transition-colors
                        ${plan.id === 'professional' 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:from-purple-700 hover:to-purple-500'
                          : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
                        }`}
                    >
                      {userId ? 'Get Started' : 'Sign Up Now'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials Section */}
          <div className="mb-24">
            <Testimonials />
          </div>

          {/* Detailed Comparison Table */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Compare Plans in Detail
            </h2>
            <ComparisonTable plans={plans} />
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How does the time-based pricing work?
                </h3>
                <p className="text-gray-600">
                  Our plans give you full access to transcription features for a specific duration. 
                  You can transcribe up to your plan's audio hour limit anytime within that period.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens when my plan expires?
                </h3>
                <p className="text-gray-600">
                  You'll maintain access to your transcriptions forever, but you'll need to renew or 
                  purchase a new plan to transcribe more audio files.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I upgrade my plan?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade to a higher tier at any time. We'll prorate the cost based on 
                  your remaining time and audio hours.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What's your accuracy rate?
                </h3>
                <p className="text-gray-600">
                  Our AI-powered transcription maintains a 93%+ accuracy rate across all plans, with even 
                  higher accuracy for Professional and Business plans due to custom vocabulary features.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-24 bg-purple-900 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to start transcribing?
            </h2>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              Try our demo with 10 minutes of free transcription. No credit card required.
            </p>
            <Link
              href={userId ? "/dashboard" : "/"}
              className="inline-block bg-white text-purple-900 px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
            >
              Try Free Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
