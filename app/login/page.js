"use client";
import { useState } from "react";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Re-using the LogoIcon from our main app for consistency
const LogoIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
    </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error on new submission
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect to homepage after login
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred during login. Please try again later.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1F2937] text-gray-200 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#111827] rounded-lg shadow-lg">
        {/* Header Section */}
        <div className="text-center">
            <div className="flex justify-center mx-auto mb-4">
                <LogoIcon className="w-12 h-12 text-purple-400" />
            </div>
          <h1 className="text-3xl font-bold text-white">Welcome back to SpeakUp</h1>
          <p className="mt-2 text-gray-400">Sign in to continue your practice.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition-colors duration-300"
          >
            Login
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-center text-red-400 bg-red-900/50 p-3 rounded-md">
            {error}
          </p>
        )}

        {/* Link to Sign Up */}
        <p className="text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="font-medium text-purple-400 hover:text-purple-300">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}