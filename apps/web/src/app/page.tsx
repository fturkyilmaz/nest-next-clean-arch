"use client";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react"; // modern ikonlar

export default function Home() {
  return (
    <main className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-8 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 opacity-90 animate-gradient-shift"></div>

      {/* Glassmorphism Content */}
      <div className="relative z-10 text-center max-w-4xl text-white backdrop-blur-md bg-white/10 rounded-3xl p-10 shadow-2xl animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Welcome to the Future of Diet Management
        </h1>
        <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
          Experience a robust and scalable application built with a{" "}
          <span className="font-bold text-green-300">clean architecture</span>{" "}
          approach, powered by NestJS & Next.js. Our platform is designed for
          performance, maintainability, and user experience.
        </p>
        <p className="text-lg opacity-80 mb-12">
          Dive deep into the codebase to explore domain-driven design principles
          and seamless layer interactions that create a cohesive, high-performing
          system.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            <LogIn className="w-5 h-5" /> Login to Your Journey
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-full shadow-lg hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <UserPlus className="w-5 h-5" /> Start Your Free Trial
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 12s ease infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease forwards;
        }
      `}</style>
    </main>
  );
}
