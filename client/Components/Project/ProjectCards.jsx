import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Phone } from "lucide-react";
import axios from "axios";

export function ProjectCards() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects?limit=20`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.data.success) {
        // Transform backend data to match the UI structure
        const transformedProjects = response.data.data.map(
          (project, index) => ({
            id: project._id,
            customerName: project.customerName,
            location:
              project.fullAddress ||
              `${project.address?.addressLine}, ${project.address?.city}`,
            service: project.services,
            amount: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(project.projectAmount),
            date: new Date(project.projectDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            status: getStatusDisplayName(project.projectStatus),
            progress:
              project.progress ||
              `${project.completedTasks || 0}/${project.totalTasks || 0}`,
            color: getServiceColor(project.services),
            avatars: generateAvatars(project.assignedEmployees),
          })
        );

        setProjects(transformedProjects);
      }
    } catch (error) {
      console.error("Fetch projects error:", error);
      // Fallback to static data if API fails
      setProjects(getStaticProjects());
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status display name
  const getStatusDisplayName = (status) => {
    const statusMap = {
      new: "New",
      "in-progress": "InProgress",
      completed: "Completed",
      done: "Done",
      cancelled: "Cancelled",
    };
    return statusMap[status] || "InProgress";
  };

  // Helper function to get service color
  const getServiceColor = (service) => {
    switch (service) {
      case "Home Cinema":
        return "bg-blue-500";
      case "Home Automation":
        return "bg-cyan-500";
      case "Security System":
        return "bg-teal-500";
      case "Outdoor Audio Solution":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  // Helper function to generate avatars
  const generateAvatars = (employees) => {
    if (employees && employees.length > 0) {
      return employees
        .slice(0, 2)
        .map(
          (emp, index) =>
            `https://img.heroui.chat/image/avatar?w=40&h=40&u=user${index + 1}`
        );
    }
    return [
      "https://img.heroui.chat/image/avatar?w=40&h=40&u=user1",
      "https://img.heroui.chat/image/avatar?w=40&h=40&u=user2",
    ];
  };

  // Static fallback data
  const getStaticProjects = () => [
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

  useEffect(() => {
    fetchProjects();
  }, []);

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
    return total > 0 ? (current / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="p-6 bg-gray-200 h-40"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <div
            className={`p-6 ${project.color} bg-gradient-to-br from-opacity-80 to-opacity-100 text-white`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <Chip className={getStatusColor(project.status)} size="sm">
                  {project.status}
                </Chip>
                <h3 className="text-2xl font-bold mt-4 flex items-center gap-3">
                  {project.customerName} <Phone className="w-5 h-5 mt-1" />
                </h3>
                <div className="flex items-center gap-1  text-white/80 text-sm w-4/5 mt-4">
                  <p>{project.location}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <div className="mt-6">
                  <div className="text-sm text-white/80">Service</div>
                  <div className="font-medium">{project.service}</div>
                </div>
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
