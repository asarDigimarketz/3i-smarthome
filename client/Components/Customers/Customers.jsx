"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { DateRangePicker } from "@heroui/date-picker";
import { Pagination } from "@heroui/pagination";
import { addToast } from "@heroui/toast";
import apiClient from "../../lib/axios";

import Link from "next/link";
import {
  ChevronDown,
  Plus,
  Search,
  Cctv,
  Speaker,
  Tv2,
  HouseWifi,
  X,
} from "lucide-react";
import DashboardHeader from "../header/DashboardHeader";
import { usePermissions } from "../../lib/utils";

const Customers = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { canCreate, canView, getUserPermissions } = usePermissions();

  // State for customers data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get("page")) || 1,
    totalPages: 1,
    totalCustomers: 0,
    limit: 10,
  });

  // Get permissions using the hook - memoize to prevent re-renders
  const userPermissions = getUserPermissions("customers");

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [serviceFilter, setServiceFilter] = useState(
    searchParams.get("service") || "all"
  );
  const [dateRange, setDateRange] = useState(null);

  // Fetch customers function - Remove dependencies that cause re-renders
  const fetchCustomers = useCallback(
    async (
      page = 1,
      search = searchQuery,
      service = serviceFilter,
      dateRangeParam = dateRange
    ) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          search: search,
          service: service,
        });

        // Add date range parameters if date range is selected
        if (dateRangeParam && dateRangeParam.start && dateRangeParam.end) {
          try {
            const startDate = new Date(
              dateRangeParam.start.year,
              dateRangeParam.start.month - 1,
              dateRangeParam.start.day
            );

            const endDate = new Date(
              dateRangeParam.end.year,
              dateRangeParam.end.month - 1,
              dateRangeParam.end.day
            );

            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            params.append("startDate", startDate.toISOString());
            params.append("endDate", endDate.toISOString());
          } catch (dateError) {
            console.error("Error converting date range:", dateError);
          }
        }

        const response = await apiClient.get(`/api/customers?${params}`);

        if (response.data.success) {
          const customersData = Array.isArray(response.data.data.customers)
            ? response.data.data.customers
            : [];

          setCustomers(customersData);
          setPagination(
            response.data.data.pagination || {
              currentPage: page,
              totalPages: 1,
              totalCustomers: 0,
              limit: 10,
            }
          );
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
        addToast({
          title: "Error",
          description: "Failed to fetch customers",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    },
    []
  ); // Remove all dependencies to prevent re-creation

  // Update URL when pagination or filters change
  const updateURL = useCallback(
    (page, search, service, pushState = false) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      if (search) params.set("search", search);
      if (service && service !== "all") params.set("service", service);

      const newURL = params.toString() ? `?${params.toString()}` : "";
      const fullURL = `/dashboard/customers${newURL}`;

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
      const search = urlParams.get("search") || "";
      const service = urlParams.get("service") || "all";

      // Update state immediately
      setSearchQuery(search);
      setServiceFilter(service);
      setPagination((prev) => ({ ...prev, currentPage: page }));

      // Fetch data with the URL parameters
      fetchCustomers(page, search, service, dateRange);
    };

    // Add the event listener
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []); // Only run once on mount

  // Initial fetch when component mounts - use URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(urlParams.get("page")) || 1;
    const initialSearch = urlParams.get("search") || "";
    const initialService = urlParams.get("service") || "all";

    // Set initial state from URL
    if (initialSearch !== searchQuery) setSearchQuery(initialSearch);
    if (initialService !== serviceFilter) setServiceFilter(initialService);
    if (initialPage !== pagination.currentPage) {
      setPagination((prev) => ({ ...prev, currentPage: initialPage }));
    }

    fetchCustomers(initialPage, initialSearch, initialService, dateRange);

    // Mark initial load as complete after a brief delay
    setTimeout(() => setIsInitialLoad(false), 100);
  }, []); // Only run on mount

  // Handle filter changes (but not during initial load)
  useEffect(() => {
    if (isInitialLoad) {
      return; // Skip filter effects during initial load
    }

    const timeoutId = setTimeout(() => {
      // Reset to page 1 and fetch with new filters
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      updateURL(1, searchQuery, serviceFilter);
      fetchCustomers(1, searchQuery, serviceFilter, dateRange);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, serviceFilter, dateRange]);

  // Handle pagination changes
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    updateURL(page, searchQuery, serviceFilter, true);
    fetchCustomers(page, searchQuery, serviceFilter, dateRange);
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case "Home Cinema":
        return <Tv2 className="text-[#5500FF]" width={18} />;
      case "Security System":
        return <Cctv className="text-[#0068AD]" width={18} />;
      case "Home Automation":
        return <HouseWifi className="text-[#00A8D6]" width={18} />;
      case "Outdoor Audio Solution":
        return <Speaker className="text-[#DB0A89]" width={18} />;
      default:
        return null;
    }
  };

  const handleAddCustomer = () => {
    if (!canCreate("customers")) {
      addToast({
        title: "Permission Denied",
        description: "You don't have permission to add customers",
        color: "danger",
      });
      return;
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Handle row click with proper event handling
  const handleRowClick = (customer, event) => {
    // Prevent navigation if clicked element is pagination or has data-no-navigate attribute
    if (
      event.target.closest("[data-no-navigate]") ||
      event.target.closest(".pagination") ||
      event.target.closest("button")
    ) {
      return;
    }

    if (
      userPermissions.hasViewPermission ||
      userPermissions.hasEditPermission
    ) {
      // Preserve current URL state when navigating to customer details
      const currentParams = new URLSearchParams();
      if (pagination.currentPage > 1)
        currentParams.set("page", pagination.currentPage.toString());
      if (searchQuery) currentParams.set("search", searchQuery);
      if (serviceFilter && serviceFilter !== "all")
        currentParams.set("service", serviceFilter);

      const returnUrl = currentParams.toString()
        ? `?${currentParams.toString()}`
        : "";
      router.push(
        `/dashboard/customers/${customer._id}?returnUrl=${encodeURIComponent(
          "/dashboard/customers" + returnUrl
        )}`
      );
    }
  };

  // Handle pagination change

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <DashboardHeader
          title="Customers"
          description="View and manage your customers"
        />

        <Link href="/dashboard/customers/add-customer">
          <Button
            color="primary"
            startContent={<Plus />}
            onPress={handleAddCustomer}
            disabled={!canCreate("customers")}
          >
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name, email, phone, address..."
          startContent={<Search className="text-default-400" />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />

        <div className="flex gap-2 ml-auto">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            radius="sm"
            showMonthAndYearPickers
            size="md"
            variant="bordered"
            className="w-50"
            aria-label="Filter customers by date range"
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
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                radius="sm"
                className="w-full justify-between bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                size="md"
                endContent={<ChevronDown width={16} />}
              >
                Services
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Service filter"
              selectedKeys={new Set([serviceFilter])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected) setServiceFilter(selected);
              }}
              selectionMode="single"
            >
              <DropdownItem key="all">All Services</DropdownItem>
              <DropdownItem key="Home Cinema">Home Cinema</DropdownItem>
              <DropdownItem key="Home Automation">Home Automation</DropdownItem>
              <DropdownItem key="Security System">Security System</DropdownItem>
              <DropdownItem key="Outdoor Audio Solution">
                Outdoor Audio Solution
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Components with box shadow - matching proposal pattern */}
      <div className="space-y-6 bg-white rounded-xl shadow-lg p-6 md:min-h-[600px]">
        <div className="p-6 overflow-x-auto">
          <Table
            aria-label="Customers table"
            removeWrapper
            classNames={{
              base: "w-full bg-white shadow-sm rounded-lg overflow-hidden",
              wrapper: "overflow-x-auto",
              table: "w-full",
              thead: "[&>tr]:first:shadow-none ",
              th: [
                "font-medium",
                "text-sm",
                "py-4",
                "px-6",
                "first:pl-6",
                "last:pr-6",
                "transition-colors",
                "duration-200",
                "text-[#C92125]",
                "bg-[#BF3F421A]",
                "!rounded-none", // Force remove any border radius
              ],
              tr: [
                "group",
                "border-b",
                "border-gray-200",
                "transition-colors",
                "hover:opacity-90",
              ],
              td: [
                "px-6",
                "py-4",
                "first:pl-6",
                "last:pr-6",
                "border-b-0",
                "text-sm",
                "bg-[#F4F4F454]",
              ],
            }}
          >
            <TableHeader>
              <TableColumn>Customer Name</TableColumn>
              <TableColumn>Contact</TableColumn>
              <TableColumn>Location</TableColumn>
              <TableColumn>Services</TableColumn>
              <TableColumn>Amount</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                loading ? "Loading customers..." : "No customers found"
              }
            >
              {customers.map((customer) => {
                const customerKey =
                  customer._id || customer.id || Math.random().toString();

                return (
                  <TableRow
                    key={customerKey}
                    className={
                      userPermissions.hasViewPermission ||
                      userPermissions.hasEditPermission
                        ? "cursor-pointer hover:bg-gray-50"
                        : ""
                    }
                    onClick={(event) => handleRowClick(customer, event)}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {customer.customerName || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{customer.contactNumber || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {customer.fullAddress ||
                        (customer.address
                          ? `${customer.address.city || ""}, ${
                              customer.address.district || ""
                            },${customer.address.state || ""}`
                          : "N/A")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {customer.services &&
                        Array.isArray(customer.services) ? (
                          customer.services.map((service, index) => (
                            <div key={`${customerKey}-service-${index}`}>
                              {getServiceIcon(service)}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400">No services</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.formattedTotalSpent ||
                        `₹${(customer.totalSpent || 0).toLocaleString(
                          "en-IN"
                        )}`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination moved outside table and marked to prevent navigation */}
        <div className="flex justify-end mt-6" data-no-navigate>
          <Pagination
            total={pagination.totalPages}
            initialPage={1}
            page={pagination.currentPage}
            onChange={handlePageChange}
            showControls
            className="pagination"
            data-no-navigate
            key={`pagination-${pagination.currentPage}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Customers;
