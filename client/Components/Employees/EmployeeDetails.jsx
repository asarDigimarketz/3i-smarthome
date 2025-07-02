"use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { addToast } from "@heroui/toast";
import { ArrowLeft, Edit, File, Mail, Phone } from "lucide-react";
import ProjectCard from "../Dashboard/ProjectCard.jsx";
import { useState, useEffect } from "react";
import { EmployeeModal } from "./EmployeeModal";

const EmployeeDetail = () => {
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.employeeId;

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock projects data - you can replace this with actual API call
  const mockProjects = [
    {
      id: "1",
      customer: "Vinoth R",
      status: "InProgress",
      service: "Home Cinema",
      amount: "₹30,00,000",
      date: "26/05/2025",
      address: "123/ss colony, Thirunager, Madurai-625018",
      progress: "1/3",
      color: "bg-blue-500",
    },
  ];

  // Fetch employee data from API
  const fetchEmployeeData = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employeeManagement/${employeeId}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employee data");
      }

      const data = await response.json();
      if (data.success) {
        // Transform backend data to match frontend format
        const emp = data.employee;
        const transformedEmployee = {
          id: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role?.role || "N/A",
          department: emp.department?.name || "N/A",
          dateOfBirth: emp.dateOfBirth
            ? new Date(emp.dateOfBirth).toLocaleDateString("en-GB")
            : "N/A",
          dateOfJoining: emp.dateOfHiring
            ? new Date(emp.dateOfHiring).toLocaleDateString("en-GB")
            : "N/A",
          phone: emp.mobileNo || "N/A",
          email: emp.email || "N/A",
          note: emp.notes || "No notes available",
          avatar:
            emp.avatar ||
            `https://img.heroui.chat/image/avatar?w=200&h=200&u=${Math.floor(
              Math.random() * 10
            )}`,
          attachments: emp.documents || [],
          status: emp.status,
          stats: {
            completed: 20, // Mock data
            ongoing: 1, // Mock data
            projects: 2, // Mock data
          },
          projects: mockProjects,
          originalData: emp,
        };
        setEmployeeData(transformedEmployee);
      } else {
        throw new Error(data.message || "Failed to fetch employee data");
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      addToast({
        title: "Error",
        description: "Failed to load employee details. Please try again.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId]);

  const handleModalClose = (shouldRefresh = false) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchEmployeeData();
    }
  };

  // Loading skeleton component
  const EmployeeDetailSkeleton = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      <Card className="border border-default-200">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <Skeleton className="w-32 h-32 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 rounded-lg mb-2" />
              <Skeleton className="h-4 w-24 rounded-lg" />
            </div>
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  if (loading) {
    return <EmployeeDetailSkeleton />;
  }

  if (!employeeData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Employee not found
          </h3>
          <p className="text-gray-500 mb-4">
            The employee you're looking for doesn't exist.
          </p>
          <Button
            as={Link}
            href="/dashboard/employees"
            color="primary"
            startContent={<ArrowLeft />}
          >
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Employee Details</h1>
          <p className="text-default-500">Manage Employee Information</p>
        </div>

        <div className="flex gap-2">
          <Button
            as={Link}
            href="/dashboard/employees"
            variant="flat"
            startContent={<ArrowLeft />}
          >
            Back
          </Button>
          <Button
            color="primary"
            startContent={<Edit />}
            onPress={() => setIsModalOpen(true)}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Employee Profile */}
      <Card className="border border-default-200">
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Avatar and Role */}
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={employeeData.avatar}
                className="w-32 h-32"
                alt={employeeData.name}
              />
              <h2 className="text-xl font-bold mt-4">{employeeData.name}</h2>
              <p className="text-default-500">{employeeData.role}</p>
              <div
                className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  employeeData.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {employeeData.status === "active" ? "Active" : "Inactive"}
              </div>
            </div>

            {/* Middle Column - Employee Details */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-default-500">Employee ID</p>
                  <p className="font-medium">{employeeData.id}</p>
                </div>
                <div>
                  <p className="text-default-500">Department</p>
                  <p className="font-medium">{employeeData.department}</p>
                </div>
                <div>
                  <p className="text-default-500">Date of Birth</p>
                  <p className="font-medium">{employeeData.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-default-500">Date of Joining</p>
                  <p className="font-medium">{employeeData.dateOfJoining}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Phone className="text-primary" width={20} />
                <span>{employeeData.phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="text-primary" width={20} />
                <span>{employeeData.email}</span>
              </div>

              <div>
                <p className="text-default-500">Notes</p>
                <p>{employeeData.note}</p>
              </div>

              {employeeData.attachments &&
                employeeData.attachments.length > 0 && (
                  <div>
                    <p className="text-default-500">Documents</p>
                    <div className="space-y-1 mt-1">
                      {employeeData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <File className="text-primary" width={16} />
                          <span className="text-sm">Document {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <Card className="bg-red-50 border-none">
        <CardBody className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-default-500">Completed</p>
              <p className="text-2xl font-bold">
                {employeeData.stats.completed}
              </p>
            </div>
            <div>
              <p className="text-default-500">Ongoing</p>
              <p className="text-2xl font-bold">{employeeData.stats.ongoing}</p>
            </div>
            <div>
              <p className="text-default-500">Projects</p>
              <p className="text-2xl font-bold">
                {employeeData.stats.projects}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Projects */}
      <div>
        <h2 className="text-xl font-bold mb-4">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employeeData.projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              customer={project.customer}
              status={project.status}
              service={project.service}
              amount={project.amount}
              date={project.date}
              address={project.address}
              progress={project.progress}
              color={project.color}
            />
          ))}
        </div>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onOpenChange={handleModalClose}
        employeeData={{
          ...employeeData,
          originalData: employeeData.originalData,
        }}
        onSuccess={() => handleModalClose(true)}
      />
    </div>
  );
};

export default EmployeeDetail;
