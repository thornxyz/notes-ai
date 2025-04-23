import Link from "next/link";
import Profile from "./profile";
import { ThemeToggle } from "./ui/theme-toggle";
import { FaPenAlt } from "react-icons/fa";

function Navbar() {
  return (
    <div className="flex flex-wrap justify-between items-center border p-4 rounded-2xl shadow-md mx-4">
      <Link href="/" className="ml-4 mb-2 sm:mb-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex gap-2 items-center">
          Notes.ai <FaPenAlt className="w-5 h-5 sm:w-6 sm:h-6" />
        </h1>
      </Link>
      <div className="flex items-center gap-4 ml-auto">
        <ThemeToggle />
        <Profile />
      </div>
    </div>
  );
}

export default Navbar;
