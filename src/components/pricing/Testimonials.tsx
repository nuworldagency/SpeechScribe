"use client";

import Image from 'next/image';

const testimonials = [
  {
    content: "SpeechScribe has revolutionized our podcast production workflow. The time-based pricing model is perfect for our weekly show schedule.",
    author: "Sarah Chen",
    role: "Podcast Producer",
    company: "TechTalk Daily",
    image: "/testimonials/sarah.jpg"
  },
  {
    content: "The accuracy is incredible, and the custom vocabulary feature helps perfectly capture technical terms in our medical lectures.",
    author: "Dr. James Wilson",
    role: "Medical Education Director",
    company: "HealthEd Institute",
    image: "/testimonials/james.jpg"
  },
  {
    content: "We switched from traditional transcription services and saved over 60% while getting faster, more accurate results.",
    author: "Michael Rodriguez",
    role: "Content Manager",
    company: "MediaPro Studios",
    image: "/testimonials/michael.jpg"
  }
];

export const Testimonials = () => {
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Trusted by Industry Leaders
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:scale-105"
          >
            {/* Quote Icon */}
            <svg
              className="h-8 w-8 text-purple-400 mb-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            {/* Testimonial Content */}
            <blockquote className="text-gray-700 mb-6">
              "{testimonial.content}"
            </blockquote>

            {/* Author Info */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative h-10 w-10">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-base font-semibold text-gray-900">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.role}
                </div>
                <div className="text-sm text-purple-600">
                  {testimonial.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 bg-purple-900 rounded-2xl p-8 text-white">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">93%+</div>
          <div className="text-purple-200">Transcription Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">60%</div>
          <div className="text-purple-200">Average Cost Savings</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">10k+</div>
          <div className="text-purple-200">Hours Transcribed</div>
        </div>
      </div>
    </div>
  );
};
