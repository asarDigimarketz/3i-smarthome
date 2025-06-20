import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom hook for checking user permissions
export function usePermissions() {
  const { data: session } = useSession();

  const checkPermission = (
    module: string,
    action: "view" | "add" | "edit" | "delete" = "view"
  ) => {
    if (!session?.user) return false;

    // Hotel admin has all permissions
    if (!session.user.isEmployee) return true;

    // Check employee permissions
    const permissions = session.user.permissions || [];
    const permission = permissions.find(
      (p: any) => p.page?.toLowerCase() === module.toLowerCase()
    );

    return permission?.actions?.[action] || false;
  };

  const getUserPermissions = (module: string) => {
    if (!session?.user) {
      return {
        hasViewPermission: false,
        hasAddPermission: false,
        hasEditPermission: false,
        hasDeletePermission: false,
      };
    }

    // Hotel admin has all permissions
    if (!session.user.isEmployee) {
      return {
        hasViewPermission: true,
        hasAddPermission: true,
        hasEditPermission: true,
        hasDeletePermission: true,
      };
    }

    // Check employee permissions
    const permissions = session.user.permissions || [];
    const permission = permissions.find(
      (p: any) => p.page?.toLowerCase() === module.toLowerCase()
    );

    return {
      hasViewPermission: permission?.actions?.view || false,
      hasAddPermission: permission?.actions?.add || false,
      hasEditPermission: permission?.actions?.edit || false,
      hasDeletePermission: permission?.actions?.delete || false,
    };
  };

  return {
    checkPermission,
    getUserPermissions,
    isAdmin: !session?.user?.isEmployee,
    user: session?.user,
  };
}
