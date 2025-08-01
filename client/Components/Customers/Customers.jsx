"use client";
import { useState, useEffect, useCallback } from "react";
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
  const { 
    canCreate, 
     
    canView,
    getUserPermissions 
  } = usePermissions();

  // State for customers data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    limit: 10,
  });

  // Get permissions using the hook - memoize to prevent re-renders
  const userPermissions = getUserPermissions("customers");

  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  // Memoize the fetchCustomers function to prevent unnecessary re-renders
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
        service: serviceFilter,
      });

      // Add date range parameters if date range is selected
      if (dateRange && dateRange.start && dateRange.end) {
        try {
          // Convert DateRangePicker format to Date objects
          // DateRangePicker returns { year, month, day } format
          const startDate = new Date(
            dateRange.start.year,
            dateRange.start.month - 1, // Month is 0-indexed in Date constructor
            dateRange.start.day
          );
          
          const endDate = new Date(
            dateRange.end.year,
            dateRange.end.month - 1, // Month is 0-indexed in Date constructor
            dateRange.end.day
          );
          
          // Set start time to beginning of day (00:00:00)
          startDate.setHours(0, 0, 0, 0);
          
          // Set end time to end of day (23:59:59.999) for same day filtering
          endDate.setHours(23, 59, 59, 999);
          
          
          
          params.append('startDate', startDate.toISOString());
          params.append('endDate', endDate.toISOString());
        } catch (dateError) {
          console.error('Error converting date range:', dateError);
          // Continue without date filtering if date conversion fails
        }
      }

      const response = await apiClient.get(`/api/customers?${params}`);

      if (response.data.success) {
        // Ensure customers is always an array
        const customersData = Array.isArray(response.data.data.customers)
          ? response.data.data.customers
          : [];

        setCustomers(customersData);
        setPagination(
          response.data.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalCustomers: 0,
            limit: 10,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      // Set empty array on error to prevent table issues
      setCustomers([]);
      addToast({
        title: "Error",
        description: "Failed to fetch customers",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchQuery, serviceFilter, dateRange]);

  // Fetch customers when component mounts or when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [searchQuery, serviceFilter, dateRange]);

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

    
        <Card className="bg-white rounded-xl shadow-lg p-6 md:min-h-[600px]">
          <CardBody className="p-0">
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
                      onClick={() => {
                        if (
                          userPermissions.hasViewPermission ||
                          userPermissions.hasEditPermission
                        ) {
                          window.location.href = `/dashboard/customers/${customer._id}`;
                        }
                      }}
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
                                customer.address.state || ""
                              }`
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
          </CardBody>
        </Card>
      
    </div>
  );
};

export default Customers;