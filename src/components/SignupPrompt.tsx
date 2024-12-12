import React from 'react';
import Link from 'next/link';

interface SignupPromptProps {
  message?: string;
  signupUrl?: string;
}

export const SignupPrompt: React.FC<SignupPromptProps> = ({
  message = "Sign up to unlock unlimited transcriptions and advanced features!",
  signupUrl = "/signup"
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-lg font-medium">{message}</p>
        <Link
          href={signupUrl}
          className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-purple-50 transition-colors"
        >
          Sign Up Now
        </Link>
      </div>
    </div>
  );
};
