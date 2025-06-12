"use client";
import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";
import EmployeeCard from "./EmployeeCard.jsx";
import { ChevronDown, Plus, Search } from "lucide-react";
import { EmployeeModal } from "./EmployeeAddingOrEditModal";

const employees = [
  {
    id: "EMP-001",
    name: "Arun R",
    role: "Lead Technician",
    department: "Installation",
    status: "Active",
    email: "arun@gmail.com",
    phone: "+91 96541 867957",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
  },
  {
    id: "EMP-002",
    name: "Vickey H",
    role: "Lead Technician",
    department: "Installation",
    status: "Inactive",
    email: "vickey@gmail.com",
    phone: "+91 96541 12348",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=2",
  },
  {
    id: "EMP-001",
    name: "Vinoth Kumar J",
    role: "Installation Specialist",
    department: "Installation",
    status: "Active",
    email: "vinothkumar12@gmail.com",
    phone: "+91 87541 486311",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=3",
  },
  {
    id: "EMP-006",
    name: "Bala D",
    role: "Installation Specialist",
    department: "Installation",
    status: "Active",
    email: "bala.d347@gmail.com",
    phone: "+91 87541 486311",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=4",
  },
  {
    id: "EMP-003",
    name: "Anbarasan V",
    role: "Service Technician",
    department: "Service",
    status: "Active",
    email: "ramanathan55@gmail.com",
    phone: "+91 96541 486322",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=5",
  },
  {
    id: "EMP-004",
    name: "Rahul G",
    role: "Lead Technician",
    department: "Installation",
    status: "Inactive",
    email: "rahul@gmail.com",
    phone: "+91 97621 488567",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=6",
  },
  {
    id: "EMP-007",
    name: "Ariyalakan",
    role: "Installation Specialist",
    department: "Installation",
    status: "Active",
    email: "arivalakan@gmail.com",
    phone: "+91 87541 486311",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=7",
  },
  {
    id: "EMP-008",
    name: "Aravind",
    role: "Lead Technician",
    department: "Installation",
    status: "Inactive",
    email: "aravind@gmail.com",
    phone: "+91 96541 486322",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=8",
  },
  {
    id: "EMP-009",
    name: "Suresh Kumar",
    role: "Lead Technician",
    department: "Installation",
    status: "Active",
    email: "sureshkumar@gmail.com",
    phone: "+91 96541 486322",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=9",
  },
];

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Employee Management
          </h1>
          <p className="text-default-500">Manage employees List</p>
        </div>

        <Button
          color="primary"
          startContent={<Plus />}
          onPress={() => setIsModalOpen(true)}
        >
          Add
        </Button>
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
        {paginatedEmployees.map((employee) => (
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
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            initialPage={1}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            color="primary"
          />
        </div>
      )}

      <EmployeeModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};

export default Employees;
