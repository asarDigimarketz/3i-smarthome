import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import { Phone } from "lucide-react";

const ProjectCard = ({
  id,
  customer,
  status,
  service,
  amount,
  date,
  address,
  progress,
  color,
}) => {
  return (
    <Card
      as={Link}
      href={`/projects/${id}`}
      isPressable
      className="overflow-visible"
    >
      <CardBody className="p-0">
        <div className={`${color} p-4 text-white rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <Chip
              size="sm"
              variant="flat"
              color={status === "Complete" ? "success" : "warning"}
              className="text-white border border-white/30"
            >
              {status}
            </Chip>
          </div>

          <div className="mt-3">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {customer} <Phone width={16} />
            </h3>
            <p className="text-xs opacity-80">{address}</p>
          </div>

          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Service</span>
              <span className="font-medium">{service}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Amount</span>
              <span className="font-medium">{amount}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Date</span>
              <span className="font-medium">{date}</span>
            </div>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex -space-x-2">
            <Avatar
              src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
              size="sm"
            />
            <Avatar
              src="https://img.heroui.chat/image/avatar?w=200&h=200&u=2"
              size="sm"
            />
          </div>
          <span className="font-medium">{progress}</span>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;
