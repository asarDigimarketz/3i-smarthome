"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Alert } from "../ui/Alert";
import { ShieldX } from "lucide-react";

interface DatabasePermission {
  page: string;
  actions: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  url?: string;
}

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string; // e.g., "proposals", "employees", etc.
  requiredAction?: "view" | "create" | "update" | "delete";
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ 
  children, 
  requiredPermission = "dashboard",
  requiredAction = "view",
  fallback 
}: PermissionGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (status === "loading") {
        return; // Still loading, don't do anything yet
      }

      if (status === "unauthenticated") {
        // No session found, redirect to login
        router.replace("/login");
        return;
      }

      if (status === "authenticated" && session?.user) {
        // Hotel admin has all permissions
        if (!session.user.isEmployee) {
          setHasPermission(true);
          setIsChecking(false);
          return;
        }

        // Check employee permissions
        const permissions = (session.user.permissions || []) as unknown as DatabasePermission[];
        const permission = permissions.find(
          (p: DatabasePermission) => p.page?.toLowerCase() === requiredPermission.toLowerCase()
        );

        // Map action names to match the database structure
        let hasRequiredPermission = false;
        if (permission && permission.actions) {
          switch (requiredAction) {
            case 'view':
              hasRequiredPermission = permission.actions.view;
              break;
            case 'create':
              hasRequiredPermission = permission.actions.add;
              break;
            case 'update':
              hasRequiredPermission = permission.actions.edit;
              break;
            case 'delete':
              hasRequiredPermission = permission.actions.delete;
              break;
            default:
              hasRequiredPermission = false;
          }
        }

        setHasPermission(hasRequiredPermission);
        
        setIsChecking(false);
        return;
      }

      // If we get here, something went wrong
      setIsChecking(false);
    };

    checkPermissions();
  }, [session, status, router, requiredPermission, requiredAction]);

  // Show loading spinner while checking authentication
  if (status === "loading" || isChecking) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      )
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  // If no permission, show access denied
  if (!hasPermission) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <Alert color="danger" icon={<ShieldX className="h-5 w-5" />}>
            <div>
              <div className="font-medium">Access Denied</div>
              <div className="text-sm mt-1">
                You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
              </div>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // If authenticated and has permission, render children
  return <>{children}</>;
} 