import React from "react";
import { Select, SelectItem } from "@heroui/select";
export const statusOptions = [
  { label: "Hot", key: "hot" },
  { label: "Cold", key: "cold" },
  { label: "Warm", key: "warm" },
  { label: "Frozen", key: "frozen" },
  { label: "Complete", key: "complete" },
];
export function StatusSelect() {
  const [value, setValue] = React.useState("");

  return (
    <Select
      placeholder="Status"
      radius="sm"
      variant="bordered"
      className="w-full"
      selectedKey={value}
      onSelectionChange={(key) => setValue(key)}
    >
      {statusOptions.map((status) => (
        <SelectItem key={status.key} value={status.key}>
          {status.label}
        </SelectItem>
      ))}
    </Select>
  );
}
