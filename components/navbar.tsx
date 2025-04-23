import Link from "next/link";
import Profile from "./profile";

function Navbar() {
  return (
    <div className="flex justify-between items-center mx-4">
      <Link href="/">
        <h1 className="text-4xl font-bold">Notes</h1>
      </Link>
      <Profile />
    </div>
  );
}
export default Navbar;
