"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const STATUS_LABELS = {
  "": "All Status",
  new: "New Project",
  "in-progress": "In Progress",
  done: "Done",
  completed: "Completed",
  cancelled: "Dropped/Cancelled",
};

export function ProjectStatusDropdown({ onStatusChange, selectedStatuses = new Set(["new", "in-progress", "done"]) }) {
  const [selectedKeys, setSelectedKeys] = useState(selectedStatuses);

  // Update selected keys when selectedStatuses prop changes
  useEffect(() => {
    setSelectedKeys(selectedStatuses);
  }, [selectedStatuses]);

  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);

    // Convert Set to array
    const statusArray = Array.from(keys);

    // Check if "All Status" is selected
    if (statusArray.includes("All Status")) {
      // When "All Status" is selected, show all statuses including "Completed" and "Dropped/Cancelled"
      onStatusChange && onStatusChange("all");
    } else {
      // Pass the selected statuses to parent (excluding "All Status")
      const filteredStatuses = statusArray.filter(status => status !== "All Status");
      onStatusChange && onStatusChange(filteredStatuses);
    }
  };

  // Get display text for button
  const getDisplayText = () => {
    if (selectedKeys.size === 0) return "Select Status";
    if (selectedKeys.has("All Status") && selectedKeys.size === 1) return "All Status";
    if (selectedKeys.size === 1) {
      const status = Array.from(selectedKeys)[0];
      return STATUS_LABELS[status] || status;
    }
    return `${selectedKeys.size} Statuses`;
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
          {getDisplayText()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Status options"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        disallowEmptySelection={false}
        closeOnSelect={false}
      >
        <DropdownItem key="All Status">All Status</DropdownItem>
        <DropdownItem key="new">New Project</DropdownItem>
        <DropdownItem key="in-progress">In Progress</DropdownItem>
        <DropdownItem key="done">Done</DropdownItem>
        <DropdownItem key="completed">Completed</DropdownItem>
        <DropdownItem key="cancelled">Dropped/Cancelled</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
