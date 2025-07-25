"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { ChevronDown } from "lucide-react";

const STATUS_LABELS = {
  "": "All Status",
  new: "New Project",
  "in-progress": "In Progress",
  done: "Done",
  completed: "Completed",
  cancelled: "Dropped/Cancelled",
};

export function ProjectStatusDropdown({ value = "", onChange }) {
  // Map value to label for display
  const displayLabel = STATUS_LABELS[value] || "All Status";

  const handleStatusSelect = (status) => {
    onChange && onChange(status === "Status" ? "" : status);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          radius="sm"
          className="w-full justify-between bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800"
          size="md"
          endContent={
            <ChevronDown className="text-gray-600 flex justify-between" />
          }
        >
          {displayLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Status options"
        onAction={(key) => handleStatusSelect(key)}
      >
        <DropdownItem key="">All Status</DropdownItem>
        <DropdownItem key="new">New Project</DropdownItem>
        <DropdownItem key="in-progress">In Progress</DropdownItem>
        <DropdownItem key="done">Done</DropdownItem>
        <DropdownItem key="completed">Completed</DropdownItem>
        <DropdownItem key="cancelled">Dropped/Cancelled</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
