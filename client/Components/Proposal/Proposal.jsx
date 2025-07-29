"use client";
import { useState, useEffect } from "react";
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
  const { 
    canCreate, 
    canEdit, 
    canDelete, 
    canView,
    getUserPermissions 
  } = usePermissions();

  // Get permissions using the hook
  const userPermissions = getUserPermissions("proposals");

  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Remove auto-reset on page refresh; user can clear date range with button

  // Handle status filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
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
                placeholder="Search by customer, email, phone, address..."
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
              <StatusDropdown onStatusChange={handleStatusChange} />
              
                <Link href="/dashboard/proposal/add-proposal">
                  <Button
                    color="primary"
                    radius="sm"
                    startContent={<Plus />}
                    size="md"
                    disabled={!canCreate("proposals")}
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
            <div className="flex justify-end mt-6">
              <Pagination
                total={totalPages}
                initialPage={1}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
