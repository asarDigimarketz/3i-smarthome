import Task from "../../../Components/Task/Task";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard requiredPermission="task" requiredAction="view">
      <Task />
    </PermissionGuard>
  );
}
