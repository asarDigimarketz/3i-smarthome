"use client";
import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useSession } from "next-auth/react";
import Link from "next/link.js";
import { ProjectStatusDropdown } from "./ProjectStatusDropdown.jsx";
import ProposalFilters from "../Proposal/ProposalFilters.jsx";
import { ProjectCards } from "./ProjectCards.jsx";
import { Plus, Search } from "lucide-react";
import { DateRangePicker } from "@heroui/date-picker";

export function ProjectsPage() {
  const { data: session } = useSession();

  // Permission checks based on user's actual permissions
  const [userPermissions, setUserPermissions] = useState({
    hasAddPermission: false,
    hasEditPermission: false,
    hasDeletePermission: false,
    hasViewPermission: false,
  });

  const [dateRange, setDateRange] = useState(null);

  // Check user permissions on component mount
  useEffect(() => {
    const checkUserPermissions = () => {
      if (!session?.user) return;

      // Hotel admin has all permissions
      if (!session.user.isEmployee) {
        setUserPermissions({
          hasAddPermission: true,
          hasEditPermission: true,
          hasDeletePermission: true,
          hasViewPermission: true,
        });
        return;
      }

      // Check employee permissions for projects module
      const permissions = session.user.permissions || [];
      const projectPermission = permissions.find(
        (p) => p.page?.toLowerCase() === "projects"
      );

      if (projectPermission && projectPermission.actions) {
        setUserPermissions({
          hasViewPermission: projectPermission.actions.view || false,
          hasAddPermission: projectPermission.actions.add || false,
          hasEditPermission: projectPermission.actions.edit || false,
          hasDeletePermission: projectPermission.actions.delete || false,
        });
      }
    };

    checkUserPermissions();
  }, [session]);

  const handleAddProject = () => {
    if (!userPermissions.hasAddPermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to add projects",
        color: "danger",
      });
      return;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600">Projects</h1>
        <p className="text-gray-500 mt-1">Manage all your projects.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search customers/Proposal ID ..."
            startContent={<Search className="text-gray-400" />}
            radius="sm"
            variant="bordered"
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <DateRangePicker
            label="Filter by Date"
            value={dateRange}
            onChange={setDateRange}
            radius="sm"
            variant="bordered"
            className="w-60"
            classNames={{
              label: "text-sm font-medium",
              input: "text-sm",
            }}
          />
          <ProjectStatusDropdown />

          {userPermissions.hasAddPermission ? (
            <Link href="/dashboard/projects/add-project">
              <Button color="primary" radius="sm" startContent={<Plus />}>
                Add New
              </Button>
            </Link>
          ) : (
            <Button
              color="primary"
              radius="sm"
              startContent={<Plus />}
              onPress={handleAddProject}
            >
              Add New
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-6 bg-white rounded-xl shadow-lg p-6">
        <div className="bg-brand-light-red rounded-lg mb-6 p-4">
          <ProposalFilters />
        </div>

        <ProjectCards userPermissions={userPermissions} />
      </div>
    </div>
  );
}
