import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { ChevronDown } from "lucide-react";

export function StatusDropdown() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          radius="sm"
          endContent={<ChevronDown className="text-gray-600" />}
        >
          Status
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Status options">
        <DropdownItem key="hot">Hot</DropdownItem>
        <DropdownItem key="cold">Cold</DropdownItem>
        <DropdownItem key="warm">Warm</DropdownItem>
        <DropdownItem key="frozen">Frozen</DropdownItem>
        <DropdownItem key="complete">Complete</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
