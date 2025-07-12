import React from "react";
import { Select, SelectItem } from "@heroui/select";

export const statusOptions = [
  { label: "Hot", key: "Hot" },
  { label: "Cold", key: "Cold" },
  { label: "Warm", key: "Warm" },
  { label: "Scrap", key: "Scrap" },
  { label: "Confirmed", key: "Confirmed" },
];

export function StatusSelect({ value, onChange }) {
  return (
    <Select
      placeholder="Status"
      radius="sm"
      variant="bordered"
      className="w-full"
      aria-label="Select status"
      classNames={{
        trigger: "border-[#E0E5F2]  h-[50px]",
      }}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selectedValue = Array.from(keys)[0];
        onChange && onChange(selectedValue);
      }}
      isDisabled={value === "Confirmed"}
    >
      {statusOptions.map((status) => (
        <SelectItem key={status.key} value={status.key}>
          {status.label}
        </SelectItem>
      ))}
    </Select>
  );
}
