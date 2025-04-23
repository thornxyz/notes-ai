import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex gap-4">
      <Link href="/dashboard">
        <Button>/dashboard</Button>
      </Link>

      <Link href="/profile">
        <Button>/profile</Button>
      </Link>
    </div>
  );
}
