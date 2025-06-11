import { Select, SelectItem } from "@heroui/select";

export function ProjectStatusSelect() {
  const statusOptions = [
    { label: "New Project", value: "new" },
    { label: "InProgress", value: "inprogress" },
    { label: "Done", value: "done" },
    { label: "Completed", value: "completed" },
    { label: "Dropped/Cancelled", value: "dropped" },
  ];

  return (
    <Select
      placeholder="Status"
      radius="sm"
      variant="bordered"
      className="w-full"
    >
      {statusOptions.map((status) => (
        <SelectItem key={status.value} value={status.value}>
          {status.label}
        </SelectItem>
      ))}
    </Select>
  );
}
