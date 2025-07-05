import React from "react";
import { Select, SelectItem } from "@heroui/select";

export const serviceOptions = [
  { label: "Home Cinema", key: "Home Cinema" },
  { label: "Home Automation", key: "Home Automation" },
  { label: "Security System", key: "Security System" },
  { label: "Outdoor Audio Solution", key: "Outdoor Audio Solution" },
];

export function ServicesSelect({ value, onChange, isInvalid, errorMessage }) {
  return (
    <Select
      placeholder="Services"
      radius="sm"
      variant="bordered"
      className="w-full"
      classNames={{
        trigger: "border-[#E0E5F2]  h-[50px]",
      }}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selectedValue = Array.from(keys)[0];
        onChange && onChange(selectedValue);
      }}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
    >
      {serviceOptions.map((service) => (
        <SelectItem key={service.key} value={service.key}>
          {service.label}
        </SelectItem>
      ))}
    </Select>
  );
}
