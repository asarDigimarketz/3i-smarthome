import { AddProjectPage } from "../../../../Components/Project/AddProject";
import PermissionGuard from "../../../../Components/auth/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard requiredPermission="projects" requiredAction="create">
      <AddProjectPage />
    </PermissionGuard>
  );
}
