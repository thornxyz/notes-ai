import Link from "next/link";
import Profile from "./profile";
import { ThemeToggle } from "./ui/theme-toggle";

function Navbar() {
  return (
    <div className="flex border justify-between p-4 rounded-2xl shadow-md items-center mx-4">
      <Link href="/">
        <h1 className="text-4xl font-bold ml-6">Notes</h1>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Profile />
      </div>
    </div>
  );
}

export default Navbar;
