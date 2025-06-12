import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const EmployeeCard = ({
  id,
  name,
  role,
  department,
  status,
  email,
  phone,
  avatar,
}) => {
  return (
    <Card
      as={Link}
      href={`/dashboard/employees/${id}`}
      isPressable
      className="border border-default-200"
    >
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Avatar src={avatar} className="w-16 h-16" alt={name} />
          <Chip
            color={status === "Active" ? "success" : "danger"}
            variant="flat"
            size="sm"
          >
            {status}
          </Chip>
        </div>

        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-default-500">{role}</p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
          <div>
            <p className="text-sm text-default-500">Employee ID</p>
            <p className="font-medium">{id}</p>
          </div>
          <div>
            <p className="text-sm text-default-500">Department</p>
            <p className="font-medium">{department}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-divider space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="text-primary" width={16} />
            <span className="text-sm">{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="text-primary" width={16} />
            <span className="text-sm">{email}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EmployeeCard;
