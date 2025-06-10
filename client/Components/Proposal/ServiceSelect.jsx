import React from "react";
import { Select, SelectItem } from "@heroui/select";

export const serviceOptions = [
  { label: "Home Cinema", key: "home-cinema" },
  { label: "Security System", key: "security-system" },
  { label: "Home Automation", key: "home-automation" },
];
export function ServicesSelect() {
  const [value, setValue] = React.useState("");

  return (
    <Select
      placeholder="Services"
      radius="sm"
      variant="bordered"
      className="w-full"
      selectedKey={value}
      onSelectionChange={(key) => setValue(key)}
    >
      {serviceOptions.map((service) => (
        <SelectItem key={service.key} value={service.key}>
          {service.label}
        </SelectItem>
      ))}
    </Select>
  );
}
