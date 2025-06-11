"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import ProjectCard from "../Dashboard/ProjectCard.jsx";
import { ArrowLeft, Edit2, Mail, MapPin, Phone, Plus } from "lucide-react";

const customerData = {
  id: "1",
  name: "Vinoth R",
  phone: "+91 94536 345357",
  email: "vinoth@gmail.com",
  address: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
  stats: {
    totalProjects: 2,
    totalSpent: "₹50,00,000",
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
    {
      id: "2",
      customer: "Vinoth R",
      status: "Completed",
      service: "Home Cinema",
      amount: "₹30,00,000",
      date: "26/05/2025",
      address: "123/ss colony, Thirunager, Madurai-625018",
      progress: "4/4",
      color: "bg-blue-500",
    },
  ],
};

const CustomerDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Customer Details</h1>
          <p className="text-default-500">Manage Customer List</p>
        </div>

        <div className="flex gap-2">
          <Button
            as={Link}
            href="/customers"
            variant="flat"
            startContent={<ArrowLeft />}
          >
            Back
          </Button>
          <Button color="primary" startContent={<Plus />}>
            Add
          </Button>
        </div>
      </div>

      {/* Customer Info */}
      <Card className="bg-red-50 border-none">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h2 className="text-2xl font-bold">{customerData.name}</h2>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="text-primary" width={18} />
                  <span>{customerData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="text-primary" width={18} />
                  <span>{customerData.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-primary mt-1" width={18} />
                  <span>{customerData.address}</span>
                </div>
              </div>
            </div>

            <Button isIconOnly variant="light" className="self-start">
              <Edit2 width={18} />
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-50 border-none">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-default-500">Total Projects</p>
            <p className="text-3xl font-bold">
              {customerData.stats.totalProjects}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-gray-50 border-none">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-default-500">Total amount Spent</p>
            <p className="text-3xl font-bold">
              {customerData.stats.totalSpent}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customerData.projects.map((project) => (
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
  );
};

export default CustomerDetail;
