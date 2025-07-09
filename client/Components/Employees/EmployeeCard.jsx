import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
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
  userPermissions = {},
  onEmployeeUpdate,
}) => {
  const cardContent = (
    <CardBody className="p-0">
      <div className="flex flex-col h-full">
        {/* Top Row: Avatar, Name, Status */}
        <div className="flex items-start justify-between p-5 pb-2">
          <div className="flex items-center gap-3">
            <Avatar
              src={avatar}
              className="w-16 h-16 rounded-full border border-gray-200 object-cover"
              alt={name}
            />
            <div>
              <div className="text-xl font-bold text-[#232323] leading-tight">
                {name}
              </div>
              <div className="text-sm text-[#B0B0B0] font-medium mt-0.5">
                {role}
              </div>
            </div>
          </div>
          <span className="px-4 py-1 text-xs font-medium rounded-full border border-[#C7F2D0] bg-[#fff] text-[#2DBE64] ml-2 mt-1">
            {status}
          </span>
        </div>
        {/* Info Row: Employee ID & Department */}
        <div className="grid grid-cols-2 gap-2 px-5 pt-2 pb-1 ">
          <div>
            <div className="text-xs text-[#B0B0B0] font-medium mb-0.5">
              Employee ID
            </div>
            <div className="text-lg font-semibold text-[#232323]">{id}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#B0B0B0] font-medium mb-0.5">
              Department
            </div>
            <div className="text-lg font-semibold text-[#232323]">
              {department}
            </div>
          </div>
        </div>
        {/* Contact Row: Phone & Email */}
        <div className="flex flex-col gap-1 px-5 pt-2 pb-5 mt-2">
          <div className="flex items-center gap-2 text-[#232323]">
            <Phone className="text-primary w-4 h-4" />
            <span className="text-[15px] font-medium tracking-tight">
              {phone}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#232323]">
            <Mail className="text-primary w-4 h-4" />
            <span className="text-[15px] font-medium tracking-tight">
              {email}
            </span>
          </div>
        </div>
      </div>
    </CardBody>
  );

  // If user has view permission, make it a clickable link, otherwise just a card
  if (userPermissions.hasViewPermission || userPermissions.hasEditPermission) {
    return (
      <Card
        as={Link}
        href={`/dashboard/employees/${id}`}
        isPressable
        className="border border-primary rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white min-w-[400px] max-w-[420px]"
        style={{ boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)" }}
      >
        {cardContent}
      </Card>
    );
  }

  // If no view permission, render as non-clickable card
  return (
    <Card className="border border-primary rounded-xl shadow-sm bg-white min-w-[400px] max-w-[420px]">
      {cardContent}
    </Card>
  );
};

export default EmployeeCard;
