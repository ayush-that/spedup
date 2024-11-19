import Link from "next/link";
import { Twitter } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end p-4 bg-transparent">
      <Link
        href="https://x.com/shydev69"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 transition-colors"
      >
        <Twitter className="w-5 h-5 text-white" />
      </Link>
    </nav>
  );
}
