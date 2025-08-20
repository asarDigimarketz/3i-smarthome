"use client";
import { AddProjectPage } from "../../../../Components/Project/AddProject";
import PermissionGuard from "../../../../Components/auth/PermissionGuard";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const requiredAction = projectId ? "update" : "create";

  return (
    <PermissionGuard
      requiredPermission="projects"
      requiredAction={requiredAction}
    >
      <AddProjectPage />
    </PermissionGuard>
  );
}
