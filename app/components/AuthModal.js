"use client";
import { useState } from "react";
import { auth } from "../../app/firebaseConfig";// Correct path: up one to root, down into 'app'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Image from "next/image";

const CloseIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
);

export default function AuthModal({ isOpen, onClose }) {
  const [authType, setAuthType] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (authType === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password.length < 6) throw new Error("Password should be at least 6 characters.");
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-8 bg-[#111827] rounded-lg border-2 border-gray-400 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        <div className="flex border-b border-gray-600 mb-6">
          <button onClick={() => { setAuthType("login"); setError(""); }} className={`w-1/2 py-3 text-lg font-semibold transition-colors ${authType === "login" ? "text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"}`}>Login</button>
          <button onClick={() => { setAuthType("signup"); setError(""); }} className={`w-1/2 py-3 text-lg font-semibold transition-colors ${authType === "signup" ? "text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"}`}>Sign Up</button>
        </div>
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed">{loading ? 'Processing...' : (authType === "login" ? "Continue with Email" : "Create Account")}</button>
        </form>
        <div className="flex items-center my-6"><hr className="flex-grow border-t border-gray-600" /><span className="mx-4 text-gray-400 text-sm">OR</span><hr className="flex-grow border-t border-gray-600" /></div>
        <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-semibold transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed">
            <Image src="/google-icon.png" alt="Google" width={20} height={20} className="mr-3" />
            Continue with Google
        </button>
        {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      </div>
    </div>
  );
}