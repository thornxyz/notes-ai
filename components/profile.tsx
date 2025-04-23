"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import useUser from "@/app/hook/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { protectedRoutes } from "@/lib/constant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-12 h-12 cursor-pointer outline-none ring-0 focus:outline-none focus:ring-0">
              <AvatarImage src={data.image_url} className="w-12 h-12" />
              <AvatarFallback className="text-xl">
                {data.email[0].toUpperCase() + data.email[1].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleProfileClick}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDashboardClick}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
export default Profile;
