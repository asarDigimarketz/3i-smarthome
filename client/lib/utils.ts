import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Database permission interface to match the actual database structure
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

// Custom hook for checking user permissions
export function usePermissions() {
  const { data: session } = useSession();

  const checkPermission = (
    module: string,
    action: "view" | "create" | "update" | "delete" = "view"
  ) => {
    if (!session?.user) return false;

    // Hotel admin has all permissions
    if (!session.user.isEmployee) return true;

    // Check employee permissions with proper casting
    const permissions = (session.user.permissions || []) as unknown as DatabasePermission[];
    const permission = permissions.find(
      (p: DatabasePermission) => p.page?.toLowerCase() === module.toLowerCase()
    );

    // Map action names to match the database structure (based on PermissionGuard)
    if (permission?.actions) {
      switch (action) {
        case 'view':
          return permission.actions.view || false;
        case 'create':
          return permission.actions.add || false;
        case 'update':
          return permission.actions.edit || false;
        case 'delete':
          return permission.actions.delete || false;
        default:
          return false;
      }
    }

    return false;
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

    // Check employee permissions with proper casting
    const permissions = (session.user.permissions || []) as unknown as DatabasePermission[];
    const permission = permissions.find(
      (p: DatabasePermission) => p.page?.toLowerCase() === module.toLowerCase()
    );

    return {
      hasViewPermission: permission?.actions?.view || false,
      hasAddPermission: permission?.actions?.add || false,
      hasEditPermission: permission?.actions?.edit || false,
      hasDeletePermission: permission?.actions?.delete || false,
    };
  };

  // Check if user can access any of the specified modules
  const hasAnyPermission = (modules: string[], action: "view" | "create" | "update" | "delete" = "view") => {
    return modules.some(module => checkPermission(module, action));
  };

  // Check if user can access all of the specified modules
  const hasAllPermissions = (modules: string[], action: "view" | "create" | "update" | "delete" = "view") => {
    return modules.every(module => checkPermission(module, action));
  };

  // Get accessible modules for navigation
  const getAccessibleModules = (modules: string[], action: "view" | "create" | "update" | "delete" = "view") => {
    return modules.filter(module => checkPermission(module, action));
  };

  // Check if user has any permission for a module (any action)
  const hasAnyActionPermission = (module: string) => {
    return checkPermission(module, "view") || 
           checkPermission(module, "create") || 
           checkPermission(module, "update") || 
           checkPermission(module, "delete");
  };

  // Get all permissions for the current user
  const getAllUserPermissions = () => {
    if (!session?.user) return [];
    
    // Hotel admin has all permissions
    if (!session.user.isEmployee) {
      return [
        "dashboard", "employees", "customers", "projects", 
        "proposals", "tasks", "settings", "notifications"
      ];
    }

    // Return employee permissions
    const permissions = (session.user.permissions || []) as unknown as DatabasePermission[];
    return permissions.map((p: DatabasePermission) => p.page?.toLowerCase()).filter(Boolean);
  };

  // Check if user can create new records
  const canCreate = (module: string) => checkPermission(module, "create");

  // Check if user can edit records
  const canEdit = (module: string) => checkPermission(module, "update");

  // Check if user can delete records
  const canDelete = (module: string) => checkPermission(module, "delete");

  // Check if user can view records
  const canView = (module: string) => checkPermission(module, "view");

  // Check if user is admin
  const isAdmin = !session?.user?.isEmployee;

  // Check if user is employee
  const isEmployee = session?.user?.isEmployee || false;

  // Check if user has any permissions at all
  const hasAnyPermissions = () => {
    if (!session?.user) return false;
    if (!session.user.isEmployee) return true; // Admin has all permissions
    const permissions = session.user.permissions || [];
    return permissions.length > 0;
  };

  // Get user role
  const getUserRole = () => {
    if (!session?.user) return null;
    return session.user.role || null;
  };

  // Check if user has specific role
  const hasRole = (role: string) => {
    return getUserRole() === role;
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!session?.user) return "User";
    if (session.user.name) return session.user.name;
    return session.user.email?.split("@")[0] || "User";
  };

  return {
    checkPermission,
    getUserPermissions,
    hasAnyPermission,
    hasAllPermissions,
    getAccessibleModules,
    hasAnyActionPermission,
    getAllUserPermissions,
    canCreate,
    canEdit,
    canDelete,
    canView,
    isAdmin,
    isEmployee,
    hasAnyPermissions,
    getUserRole,
    hasRole,
    getUserDisplayName,
    user: session?.user,
  };
}
