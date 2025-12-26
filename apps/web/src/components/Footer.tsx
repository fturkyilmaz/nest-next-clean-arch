"use client";
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react"; // Mail ikonu eklendi

export default function Footer() {
  return (
    <footer className=" bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900 text-white py-6 mt-12 border-t border-gray-700">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-6">
        {/* Brand */}
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Furkan Turkyılmaz. All rights reserved.
        </p>

        {/* Social Links */}
        <div className="flex space-x-6">
          <Link
            href="https://github.com/fturkyilmaz"
            target="_blank"
            className="hover:text-gray-300 transition-colors duration-300"
          >
            <Github className="w-5 h-5" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/furkanturkyilmaz"
            target="_blank"
            className="hover:text-gray-300 transition-colors duration-300"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
          <Link
            href="mailto:trkyilmazfurkan@gmail.com" 
            className="hover:text-gray-300 transition-colors duration-300"
          >
            <Mail className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
