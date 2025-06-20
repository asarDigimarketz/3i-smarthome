"use client";
import { useState, useEffect } from "react";
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
import { useSession } from "next-auth/react";
import EmployeeCard from "./EmployeeCard.jsx";
import { ChevronDown, Plus, Search } from "lucide-react";
import { EmployeeModal } from "./EmployeeModal";

const Employees = () => {
  const { data: session } = useSession();

  // Permission checks based on user's actual permissions
  const [userPermissions, setUserPermissions] = useState({
    hasAddPermission: false,
    hasEditPermission: false,
    hasDeletePermission: false,
    hasViewPermission: false,
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6;

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

      // Check employee permissions for employees module
      const permissions = session.user.permissions || [];
      const employeePermission = permissions.find(
        (p) => p.page?.toLowerCase() === "employees"
      );

      if (employeePermission && employeePermission.actions) {
        setUserPermissions({
          hasViewPermission: employeePermission.actions.view || false,
          hasAddPermission: employeePermission.actions.add || false,
          hasEditPermission: employeePermission.actions.edit || false,
          hasDeletePermission: employeePermission.actions.delete || false,
        });
      }
    };

    checkUserPermissions();
  }, [session]);

  // Fetch employees from API
  const fetchEmployees = async () => {
    if (!userPermissions.hasViewPermission) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employeeManagement`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      if (data.success) {
        // Transform backend data to match frontend format
        const transformedEmployees = data.employees.map((emp) => ({
          id: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role?.role || "N/A",
          department: emp.department?.name || "N/A",
          status: emp.status === "active" ? "Active" : "Inactive",
          email: emp.email,
          phone: emp.mobileNo,
          avatar:
            emp.avatar ||
            `https://img.heroui.chat/image/avatar?w=200&h=200&u=${Math.floor(
              Math.random() * 10
            )}`,
          _id: emp._id,
          originalData: emp,
        }));
        setEmployees(transformedEmployees);
      } else {
        throw new Error(data.message || "Failed to fetch employees");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      addToast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPermissions.hasViewPermission) {
      fetchEmployees();
    }
  }, [userPermissions.hasViewPermission]);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      employee.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleModalClose = (shouldRefresh = false) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchEmployees();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Employee Management
          </h1>
          <p className="text-default-500">Manage employees List</p>
        </div>

        {userPermissions.hasAddPermission && (
          <Button
            color="primary"
            startContent={<Plus />}
            onPress={handleAddEmployee}
          >
            Add Employee
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search Employees..."
          startContent={<Search className="text-default-400" />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />

        <div className="flex gap-2 ml-auto">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" endContent={<ChevronDown width={16} />}>
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
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Show loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <EmployeeSkeleton key={index} />
          ))
        ) : paginatedEmployees.length > 0 ? (
          paginatedEmployees.map((employee) => (
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
              onEmployeeUpdate={fetchEmployees}
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            color="primary"
            showControls
          />
        </div>
      )}

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
