import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ascent-black flex flex-col items-center justify-center p-4 relative">
      
      {/* Subtle Escape Hatch */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 text-sm text-gray-500 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Base
      </Link>

      {children}
    </div>
  );
}