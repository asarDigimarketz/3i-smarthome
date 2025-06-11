import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { MapPin, Phone } from "lucide-react";

export function ProjectCards() {
  const projects = [
    {
      id: 1,
      customerName: "Vinoth R",
      location: "123/ss colony, Thirunager, Madurai-625018",
      service: "Home Cinema",
      amount: "₹30,00,000",
      date: "26/05/2025",
      status: "InProgress",
      progress: "1/3",
      color: "bg-blue-500",
      avatars: [
        "https://img.heroui.chat/image/avatar?w=40&h=40&u=user1",
        "https://img.heroui.chat/image/avatar?w=40&h=40&u=user2",
      ],
    },
    {
      id: 2,
      customerName: "Vaisu K",
      location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
      service: "Security System",
      amount: "₹26,00,000",
      date: "18/05/2025",
      status: "InProgress",
      progress: "2/5",
      color: "bg-teal-500",
      avatars: ["https://img.heroui.chat/image/avatar?w=40&h=40&u=user3"],
    },
    {
      id: 3,
      customerName: "Sanker A",
      location: "1A/67 Anbu Nager, Anna Nager, Madurai-625018",
      service: "Home Automation",
      amount: "₹20,00,000",
      date: "08/04/2025",
      status: "Completed",
      progress: "3/3",
      color: "bg-cyan-500",
      avatars: ["https://img.heroui.chat/image/avatar?w=40&h=40&u=user4"],
    },
    {
      id: 4,
      customerName: "Anu J",
      location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
      service: "Home Cinema",
      amount: "₹32,00,000",
      date: "22/04/2025",
      status: "InProgress",
      progress: "2/3",
      color: "bg-blue-500",
      avatars: ["https://img.heroui.chat/image/avatar?w=40&h=40&u=user5"],
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "InProgress":
        return "bg-blue-100 text-blue-600";
      case "Completed":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getProgressPercent = (progress) => {
    const [current, total] = progress.split("/").map(Number);
    return (current / total) * 100;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <div
            className={`p-6 ${project.color} bg-gradient-to-br from-opacity-80 to-opacity-100 text-white`}
          >
            <div className="flex justify-between items-start">
              <div>
                <Chip className={getStatusColor(project.status)} size="sm">
                  {project.status}
                </Chip>
                <h3 className="text-2xl font-bold mt-4">
                  {project.customerName}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  <p>{project.location}</p>
                </div>
              </div>
              <div>
                <Phone className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm text-white/80">Service</div>
              <div className="font-medium">{project.service}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-sm text-white/80">Amount</div>
                <div className="font-medium">{project.amount}</div>
              </div>
              <div>
                <div className="text-sm text-white/80">Date</div>
                <div className="font-medium">{project.date}</div>
              </div>
            </div>
          </div>

          <div className="p-4 flex justify-between items-center">
            <div className="flex -space-x-2">
              {project.avatars.map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ))}
            </div>
            <div className="text-gray-700 font-medium">{project.progress}</div>
          </div>

          <Progress
            value={getProgressPercent(project.progress)}
            color="danger"
            className="h-2"
          />
        </Card>
      ))}
    </div>
  );
}
