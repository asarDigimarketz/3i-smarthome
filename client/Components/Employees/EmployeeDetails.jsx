"use client";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { ArrowLeft, Edit, File, Mail, Phone } from "lucide-react";
import ProjectCard from "../Dashboard/ProjectCard.jsx";
import { useState } from "react";
import { EmployeeModal } from "./EmployeeAddingOrEditModal";

const employeeData = {
  id: "EMP-001",
  name: "Arun R",
  role: "Installation Specialist",
  department: "Installation",
  dateOfBirth: "09/04/1996",
  dateOfJoining: "20/06/2023",
  phone: "+91 87541 486311",
  email: "vinoth@gmail.com",
  note: "All rounder -Installation, electrician, Service technician",
  attachments: ["aadhaar.pdf"],
  stats: {
    completed: 20,
    ongoing: 1,
    projects: 2,
  },
  projects: [
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
  ],
};

const EmployeeDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Employee Details</h1>
          <p className="text-default-500">Manage Customer List</p>
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
                src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
                className="w-32 h-32"
                alt={employeeData.name}
              />
              <h2 className="text-xl font-bold mt-4">{employeeData.name}</h2>
              <p className="text-default-500">{employeeData.role}</p>
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
                <p className="text-default-500">Note</p>
                <p>{employeeData.note}</p>
              </div>

              <div>
                <p className="text-default-500">Attachments</p>
                <div className="flex items-center gap-2 mt-1">
                  <File className="text-primary" width={16} />
                  <span className="text-sm">{employeeData.attachments[0]}</span>
                </div>
              </div>
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
              <p className="text-default-500">Project</p>
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
        onOpenChange={setIsModalOpen}
        employeeData={employeeData}
      />
    </div>
  );
};

export default EmployeeDetail;
