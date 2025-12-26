"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Menu, Home, Info, LogIn, LogOut, LayoutDashboard, User } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    try {
      logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full backdrop-blur-md bg-gradient-to-r from-purple-900/90 to-indigo-700/90 text-white shadow-lg z-50">
      <nav className="container mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl font-extrabold tracking-wide group"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform transition-transform duration-300 group-hover:rotate-12">
            <Home className="w-6 h-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="group-hover:text-blue-300 transition-colors duration-300">
              Nest-Next
            </span>
            <span className="text-sm font-light text-gray-200 group-hover:text-gray-100">
              Clean Arch
            </span>
          </span>
        </Link>


        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 items-center">
          {isAuthenticated ? (
            <>
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg hover:text-blue-300 transition-colors duration-300"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-200 px-3 py-1 bg-white/10 rounded-full">
                <User className="w-5 h-5" />
                {user?.firstName} {user?.lastName}
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors duration-300 font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg hover:text-blue-300 transition-colors duration-300"
                >
                  <Home className="w-5 h-5" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-lg hover:text-blue-300 transition-colors duration-300"
                >
                  <Info className="w-5 h-5" />
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors duration-300 font-semibold"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Icon */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/10">
          <Menu className="w-6 h-6" />
        </button>
      </nav>
    </header>
  );
}
