import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmailVerificationResult = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login'); // Assuming you have a login route
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Email Verified Successfully</h2>
        <p className="text-gray-700 mb-6">Your email has been successfully verified. You can now log in.</p>
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationResult;
