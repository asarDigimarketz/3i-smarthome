import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function StatusDropdown({ onStatusChange }) {
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
          className="w-full justify-between bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800"
          size="md"
          classNames={{ input: "text-left" }}
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
        <DropdownItem key="Hot">Hot</DropdownItem>
        <DropdownItem key="Cold">Cold</DropdownItem>
        <DropdownItem key="Warm">Warm</DropdownItem>
        <DropdownItem key="Scrap">Scrap</DropdownItem>
        <DropdownItem key="Confirmed">Confirmed</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
