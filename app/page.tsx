import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <h1 className="text-5xl font-bold mb-4">Welcome to Notes</h1>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        Capture your thoughts, organize ideas, and keep everything in one place.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link href="/notes/new">
          <Button size="lg" className="cursor-pointer px-8 py-6 text-lg">
            Create New Note
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button
            variant="secondary"
            size="lg"
            className="cursor-pointer px-8 py-6 text-lg"
          >
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
