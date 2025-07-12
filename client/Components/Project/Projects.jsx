"use client";
import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ProjectStatusDropdown } from "./ProjectStatusDropdown.jsx";
import ProposalFilters from "../Proposal/ProposalFilters.jsx";
import { ProjectCards } from "./ProjectCards.jsx";
import { Plus, Search } from "lucide-react";
import { DateRangePicker } from "@heroui/date-picker";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { Pagination } from "@heroui/pagination";

export function ProjectsPage() {
  const { data: session } = useSession();

  // Permission checks based on user's actual permissions
  const [userPermissions, setUserPermissions] = useState({
    hasAddPermission: false,
    hasEditPermission: false,
    hasDeletePermission: false,
    hasViewPermission: false,
  });

  // Filter states
  const [dateRange, setDateRange] = useState(null);
  const [serviceFilter, setServiceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // Show 6 projects per page

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

  // Handlers for filters
  const handleServiceChange = (service) => setServiceFilter(service);
  const handleStatusChange = (status) => setStatusFilter(status);
  const handleDateRangeChange = (range) => setDateRange(range);
  const handleSearchChange = (e) => setSearchValue(e.target.value);

  // Reset page to 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [serviceFilter, dateRange, statusFilter, searchValue]);

  return (
    <div>
      <div className="mb-6">
        <DashboardHeader
          title="Projects"
          description="Manage all your projects"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search customers/Proposal ID ..."
            startContent={<Search className="text-gray-400" />}
            radius="sm"
            variant="bordered"
            className="w-full"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            radius="sm"
            showMonthAndYearPickers
            size="md"
            variant="bordered"
            className="w-50"
            aria-label="Project date range"
            classNames={{
              base: "bg-white",
              inputWrapper: "border-gray-300 hover:border-gray-400",
              input: "text-gray-700",
              label: "text-gray-600",
            }}
          />
          <ProjectStatusDropdown
            value={statusFilter}
            onChange={handleStatusChange}
          />

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
      <div className="space-y-6 bg-white rounded-xl shadow-lg p-6 md:min-h-[600px]">
        <div className="bg-brand-light-red rounded-lg mb-6 p-4">
          <ProposalFilters onServiceChange={handleServiceChange} />
        </div>
        <ProjectCards
          userPermissions={userPermissions}
          serviceFilter={serviceFilter}
          dateRange={dateRange}
          statusFilter={statusFilter}
          searchValue={searchValue}
          page={page}
          pageSize={pageSize}
          setTotalPages={setTotalPages}
        />
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            showControls
            radius="sm"
          />
        </div>
      </div>
    </div>
  );
}
