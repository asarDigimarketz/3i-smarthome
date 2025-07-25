import { ProjectsPage } from "../../../Components/Project/Projects";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

const page = () => {
  return (
    <PermissionGuard requiredPermission="projects" requiredAction="view">
      <ProjectsPage />
    </PermissionGuard>
  );
};

export default page;
