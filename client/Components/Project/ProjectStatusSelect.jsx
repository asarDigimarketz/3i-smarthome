import { Select, SelectItem } from "@heroui/select";

export function ProjectStatusSelect({
  value,
  onChange,
  isInvalid,
  errorMessage,
}) {
  const statusOptions = [
    { label: "New Project", value: "new" },
    { label: "In Progress", value: "in-progress" },
    { label: "Done", value: "done" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <Select
      placeholder="Select Status"
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
      {statusOptions.map((status) => (
        <SelectItem key={status.value} value={status.value}>
          {status.label}
        </SelectItem>
      ))}
    </Select>
  );
}
