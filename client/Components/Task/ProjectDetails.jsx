"use client";
import { useEffect, useState } from "react";
import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Calendar, ChevronDown, Edit, File, Download } from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import Link from "next/link";

const ProjectDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch all projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );

        if (response.data.success) {
          setProjects(response.data.data || []);
        } else {
          console.error("Failed to fetch projects:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch selected project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );

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
      >
        {projects && projects.length > 0 ? (
          projects.map((proj) => (
            <SelectItem
              key={proj._id}
              value={proj._id}
              radius="md"
              textValue={`${proj.customerName} - ${proj.services}${
                proj.projectAmount
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
            No projects available
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

  if (!project) {
    return (
      <div className="w-full">
        {renderProjectSelector()}
        <Card className="bg-white rounded-md">
          <div className="p-4 text-center">
            <h3 className="font-semibold">No Project Selected</h3>
            <p className="text-sm text-gray-500">
              Please select a project from the dropdown above
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
            <div className="flex flex-col gap-1 sm:gap-3">
              <h3 className="font-semibold text-base sm:text-lg items-center align-middle">
                {project.customerName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 items-center align-middle mt-1">
                {project.contactNumber}
              </p>
            </div>
            <ChevronDown className="text-gray-400 hidden sm:block" />
          </div>
          <p className="text-base sm:text-lg font-semibold mb-4">
            {formattedAmount}
          </p>
          <Divider className="my-2" />
          <div className="space-y-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
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
              label="Customer"
              value={project.customerName || "Not specified"}
            />
            <DetailItem
              label="Phone Number"
              value={project.contactNumber || "Not specified"}
            />
            <DetailItem
              label="Service"
              value={project.services || "Not specified"}
            />
            <DetailItem
              label="Amount"
              value={formattedAmount || "Not specified"}
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
                          <File className="text-blue-500 w-5 h-5" />
                          <span
                            className="truncate max-w-[120px] sm:max-w-xs font-medium"
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
                            className="ml-auto"
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
                  <Calendar className="mr-1" />
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
        </div>

        <div className="p-2 sm:p-4 flex justify-end ">
          <Link
            href={`/dashboard/projects/add-project?projectId=${project._id}`}
          >
            <Button className="bg-[#EAEAEA] rounded-lg p-2" size="xs">
              <Edit className="text-[#6E6E6E] w-4 h-4 " />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium block">{value}</span>
  </div>
);

export default ProjectDetails;
