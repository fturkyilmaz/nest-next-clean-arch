"use client"
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900 opacity-80 animate-gradient-shift"></div>

      <div className="relative z-10 text-center max-w-4xl text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Welcome to the Future of Diet Management
        </h1>
        <p className="text-xl md:text-2xl mb-10 leading-relaxed opacity-90">
          Experience a robust and scalable application built with a **clean architecture** approach, powered by NestJS for the backend and Next.js for the frontend. Our platform provides a solid foundation for building maintainable and testable applications that prioritize performance and user experience.
        </p>
        <p className="text-lg opacity-80 mb-12">
          Dive deep into the codebase to understand the intricate separation of concerns, the power of domain-driven design principles, and how various layers seamlessly interact to create a cohesive and high-performing system.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/login" className="px-10 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105">
            Login to Your Journey
          </Link>
          <Link href="/register" className="px-10 py-4 border-2 border-white text-white font-bold rounded-full shadow-lg hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:scale-105">
            Start Your Free Trial
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>
    </main>
  );
}
