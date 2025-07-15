"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Phone, ChevronDown, Check } from "lucide-react";
import { Progress } from "@heroui/progress";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { addToast } from "@heroui/toast";
import axios from "axios";
import { useState } from "react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
      return Number.parseFloat(progress.replace("%", "")) || 0;
    }
    if (typeof progress === "string" && progress.includes("/")) {
      // Handle "current/total" style
      const [current, total] = progress.split("/").map(Number);
      return total > 0 ? (current / total) * 100 : 0;
    }
    return 0;
  };

  const statusOptions = [
    { label: "New", value: "new" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Done", value: "done" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setLoading(true);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/field`,
        { field: "projectStatus", value: newStatus },
        { headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY } }
      );
      if (res.data.success) {
        setCurrentStatus(newStatus);
        addToast({
          title: "Success",
          description: "Project status updated successfully",
          status: "success",
          color: "success",
        });
      }
    } catch (err) {
      // Optionally show error toast
      addToast({
        title: "Error",
        description: "Failed to update project status",
        status: "error",
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="cursor-pointer"
      onClick={() => router.push(`/dashboard/task?projectId=${id}`)}
    >
      <Card
        className="overflow-hidden hover:scale-105 transition-transform h-80"
        onClick={(e) => e.stopPropagation()}
      >
        <CardBody className="p-0 h-full flex flex-col overflow-hidden">
          <div
            className={`${color} p-4 text-white rounded-t-lg flex-1 flex flex-col overflow-hidden`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <Dropdown radius="sm" placement="bottom-start">
                  <DropdownTrigger>
                    <Button
                      className={`px-3 py-1 rounded-sm border border-white/10 text-white text-sm font-medium bg-opacity-80 bg-white/20 hover:bg-white/20`}
                      disabled={loading}
                      type="button"
                      variant="faded"
                      size="sm"
                      endContent={<ChevronDown className="w-4 h-4" />}
                      onClick={(e) => {
                        if (e.stopPropagation) e.stopPropagation();
                      }}
                    >
                      {loading
                        ? "Updating..."
                        : statusOptions.find(
                            (opt) => opt.value === currentStatus
                          )?.label || currentStatus}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Project Status"
                    className="w-48 rounded-sm mt-1"
                    radius="sm"
                  >
                    {statusOptions.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        onClick={(e) => {
                          if (e.stopPropagation) e.stopPropagation();
                          handleStatusChange(opt.value);
                        }}
                        endContent={
                          opt.value === currentStatus ? (
                            <Check className="w-4 h-4" />
                          ) : null
                        }
                      >
                        {opt.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
                <div className=" mt-4 flex items-center gap-3 w-4/5  ">
                  <h3 className="text-2xl font-bold line-clamp-1 overflow-hidden text-ellipsis ">
                    {customer}
                  </h3>
                  <div>
                    <Phone className="w-5 h-5  mt-1" />
                  </div>
                </div>

                <div className="flex items-start gap-1 text-white/80 text-sm w-4/5 mt-4 overflow-hidden">
                  <p className="line-clamp-3 leading-tight overflow-hidden text-ellipsis">
                    {address}
                  </p>
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
          <div className="p-3 flex-shrink-0">
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
              aria-label={`Project progress: ${getProgressPercent(progress)}%`}
            />
          </div>

          {/* Team Section */}
          <div className="p-4 flex justify-between items-center flex-shrink-0">
            <AvatarGroup isBordered max={8}>
              {avatars.map((avatar, index) => (
                <Avatar key={index} src={avatar} />
              ))}
            </AvatarGroup>
            <div className="text-[#272523] text-lg font-medium">
              {progress}{" "}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProjectCard;
