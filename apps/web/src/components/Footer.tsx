// components/Footer.tsx
"use client"
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Nest-Next Clean Arch. All rights reserved.</p>
      </div>
    </footer>
  );
}
