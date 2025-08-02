"use client";
import { useEffect, useState } from "react";
import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Calendar, ChevronDown, Edit, File, Download, ChevronUp } from "lucide-react";
import apiClient from "../../lib/axios";
import { addToast } from "@heroui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import Link from "next/link";
import { usePermissions } from "../../lib/utils";

const ProjectDetails = ({ serviceFilter = "All" }) => {
  const { canView, canEdit } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Fetch projects with server-side filtering like Projects page
  const fetchProjects = async (filter = "All") => {
    try {
      setLoadingProjects(true);

      // Build query parameters like ProjectCards.jsx
      const buildQueryParams = () => {
        const params = [];

        // Add default status filter (new, in-progress, done) - excluding completed
        params.push(`status=${encodeURIComponent("new,in-progress,done")}`);

        if (filter && filter !== "All") {
          params.push(`service=${encodeURIComponent(filter)}`);
        }

        // Use a high limit to get all projects (API defaults to 6 without limit)
        params.push(`limit=9999`);

        return params.length ? `?${params.join("&")}` : "";
      };

      const query = buildQueryParams();
      const response = await apiClient.get(`/api/projects${query}`);

      if (response.data.success) {
        setProjects(response.data.data || []);
      } else {
        console.error("Failed to fetch projects:", response.data.message);
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch all projects for the dropdown
  useEffect(() => {
    fetchProjects(serviceFilter);
  }, [serviceFilter]);

  // Fetch selected project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get(`/api/projects/${projectId}`);

        if (response.data.success) {
          setProject(response.data.data);
        } else {
          addToast({
            title: "Error",
            description:
              response.data.message || "Failed to fetch project details",
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch project details",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Handle project selection change
  const handleProjectChange = (selectedId) => {
    if (selectedId) {
      router.push(`/dashboard/task?projectId=${selectedId}`);
    }
  };

  // Toggle minimize/expand project details
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Check if current project matches the service filter
  const shouldShowProject = () => {
    if (!project) return false;
    if (serviceFilter === "All") return true;
    return project.services === serviceFilter;
  };

  // Project selection dropdown
  const renderProjectSelector = () => (
    <div className="mb-4">
      <Select
        radius="md"
        key={projectId || "no-project"}
        label="Select Project"
        placeholder="Choose a project"
        selectedKeys={projectId ? [projectId] : []}
        onSelectionChange={(keys) => handleProjectChange(Array.from(keys)[0])}
        isLoading={loadingProjects}
        className="w-full"
        disabled={!canView("task")}
      >
        {projects && projects.length > 0 ? (
          projects.map((proj) => (
            <SelectItem
              key={proj._id}
              value={proj._id}
              radius="md"
              textValue={`${proj.customerName} - ${proj.services}${proj.projectAmount
                ? ` (${new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(proj.projectAmount)})`
                : ""
                }`}
            >
              {proj.customerName} - {proj.services}
              {proj.projectAmount
                ? ` (${new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(proj.projectAmount)})`
                : ""}
            </SelectItem>
          ))
        ) : (
          <SelectItem key="no-projects" isDisabled>
            {serviceFilter === "All"
              ? "No projects available"
              : `No ${serviceFilter} projects available`}
          </SelectItem>
        )}
      </Select>
    </div>
  );

  if (loading && projectId) {
    return (
      <Card className="bg-white">
        {renderProjectSelector()}
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="h-px bg-gray-200 my-4"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="mb-3">
                <div className="h-4 bg-gray-200 rounded mb-1 w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!project || !shouldShowProject()) {
    return (
      <div className="w-full">
        {renderProjectSelector()}
        <Card className="bg-white rounded-md">
          <div className="p-4 text-center">
            <h3 className="font-semibold">
              {!project
                ? "No Project Selected"
                : `No ${serviceFilter} Project Selected`}
            </h3>
            <p className="text-sm text-gray-500">
              {!project
                ? "Please select a project from the dropdown above"
                : `Please select a ${serviceFilter} project from the dropdown above`}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Format the amount with commas and currency symbol
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(project.projectAmount);

  return (
    <div className="w-full">
      {renderProjectSelector()}
      <div className="bg-[#F9E6E78A] p-2 sm:p-4 rounded-md">
        <div className="p-2 sm:p-4">
          {/* Header with Project Details text and Chevron button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="flex flex-col gap-1 sm:gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base sm:text-lg">Project Details</h3>
              </div>
            </div>
            <button
              onClick={toggleMinimize}
              className="hidden sm:flex items-center justify-center p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              {isMinimized ? (
                <ChevronDown className="text-gray-400 transition-transform duration-200" />
              ) : (
                <ChevronUp className="text-gray-400 transition-transform duration-200" />
              )}
            </button>
          </div>

          {/* Basic Info - Always Visible */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <DetailItem
              label="Customer"
              value={project.customerName || "Not specified"}
            />
            <DetailItem
              label="Service"
              value={project.services || "Not specified"}
            />
            <DetailItem
              label="Amount"
              value={formattedAmount || "Not specified"}
            />
            <DetailItem
              label="Status"
              value={project.projectStatus || "Not specified"}
            />
          </div>

          {/* Detailed Info - Only when expanded */}
          {!isMinimized && (
            <>
              <Divider className="my-4" />
              <div className="space-y-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DetailItem
                  label="Address"
                  value={project.fullAddress || "Not specified"}
                />
                <DetailItem
                  label="Email Id"
                  value={project.email || "Not specified"}
                />
                <DetailItem
                  label="Description"
                  value={project.projectDescription || "Not specified"}
                />
                <DetailItem label="Size" value={project.size || "Not specified"} />
                <DetailItem
                  label="Phone Number"
                  value={project.contactNumber || "Not specified"}
                />

                {/* Attachments (multiple, with preview UI) */}
                {Array.isArray(project.attachments) &&
                  project.attachments.length > 0 && (
                    <DetailItem
                      label={
                        project.attachments.length > 1
                          ? "Attachments"
                          : "Attachment"
                      }
                      value={
                        <div className="flex flex-col gap-2">
                          {project.attachments.map((att, idx) => (
                            <div
                              key={att._id || att.url || idx}
                              className="flex flex-col sm:flex-row items-center bg-[#E3F2FD] border border-gray-200 rounded px-3 py-2 gap-2 sm:gap-3 shadow-sm w-full max-w-full"
                            >
                              <File className="text-blue-500 w-5 h-5 flex-shrink-0" />
                              <span
                                className="truncate max-w-[120px] sm:max-w-xs font-medium break-words"
                                title={att.originalName || "Attachment"}
                              >
                                {att.originalName || "Attachment"}
                              </span>
                              <a
                                href={
                                  att.url && att.url.startsWith("http")
                                    ? att.url
                                    : `/${att.url}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.originalName || true}
                                className="ml-auto flex-shrink-0"
                              >
                                <Button
                                  size="xs"
                                  isIconOnly
                                  color="primary"
                                  variant="flat"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            </div>
                          ))}
                        </div>
                      }
                    />
                  )}

                <DetailItem
                  label="Date"
                  value={
                    <div className="flex items-center">
                      <Calendar className="mr-1 flex-shrink-0" />
                      <span>
                        {project.projectDate
                          ? new Date(project.projectDate).toLocaleDateString(
                            "en-GB"
                          )
                          : "Not specified"}
                      </span>
                    </div>
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="p-2 sm:p-4 flex justify-end ">
          <Link
            href={`/dashboard/projects/add-project?projectId=${project._id}`}
            disabled={!canEdit("projects")}
          >
            <Button className="bg-[#EAEAEA] rounded-lg p-2" size="xs" disabled={!canEdit("projects")}>
              <Edit className="text-[#6E6E6E] w-4 h-4 " />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="break-words">
    <span className="text-sm text-gray-500 block mb-1">{label}</span>
    <div className="text-sm font-medium break-words overflow-hidden">
      {typeof value === 'string' ? (
        <span className="break-all" title={value}>
          {value}
        </span>
      ) : (
        value
      )}
    </div>
  </div>
);

export default ProjectDetails;
