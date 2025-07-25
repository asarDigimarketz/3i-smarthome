import Dashboard from "../../Components/Dashboard/Dashboard";
import PermissionGuard from "../../Components/auth/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard requiredPermission="dashboard" requiredAction="view">
      <Dashboard />
    </PermissionGuard>
  );
}
