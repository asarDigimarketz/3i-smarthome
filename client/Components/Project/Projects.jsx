"use client";
import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import Link from "next/link";
import { ProjectStatusDropdown } from "./ProjectStatusDropdown.jsx";
import ProposalFilters from "../Proposal/ProposalFilters.jsx";
import { ProjectCards } from "./ProjectCards.jsx";
import { Plus, Search, X } from "lucide-react";
import { DateRangePicker } from "@heroui/date-picker";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { Pagination } from "@heroui/pagination";
import { usePermissions } from "../../lib/utils";

export function ProjectsPage() {
  const { 
    canCreate, 
    canEdit, 
    
   
    getUserPermissions 
  } = usePermissions();

  // Get permissions using the hook
  const userPermissions = getUserPermissions("projects");

  // Filter states
  const [dateRange, setDateRange] = useState(null);
  const [serviceFilter, setServiceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("new,in-progress,done");
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(["new", "in-progress", "done"])); // Default: all except "Completed" and "Dropped/Cancelled"

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // Show 6 projects per page

   

  // Handlers for filters
  const handleServiceChange = (service) => setServiceFilter(service);
  const handleStatusChange = (statuses) => {
    if (statuses === "all") {
      // When "All Status" is selected, show ALL statuses including "Completed" and "Dropped/Cancelled"
      setStatusFilter("all");
      setSelectedStatuses(new Set(["All Status", "new", "in-progress", "done", "completed", "cancelled"]));
    } else if (Array.isArray(statuses)) {
      // Multiple statuses selected
      if (statuses.length === 0) {
        // No statuses selected, show default statuses
        setStatusFilter("new,in-progress,done");
        setSelectedStatuses(new Set(["new", "in-progress", "done"]));
      } else {
        // Multiple specific statuses selected
        setStatusFilter(statuses.join(",")); // Join multiple statuses
        setSelectedStatuses(new Set(statuses));
      }
    } else {
      // Single status (legacy support)
      setStatusFilter(statuses);
      setSelectedStatuses(new Set([statuses]));
    }
    setPage(1); // Reset to first page when filter changes
  };
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
            placeholder="Search by customer, email, phone, address..."
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
              <Button color="primary" radius="sm" startContent={<Plus />} disabled={!canCreate("projects")}>
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
        <div className="flex justify-center mt-6">
          {console.log('📄 Web Projects component - totalPages:', totalPages, 'page:', page, 'serviceFilter:', serviceFilter)}
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
