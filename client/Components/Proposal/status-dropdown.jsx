import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { ChevronDown, Check } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusDropdown({ onStatusChange, selectedStatuses = new Set(["Hot", "Cold", "Warm", "Scrap"]) }) {
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
      // When "All Status" is selected, show all statuses including "Confirmed"
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
    if (selectedKeys.size === 1) return Array.from(selectedKeys)[0];
    return `${selectedKeys.size} Statuses`;
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          className="w-full justify-between bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800"
          size="md"
          classNames={{ input: "text-left" }}
          radius="sm"
          endContent={<ChevronDown className="text-gray-600" />}
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
      >
        <DropdownItem key="All Status">
          All Status
        </DropdownItem>
        <DropdownItem key="Hot">
          Hot
        </DropdownItem>
        <DropdownItem key="Cold">
          Cold
        </DropdownItem>
        <DropdownItem key="Warm">
          Warm
        </DropdownItem>
        <DropdownItem key="Scrap">
          Scrap
        </DropdownItem>
        <DropdownItem key="Confirmed">
          Confirmed
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
