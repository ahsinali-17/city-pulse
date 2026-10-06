"use client";

import { signOut } from "next-auth/react";
import {useSession} from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const {data: session} = useSession();

  const handleLogout = async () => {
    // Sign out via NextAuth and then send the user back to the home page
    await signOut({ redirect: false });
    router.replace("/"); // or any public page you prefer
  };

  return (
    session?.user && <button
      onClick={handleLogout}
      className="
        w-[90%] flex justify-center items-center gap-2 rounded-md bg-red-600 py-2
        text-sm font-medium text-white hover:bg-red-700
        transition-colors duration-200 absolute bottom-2 left-1/2 transform -translate-x-1/2 cursor-pointer
      "
    >
      Log out
    </button>
  );
}
