import { Card, CardBody } from "@heroui/card";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Progress } from "@heroui/progress";

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
  assignedEmployees,
}) => {
  // Generate avatars from assigned employees or use default
  const generateAvatars = (employees) => {
    if (employees && employees.length > 0) {
      return employees
        .slice(0, 2)
        .map(
          (emp, index) =>
            `${
              emp.avatar ||
              `https://img.heroui.chat/image/avatar?w=40&h=40&u=user${
                index + 1
              }`
            }`
        );
    }
    return [
      "https://img.heroui.chat/image/avatar?w=40&h=40&u=user1",
      "https://img.heroui.chat/image/avatar?w=40&h=40&u=user2",
      "https://img.heroui.chat/image/avatar?w=40&h=40&u=user1",
      "https://img.heroui.chat/image/avatar?w=40&h=40&u=user2",
    ];
  };

  const avatars = generateAvatars(assignedEmployees);
  const getProgressPercent = (progress) => {
    if (!progress) return 0;
    if (typeof progress === "string" && progress.includes("%")) {
      // Handle "50%" style
      return parseFloat(progress.replace("%", "")) || 0;
    }
    if (typeof progress === "string" && progress.includes("/")) {
      // Handle "current/total" style
      const [current, total] = progress.split("/").map(Number);
      return total > 0 ? (current / total) * 100 : 0;
    }
    return 0;
  };
  return (
    <Card
      as={Link}
      href={`/dashboard/projects/${id}`}
      isPressable
      className="overflow-visible hover:scale-105 transition-transform"
    >
      <CardBody className="p-0">
        <div className={`${color} p-4 text-white rounded-t-lg`}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <Chip
                size="sm"
                variant="flat"
                color={status === "Complete" ? "success" : "warning"}
                className="text-white border border-white/30"
              >
                {status}
              </Chip>
              <h3 className="text-2xl font-bold mt-4 flex items-center gap-3">
                {customer} <Phone className="w-5 h-5 mt-1" />
              </h3>
              <div className="flex items-center gap-1  text-white/80 text-sm w-4/5 mt-4">
                <p>{address}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <div className="mt-6">
                <div className="text-sm text-white/80">Service</div>
                <div className="font-medium">{service}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Amount</div>
                <div className="font-medium">{amount}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Date</div>
                <div className="font-medium">{date}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-3">
          <Progress
            value={getProgressPercent(progress)}
            color={
              progress === 100
                ? "success"
                : progress > 50
                ? "warning"
                : "primary"
            }
            className="h-2"
          />
        </div>

        {/* Team Section */}
        <div className="p-4 flex justify-between items-center">
          <AvatarGroup isBordered max={3}>
            {avatars.map((avatar, index) => (
              <Avatar key={index} src={avatar} />
            ))}
          </AvatarGroup>
          <div className="text-[#272523] text-lg font-medium">{progress} </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;
