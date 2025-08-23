"use client";
import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import Link from "next/link";
import { ProjectStatusDropdown } from "./ProjectStatusDropdown.jsx";
import ProposalFilters from "../Proposal/ProposalFilters.jsx";
import { ProjectCards } from "./ProjectCards.jsx";
import { Plus, Search, X } from "lucide-react";
import { DateRangePicker } from "@heroui/date-picker";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { Pagination } from "@heroui/pagination";
import { usePermissions } from "../../lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { canCreate, getUserPermissions } = usePermissions();

  // Get permissions using the hook
  const userPermissions = getUserPermissions("projects");

  // Initialize states from URL parameters
  const [dateRange, setDateRange] = useState(null);
  const [serviceFilter, setServiceFilter] = useState(
    searchParams.get("service") || "All"
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "new,in-progress,done"
  );
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const [selectedStatuses, setSelectedStatuses] = useState(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "all") {
      return new Set([
        "All Status",
        "new",
        "in-progress",
        "done",
        "completed",
        "cancelled",
      ]);
    } else if (statusParam) {
      return new Set(statusParam.split(","));
    }
    return new Set(["new", "in-progress", "done"]);
  });

  // Pagination states
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // Show 6 projects per page

  // Function to update URL with current state
  const updateURL = useCallback(
    (newParams) => {
      const params = new URLSearchParams(searchParams);

      // Update or remove parameters
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "" && value !== "All" && value !== "all") {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      // Always ensure page is set if > 1
      if (newParams.page && newParams.page > 1) {
        params.set("page", newParams.page.toString());
      } else if (newParams.page === 1) {
        params.delete("page");
      }

      const newURL = params.toString() ? `?${params.toString()}` : "";
      router.replace(`/dashboard/projects${newURL}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handlers for filters with URL updates
  const handleServiceChange = (service) => {
    setServiceFilter(service);
    updateURL({ service, page: 1 });
  };

  const handleStatusChange = (statuses) => {
    let newStatusFilter;
    let newSelectedStatuses;

    if (statuses === "all") {
      newStatusFilter = "all";
      newSelectedStatuses = new Set([
        "All Status",
        "new",
        "in-progress",
        "done",
        "completed",
        "cancelled",
      ]);
    } else if (Array.isArray(statuses)) {
      if (statuses.length === 0) {
        newStatusFilter = "new,in-progress,done";
        newSelectedStatuses = new Set(["new", "in-progress", "done"]);
      } else {
        newStatusFilter = statuses.join(",");
        newSelectedStatuses = new Set(statuses);
      }
    } else {
      newStatusFilter = statuses;
      newSelectedStatuses = new Set([statuses]);
    }

    setStatusFilter(newStatusFilter);
    setSelectedStatuses(newSelectedStatuses);
    setPage(1);
    updateURL({ status: newStatusFilter, page: 1 });
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Note: Date range is complex to serialize to URL, keeping it in state only
    setPage(1);
    updateURL({ page: 1 });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setPage(1);
    updateURL({ search: value, page: 1 });
  };

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
    updateURL({ page: newPage });
  };

  // Handle returning from task page - restore state if needed
  useEffect(() => {
    // Check if we're returning from task page and have stored state
    const storedReturnTo = sessionStorage.getItem("projectsReturnTo");
    if (storedReturnTo && storedReturnTo.includes("/dashboard/projects")) {
      // Clean up the stored state
      sessionStorage.removeItem("projectsReturnTo");

      // If current URL doesn't have parameters but stored state does, restore it
      const currentParams = new URLSearchParams(window.location.search);
      const storedParams = new URLSearchParams(
        storedReturnTo.split("?")[1] || ""
      );

      if (!currentParams.toString() && storedParams.toString()) {
        // Restore the state from stored URL
        router.replace(storedReturnTo, { scroll: false });
      }
    }
  }, [router]);

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
            placeholder="Search by name, email, phone, address..."
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
            endContent={
              dateRange ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateRangeChange(null);
                  }}
                  className="flex items-center justify-center p-1 cursor-pointer focus:outline-none"
                  tabIndex={-1}
                  role="button"
                  aria-label="Clear date range"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </span>
              ) : null
            }
          />
          <ProjectStatusDropdown
            onStatusChange={handleStatusChange}
            selectedStatuses={selectedStatuses}
          />

          <Link href="/dashboard/projects/add-project">
            <Button
              color="primary"
              radius="sm"
              startContent={<Plus />}
              disabled={!canCreate("projects")}
            >
              Add New
            </Button>
          </Link>
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

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination
              total={totalPages}
              initialPage={1}
              page={page}
              onChange={handlePageChange}
              showControls
              siblings={0}
              boundaries={1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
