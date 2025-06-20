"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function ProjectStatusDropdown({ onStatusChange }) {
  const [selectedStatus, setSelectedStatus] = useState("Status");

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    onStatusChange && onStatusChange(status === "Status" ? "" : status);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          radius="sm"
          endContent={<ChevronDown className="text-gray-600" />}
        >
          {selectedStatus}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Status options"
        onAction={(key) => handleStatusSelect(key)}
      >
        <DropdownItem key="Status">All Status</DropdownItem>
        <DropdownItem key="new-project">New Project</DropdownItem>
        <DropdownItem key="inprogress">In Progress</DropdownItem>
        <DropdownItem key="done">Done</DropdownItem>
        <DropdownItem key="completed">Completed</DropdownItem>
        <DropdownItem key="dropped">Dropped/Cancelled</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
