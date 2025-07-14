"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

export function useAuth(protectedRoute = false) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      const isAuthPage = pathname === "/login" || pathname === "/register";

      if (currentUser && isAuthPage) {
        router.replace("/");
      } else if (!currentUser && protectedRoute && !isAuthPage) {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [pathname, router, protectedRoute]);

  return { user, loading: user === undefined };
}
