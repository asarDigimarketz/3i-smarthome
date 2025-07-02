import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
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
  progressPercentage,
  color,
  assignedEmployees,
}) => {
  // Generate avatars from assigned employees or use default
  const getAvatars = () => {
    if (assignedEmployees && assignedEmployees.length > 0) {
      return assignedEmployees.slice(0, 2).map((emp, index) => ({
        src:
          emp.avatar ||
          `https://img.heroui.chat/image/avatar?w=200&h=200&u=${
            emp._id || index + 1
          }`,
        name: emp.firstName
          ? `${emp.firstName} ${emp.lastName || ""}`
          : `User ${index + 1}`,
      }));
    }
    return [
      {
        src: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
        name: "User 1",
      },
      {
        src: "https://img.heroui.chat/image/avatar?w=200&h=200&u=2",
        name: "User 2",
      },
    ];
  };

  const avatars = getAvatars();

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
            value={progressPercentage || 0}
            color={
              progressPercentage === 100
                ? "success"
                : progressPercentage > 50
                ? "warning"
                : "danger"
            }
            className="h-2"
          />
        </div>

        {/* Team Section */}
        <div className="p-3 pt-0 flex items-center justify-between">
          <div className="flex -space-x-2">
            {avatars.map((avatar, index) => (
              <Avatar
                key={index}
                src={avatar.src}
                size="sm"
                className="border-2 border-white"
                title={avatar.name}
              />
            ))}
            {assignedEmployees && assignedEmployees.length > 2 && (
              <div className="w-8 h-8 rounded-full bg-default-100 border-2 border-white flex items-center justify-center text-xs font-medium text-default-600">
                +{assignedEmployees.length - 2}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-default-700">
            {progress}
          </span>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;
