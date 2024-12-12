"use client";

import Image from 'next/image';

const companies = [
  {
    name: 'TechTalk Daily',
    logo: '/logos/techtalk.svg',
  },
  {
    name: 'HealthEd Institute',
    logo: '/logos/healthed.svg',
  },
  {
    name: 'MediaPro Studios',
    logo: '/logos/mediapro.svg',
  },
  {
    name: 'EduTech Solutions',
    logo: '/logos/edutech.svg',
  },
  {
    name: 'Global Research Corp',
    logo: '/logos/globalresearch.svg',
  },
  {
    name: 'Innovation Labs',
    logo: '/logos/innovationlabs.svg',
  },
];

export const TrustedBy = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center text-sm font-semibold text-gray-500 tracking-wide uppercase mb-8">
        Trusted by leading companies worldwide
      </p>
      
      <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-6">
        {companies.map((company) => (
          <div
            key={company.name}
            className="col-span-1 flex justify-center items-center grayscale hover:grayscale-0 transition-all duration-200"
          >
            <div className="relative h-12 w-full">
              <Image
                src={company.logo}
                alt={company.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm text-gray-500">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          SOC 2 Type II Certified
        </div>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          HIPAA Compliant
        </div>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          GDPR Compliant
        </div>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          99.9% Uptime SLA
        </div>
      </div>
    </div>
  );
};
