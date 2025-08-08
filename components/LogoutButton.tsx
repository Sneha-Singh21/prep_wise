"use client";

import { signOut } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";


export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <button
      onClick={handleLogout}
      className="btn-disconnect cursor-pointer"
    >
      Logout
    </button>
  );
}
