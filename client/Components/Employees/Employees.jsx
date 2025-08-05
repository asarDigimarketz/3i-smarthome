"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import { Skeleton } from "@heroui/skeleton";
import { addToast } from "@heroui/toast";
import EmployeeCard from "./EmployeeCard.jsx";
import { ChevronDown, Plus, Search } from "lucide-react";
import { EmployeeModal } from "./EmployeeModal";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { Card } from "@heroui/card";
import { usePermissions } from "../../lib/utils";
import apiClient from "../../lib/axios";

const Employees = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    canCreate,
    canEdit,
    canDelete,
    canView,
    getUserPermissions
  } = usePermissions();

  // Get permissions using the hook - memoize to prevent re-renders
  const userPermissions = getUserPermissions("employees");

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    totalPages: 1,
    totalEmployees: 0,
    limit: 6,
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch employees from API with search and pagination
  const fetchEmployees = useCallback(async (page = 1, search = searchQuery, status = statusFilter) => {
    if (!canView("employees")) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "6");

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status !== "all") {
        params.append("status", status);
      }

      const response = await apiClient.get(`/api/employeeManagement?${params.toString()}`);

      if (response.data.success) {
        const data = response.data;
        // Transform backend data to match frontend format
        const transformedEmployees = data.employees.map((emp) => ({
          id: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role?.role || "N/A",
          department:
            typeof emp.department === "object" && emp.department !== null
              ? emp.department.name
              : emp.department || "N/A",
          status: emp.status === "active" ? "Active" : "Inactive",
          email: emp.email,
          phone: emp.mobileNo,
          avatar:
            emp.avatar ||
            ``,
          _id: emp._id,
          originalData: emp,
        }));
        setEmployees(transformedEmployees);

        // Update pagination info
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error(data.message || "Failed to fetch employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      addToast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, []); // Remove all dependencies to prevent re-creation

  // Update URL when pagination or filters change
  const updateURL = useCallback((page, search, status, pushState = false) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);

    const newURL = params.toString() ? `?${params.toString()}` : '';
    const fullURL = `/dashboard/employees${newURL}`;

    if (pushState) {
      router.push(fullURL, { scroll: false });
    } else {
      router.replace(fullURL, { scroll: false });
    }
  }, [router]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const page = parseInt(urlParams.get('page')) || 1;
      const search = urlParams.get('search') || '';
      const status = urlParams.get('status') || 'all';


      // Update state immediately
      setSearchQuery(search);
      setStatusFilter(status);
      setPagination(prev => ({ ...prev, currentPage: page }));

      // Fetch data with the URL parameters
      fetchEmployees(page, search, status);
    };

    // Add the event listener
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // Only run once on mount

  // Initial fetch when component mounts - use URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(urlParams.get('page')) || 1;
    const initialSearch = urlParams.get('search') || '';
    const initialStatus = urlParams.get('status') || 'all';


    // Set initial state from URL
    if (initialSearch !== searchQuery) setSearchQuery(initialSearch);
    if (initialStatus !== statusFilter) setStatusFilter(initialStatus);
    if (initialPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: initialPage }));
    }

    if (userPermissions.hasViewPermission) {
      fetchEmployees(initialPage, initialSearch, initialStatus);
    }

    // Mark initial load as complete after a brief delay
    setTimeout(() => setIsInitialLoad(false), 100);
  }, [userPermissions.hasViewPermission]); // Only run on mount and when permissions change

  // Handle filter changes (but not during initial load)
  useEffect(() => {
    if (isInitialLoad) {
      return; // Skip filter effects during initial load
    }

    const timeoutId = setTimeout(() => {
      // Reset to page 1 and fetch with new filters
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      updateURL(1, searchQuery, statusFilter);
      fetchEmployees(1, searchQuery, statusFilter);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter]);

  // Handle pagination changes
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    updateURL(page, searchQuery, statusFilter, true);
    fetchEmployees(page, searchQuery, statusFilter);
  };

  const handleModalClose = (shouldRefresh = false) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchEmployees(pagination.currentPage, searchQuery, statusFilter);
    }
  };

  const handleAddEmployee = () => {
    if (!userPermissions.hasAddPermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to add employees",
        color: "danger",
      });
      return;
    }
    setIsModalOpen(true);
  };

  // Loading skeleton component
  const EmployeeSkeleton = () => (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="flex rounded-full w-12 h-12" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-2/3 rounded-lg" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Employee Management"
        description="Manage employees List"
      />

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name, email, phone, address..."
          startContent={<Search className="text-default-400" />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="w-full sm:max-w-sm"
        />

        <div className="flex gap-2 ml-auto">
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                radius="sm"
                className="w-full justify-between bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                size="lg"
                endContent={<ChevronDown width={16} />}
              >
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Status filter"
              selectedKeys={new Set([statusFilter])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected) setStatusFilter(selected);
              }}
              selectionMode="single"
            >
              <DropdownItem key="all">All</DropdownItem>
              <DropdownItem key="active">Active</DropdownItem>
              <DropdownItem key="inactive">Inactive</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <Button
          color="primary"
          radius="sm"
          className="w-full sm:w-auto"
          size="lg"
          startContent={<Plus />}
          onPress={handleAddEmployee}
          disabled={!canCreate("employees")}
        >
          Add Employee
        </Button>
      </div>

      {/* Employee Cards */}
      <Card className="bg-white rounded-xl shadow-lg p-6 md:min-h-[600px] flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 ">
          {loading ? (
            // Show loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <EmployeeSkeleton key={index} />
            ))
          ) : employees.length > 0 ? (
            employees.map((employee) => (
              <EmployeeCard
                key={`${employee.id}-${employee.name}`}
                id={employee.id}
                name={employee.name}
                role={employee.role}
                department={employee.department}
                status={employee.status}
                email={employee.email}
                phone={employee.phone}
                avatar={employee.avatar}
                userPermissions={userPermissions}
                onEmployeeUpdate={() => fetchEmployees(pagination.currentPage, searchQuery, statusFilter)}
                returnUrl={`/dashboard/employees${window.location.search}`}
              />
            ))
          ) : (
            // Empty state
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No employees found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "No employees match your current filters."
                    : "Get started by adding your first employee."}
                </p>
                {!searchQuery &&
                  statusFilter === "all" &&
                  userPermissions.hasAddPermission && (
                    <Button
                      color="primary"
                      startContent={<Plus />}
                      onPress={handleAddEmployee}
                    >
                      Add First Employee
                    </Button>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination - Fixed at bottom of card */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-4 mt-auto" data-no-navigate>
            <Pagination
              total={pagination.totalPages}
              initialPage={1}
              page={pagination.currentPage}
              onChange={handlePageChange}
              showControls
              siblings={0}
              boundaries={1}
              dotsJump={3}
              className="pagination"
              data-no-navigate
            />
          </div>
        )}
      </Card>

      {userPermissions.hasAddPermission && (
        <EmployeeModal
          isOpen={isModalOpen}
          onOpenChange={handleModalClose}
          onSuccess={() => handleModalClose(true)}
        />
      )}
    </div>
  );
};

export default Employees;