"use client";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { addToast } from "@heroui/toast";
import {
  ArrowLeft,
  Edit,
  File,
  Mail,
  MapPin,
  Phone,
  Trash,
} from "lucide-react";
import ProjectCard from "../Dashboard/ProjectCard.jsx";
import { useState, useEffect } from "react";
import { EmployeeModal } from "./EmployeeModal";
import { DeleteConfirmModal } from "../ui/delete-confirm-modal";
import { Pagination } from "@heroui/pagination";
import apiClient from "../../lib/axios";
import { usePermissions } from "../../lib/utils";

const EmployeeDetail = () => {
  const { canEdit, canDelete } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const employeeId = params?.employeeId;

  // Get return URL from search params or default to employees page
  const returnUrl = searchParams.get("returnUrl") || "/dashboard/employees";

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Handle employee deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await apiClient.delete(
        `/api/employeeManagement/${employeeId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete employee");
      }

      addToast({
        title: "Success",
        description: "Employee deleted successfully",
        type: "success",
      });

      // Navigate back to employees list
      router.push(returnUrl);
    } catch (error) {
      console.error("Error deleting employee:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Fetch employee data from API
  const fetchEmployeeData = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      // 1. Fetch employee details
      const response = await apiClient.get(
        `/api/employeeManagement/${employeeId}`
      );

      if (!response.data.success)
        throw new Error(
          response.data.message || "Failed to fetch employee data"
        );
      const emp = response.data.employee;

      // 2. Fetch projects assigned to this employee
      let projects = [];
      let completed = 0;
      let ongoing = 0;
      if (emp && emp._id) {
        const projectsRes = await apiClient.get(
          `/api/projects?assignedEmployees=${emp._id}`
        );
        if (projectsRes.data.success && Array.isArray(projectsRes.data.data)) {
          // Only include projects where assignedEmployees includes this employee
          projects = projectsRes.data.data
            .filter(
              (proj) =>
                Array.isArray(proj.assignedEmployees) &&
                proj.assignedEmployees.some((e) => e._id === emp._id)
            )
            .map((proj) => {
              // Determine status for stats
              const status = proj.projectStatus || "";
              if (
                ["complete", "completed", "done"].includes(status.toLowerCase())
              )
                completed++;
              else if (
                ["inprogress", "in-progress", "ongoing"].includes(
                  status.toLowerCase()
                )
              )
                ongoing++;
              return {
                id: proj._id || proj.id,
                customer:
                  proj.customerName || emp.firstName + " " + emp.lastName,
                status: proj.projectStatus || "N/A",
                service: proj.services || "N/A",
                amount: proj.projectAmount
                  ? `₹${proj.projectAmount.toLocaleString("en-IN")}`
                  : "N/A",
                date: proj.projectDate
                  ? new Date(proj.projectDate).toLocaleDateString("en-GB")
                  : "N/A",
                address:
                  proj.fullAddress ||
                  `${proj.address?.addressLine || ""} , ${
                    proj.address?.city || ""
                  } , ${proj.address?.district || ""} - ${
                    proj.address?.pincode || ""
                  }`,
                progress: `${proj.completedTasks || 0}/${proj.totalTasks || 0}`,
                color: getServiceColor(proj.services),
                assignedEmployees: proj.assignedEmployees || [],
              };
            });
        }
      }

      const transformedEmployee = {
        id: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        role: emp.role?.role || "N/A",
        department:
          typeof emp.department === "object" && emp.department !== null
            ? emp.department.name
            : emp.department || "N/A",
        dateOfBirth: emp.dateOfBirth
          ? new Date(emp.dateOfBirth).toLocaleDateString("en-GB")
          : "N/A",
        dateOfJoining: emp.dateOfHiring
          ? new Date(emp.dateOfHiring).toLocaleDateString("en-GB")
          : "N/A",
        phone: emp.mobileNo || "N/A",
        email: emp.email || "N/A",
        note: emp.notes || "No notes available",
        avatar: emp.avatar || ``,
        attachments: emp.documents || [],
        status: emp.status,
        stats: {
          completed: completed,
          ongoing: ongoing,
          projects: projects.length,
        },
        projects: projects,
        originalData: emp,
      };
      setEmployeeData(transformedEmployee);
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

  const getServiceColor = (service) => {
    switch (service) {
      case "Home Cinema":
        return "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]";
      case "Home Automation":
        return "bg-gradient-to-br from-[#026BB7] to-[#5DEAFF]";
      case "Security System":
        return "bg-gradient-to-br from-[#014C95] to-[#36B9F6]";
      case "Outdoor Audio Solution":
        return "bg-gradient-to-br from-[#DF2795] to-[#EB7AB7]";
      default:
        return "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]";
    }
  };

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
            href={returnUrl}
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
            href={returnUrl}
            variant="flat"
            startContent={<ArrowLeft />}
          >
            Back
          </Button>

          <Button
            color="primary"
            startContent={<Edit />}
            onPress={() => setIsModalOpen(true)}
            disabled={!canEdit("employees")}
          >
            Edit
          </Button>
          <Button
            color="primary"
            onPress={() => setIsDeleteModalOpen(true)}
            disabled={!canDelete("employees")}
            isIconOnly
          >
            <Trash />
          </Button>
        </div>
      </div>

      {/* Employee Profile */}
      <Card className="bg-white rounded-xl shadow-lg">
        <CardBody className="p-6">
          <div className="bg-[#F8F8F8] rounded-xl mb-6">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Avatar and Role */}
                <div className="flex flex-col items-center text-center md:w-1/4">
                  <Avatar
                    src={employeeData.avatar}
                    className="w-32 h-32"
                    alt={employeeData.name}
                  />
                  <h2 className="text-xl font-bold mt-4">
                    {employeeData.name}
                  </h2>
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
                {/* Divider between Avatar/Role and Details */}
                <div className="hidden md:flex justify-center items-stretch">
                  <Divider
                    orientation="vertical"
                    className="h-full mx-4 bg-[#E4E4E4] w-[2px]"
                  />
                </div>
                {/* Middle Column - Employee Details */}
                <div className="flex-1 space-y-4 md:w-2/5">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <p className="text-default-500">Employee ID</p>
                      <p className="font-medium">{employeeData.id}</p>
                    </div>
                    <div>
                      <p className="text-default-500">Department</p>
                      <p className="font-medium">
                        {typeof employeeData.department === "object" &&
                        employeeData.department !== null
                          ? employeeData.department.name
                          : employeeData.department || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-default-500">Date of Birth</p>
                      <p className="font-medium">{employeeData.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-default-500">Date of Joining</p>
                      <p className="font-medium">
                        {employeeData.dateOfJoining}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Phone className="text-primary" width={20} />
                      <span>{employeeData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="text-primary" width={20} />
                      <span>{employeeData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-primary" width={20} />
                      <span className="flex-1">
                        {employeeData.originalData?.address?.addressLine
                          ? employeeData.originalData.address.addressLine
                          : "N/A"}
                        {employeeData.originalData?.address?.city &&
                          `, ${employeeData.originalData.address.city}`}
                        {employeeData.originalData?.address?.district &&
                          `, ${employeeData.originalData.address.district}`}
                        {employeeData.originalData?.address?.state &&
                          `, ${employeeData.originalData.address.state}`}
                        {employeeData.originalData?.address?.country &&
                          `, ${employeeData.originalData.address.country}`}
                        {employeeData.originalData?.address?.pincode &&
                          ` - ${employeeData.originalData.address.pincode}`}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Divider between Details and Notes/Documents */}
                <div className="hidden md:flex justify-center items-stretch">
                  <Divider
                    orientation="vertical"
                    className="h-full mx-4 bg-[#E4E4E4] w-[2px]"
                  />
                </div>
                {/* Right Column - Notes and Documents */}
                <div className="flex-1 space-y-4 md:w-1/3">
                  <div>
                    <p className="text-default-500">Notes</p>
                    <p>{employeeData.note}</p>
                  </div>
                  {employeeData.attachments &&
                    employeeData.attachments.length > 0 && (
                      <div>
                        <p className="text-default-500">Documents</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {employeeData.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-[#E3F2FD] rounded px-2 py-1 shadow-sm"
                              style={{ minWidth: 0, maxWidth: 220 }}
                            >
                              {attachment.mimetype &&
                              attachment.mimetype.startsWith("image") ? (
                                <a
                                  href={
                                    attachment.url &&
                                    attachment.url.startsWith("http")
                                      ? attachment.url
                                      : `/${attachment.url}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={attachment.originalName || true}
                                  className="block w-10 h-10 rounded overflow-hidden mr-2 border border-gray-300"
                                >
                                  <img
                                    src={
                                      attachment.url &&
                                      attachment.url.startsWith("http")
                                        ? attachment.url
                                        : `/${attachment.url}`
                                    }
                                    alt={
                                      attachment.originalName ||
                                      `Document ${index + 1}`
                                    }
                                    className="object-cover w-full h-full"
                                  />
                                </a>
                              ) : (
                                <File
                                  className="text-primary mr-2"
                                  width={24}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <a
                                  href={
                                    attachment.url &&
                                    attachment.url.startsWith("http")
                                      ? attachment.url
                                      : `/${attachment.url}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={attachment.originalName || true}
                                  className="text-blue-600 hover:underline truncate block max-w-[120px]"
                                  title={
                                    attachment.originalName ||
                                    `Document ${index + 1}`
                                  }
                                >
                                  {attachment.originalName ||
                                    `Document ${index + 1}`}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="bg-[#C005091A] rounded-xl border-none mb-6">
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div
                  className={`cursor-pointer`}
                  onClick={() => setProjectFilter("completed")}
                >
                  <p className="text-default-500">Completed</p>
                  <p className="text-2xl font-bold">
                    {employeeData.stats.completed}
                  </p>
                </div>
                <div
                  className={`cursor-pointer`}
                  onClick={() => setProjectFilter("ongoing")}
                >
                  <p className="text-default-500">Ongoing</p>
                  <p className="text-2xl font-bold">
                    {employeeData.stats.ongoing}
                  </p>
                </div>
                <div
                  className={`cursor-pointer`}
                  onClick={() => setProjectFilter("all")}
                >
                  <p className="text-default-500">Projects</p>
                  <p className="text-2xl font-bold">
                    {employeeData.stats.projects}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-xl font-bold mb-4">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {employeeData.projects
                .filter((project) => {
                  if (projectFilter === "all") return true;
                  if (projectFilter === "completed") {
                    return ["complete", "completed", "done"].includes(
                      (project.status || "").toLowerCase()
                    );
                  }
                  if (projectFilter === "ongoing") {
                    return ["inprogress", "in-progress", "ongoing"].includes(
                      (project.status || "").toLowerCase()
                    );
                  }
                  return true;
                })
                .slice((page - 1) * pageSize, page * pageSize)
                .map((project) => (
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
                    assignedEmployees={project.assignedEmployees}
                  />
                ))}
            </div>
            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <Pagination
                total={
                  Math.ceil(
                    employeeData.projects.filter((project) => {
                      if (projectFilter === "all") return true;
                      if (projectFilter === "completed") {
                        return ["complete", "completed", "done"].includes(
                          (project.status || "").toLowerCase()
                        );
                      }
                      if (projectFilter === "ongoing") {
                        return [
                          "inprogress",
                          "in-progress",
                          "ongoing",
                        ].includes((project.status || "").toLowerCase());
                      }
                      return true;
                    }).length / pageSize
                  ) || 1
                }
                page={page}
                onChange={setPage}
                showControls
                color="primary"
                size="lg"
                className="mt-4"
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <EmployeeModal
        isOpen={isModalOpen}
        onOpenChange={handleModalClose}
        employeeData={{
          ...employeeData,
          originalData: employeeData.originalData,
        }}
        onSuccess={() => handleModalClose(true)}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        submitting={isDeleting}
        description={
          <div className="text-center">
            <h3 className="text-xl font-semibold text-brand-red">
              Delete Employee?
            </h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to delete {employeeData.name}?
              <br />
              This action cannot be undone.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default EmployeeDetail;
