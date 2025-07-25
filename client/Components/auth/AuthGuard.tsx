"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (status === "loading") {
        return; // Still loading, don't do anything yet
      }

      if (status === "unauthenticated") {
        // No session found, redirect to login
        router.replace("/login");
        return;
      }

      if (status === "authenticated" && session?.user) {
        // Session found, stop checking
        setIsChecking(false);
        return;
      }

      // If we get here, something went wrong
      setIsChecking(false);
    };

    checkAuth();
  }, [session, status, router]);

  // Show loading spinner while checking authentication
  if (status === "loading" || isChecking) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      )
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
} 