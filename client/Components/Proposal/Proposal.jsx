"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link.js";
import ProposalFilters from "./ProposalFilters.jsx";
import ProposalTable from "./ProposalTable.jsx";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { addToast } from "@heroui/toast";
import { StatusDropdown } from "./status-dropdown";
import { Plus, Search, X } from "lucide-react";
import { DateRangePicker } from "@heroui/date-picker";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { usePermissions } from "../../lib/utils";

function App() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { canCreate, canEdit, canDelete, canView, getUserPermissions } =
    usePermissions();

  // Get permissions using the hook
  const userPermissions = getUserPermissions("proposal");

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [dateRange, setDateRange] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(
    new Set(["Hot", "Cold", "Warm"])
  ); // Default: only specific statuses

  // Debounce search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Update URL when pagination or filters change
  const updateURL = useCallback(
    (page, pushState = false) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      const newURL = params.toString() ? `?${params.toString()}` : "";
      const fullURL = `/dashboard/proposal${newURL}`;

      if (pushState) {
        router.push(fullURL, { scroll: false });
      } else {
        router.replace(fullURL, { scroll: false });
      }
    },
    [router]
  );

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const page = parseInt(urlParams.get("page")) || 1;
      setCurrentPage(page);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Initial fetch when component mounts - use URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(urlParams.get("page")) || 1;
    if (initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Remove auto-reset on page refresh; user can clear date range with button

  // Handle status filter change
  const handleStatusChange = (statuses) => {
    if (statuses === "all") {
      // When "All Status" is selected, show ALL statuses including "Confirmed"
      setStatusFilter("all");
      setSelectedStatuses(
        new Set(["All Status", "Hot", "Cold", "Warm", "Scrap", "Confirmed"])
      );
    } else if (Array.isArray(statuses)) {
      // Multiple statuses selected
      if (statuses.length === 0) {
        // No statuses selected, show default statuses
        setStatusFilter("Hot,Cold,Warm");
        setSelectedStatuses(new Set(["Hot", "Cold", "Warm"]));
      } else if (statuses.length === 1 && statuses[0] === "Confirmed") {
        // Only "Confirmed" selected
        setStatusFilter("Confirmed");
        setSelectedStatuses(new Set(["Confirmed"]));
      } else {
        // Multiple specific statuses selected
        setStatusFilter(statuses.join(",")); // Join multiple statuses
        setSelectedStatuses(new Set(statuses));
      }
    } else {
      // Single status (legacy support)
      if (statuses === "Confirmed") {
        setStatusFilter("Confirmed");
        setSelectedStatuses(new Set(["Confirmed"]));
      } else {
        setStatusFilter(statuses);
        setSelectedStatuses(new Set([statuses]));
      }
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(page, true);
  };

  // Handle service filter change (from ProposalFilters)
  const handleServiceChange = (service) => {
    setServiceFilter(service === "All" ? "" : service);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-x-auto">
      <div className="flex-1 min-w-0">
        <div className="space-y-6">
          {/* Page Header */}
          <DashboardHeader
            title="Proposal"
            description="Manage all your proposal"
          />

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search by name, email, phone, address..."
                startContent={<Search className="text-gray-400" />}
                radius="sm"
                variant="bordered"
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                radius="sm"
                showMonthAndYearPickers
                size="md"
                variant="bordered"
                className="w-50"
                aria-label="Proposal date range"
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
                        setDateRange(null);
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
              <StatusDropdown
                onStatusChange={handleStatusChange}
                selectedStatuses={selectedStatuses}
              />

              <Link href="/dashboard/proposal/add-proposal">
                <Button
                  color="primary"
                  radius="sm"
                  startContent={<Plus />}
                  size="md"
                  disabled={!canCreate("proposal")}
                >
                  Add New
                </Button>
              </Link>
            </div>
          </div>

          {/* Components with box shadow */}
          <div className="space-y-6 bg-white rounded-xl shadow-lg p-6 md:min-h-[600px]">
            <div className="">
              <ProposalFilters onServiceChange={handleServiceChange} />
            </div>
            <div className="p-6 overflow-x-auto">
              <ProposalTable
                searchQuery={debouncedSearchQuery}
                statusFilter={statusFilter}
                dateRange={dateRange}
                serviceFilter={serviceFilter}
                userPermissions={userPermissions}
                page={currentPage}
                setTotalPages={setTotalPages}
              />
            </div>
            <div className="flex justify-end mt-6" data-no-navigate>
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                page={currentPage}
                onChange={handlePageChange}
                showControls
                color="primary"
                variant="flat"
                className="pagination"
                data-no-navigate
                key={`pagination-${currentPage}-${totalPages}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
