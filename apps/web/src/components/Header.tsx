
"use client"
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-900 to-indigo-700 text-white p-4 shadow-lg">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold tracking-wide hover:text-gray-100 transition-colors duration-300">
          Nest-Next Clean Arch
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="text-lg hover:text-blue-300 transition-colors duration-300">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-lg hover:text-blue-300 transition-colors duration-300">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
