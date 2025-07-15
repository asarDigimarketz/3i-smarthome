import Settings from "../../../Components/Settings/Settings.jsx";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard requiredPermission="settings" requiredAction="view">
      <Settings />
    </PermissionGuard>
  );
}
