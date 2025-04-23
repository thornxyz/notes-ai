"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import useUser from "@/app/hook/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { protectedRoutes } from "@/lib/constant";

function Profile() {
  const { isFetching, data } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const pathname = usePathname();

  if (isFetching) {
    return <></>;
  }

  const handleLogout = async () => {
    const supabase = createClient();
    queryClient.clear();
    await supabase.auth.signOut();
    router.refresh();

    if (protectedRoutes.includes(pathname)) {
      router.replace("/auth?next=" + pathname);
    }
  };

  return (
    <div>
      {!data.id ? (
        <Link href="/auth">
          <Button className="cursor-pointer" variant="outline">
            Sign In
          </Button>
        </Link>
      ) : (
        <Avatar className="w-12 h-12 cursor-pointer" onClick={handleLogout}>
          <AvatarImage src={data.image_url} className="w-12 h-12" />
          <AvatarFallback className="text-xl">
            {data.email[0].toUpperCase() + data.email[1].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
export default Profile;
