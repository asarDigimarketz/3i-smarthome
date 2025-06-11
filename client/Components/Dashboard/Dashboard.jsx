"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ServiceCard from "./ServiceCard.jsx";
import ActivityItem from "./ActivityItem.jsx";
import ProjectCard from "./ProjectCard.jsx";
import { ChevronRight, ChevronDown, ArrowRight } from "lucide-react";

const serviceData = [
  {
    title: "Home Cinema",
    count: 2,
    color: "bg-blue-500",
    icon: "lucide:tv",
  },
  {
    title: "Home Automation",
    count: 1,
    color: "bg-cyan-600",
    icon: "lucide:home",
  },
  {
    title: "Security System",
    count: 1,
    color: "bg-teal-600",
    icon: "lucide:shield",
  },
  {
    title: "Outdoor Audio Solution",
    count: 0,
    color: "bg-pink-500",
    icon: "lucide:music",
  },
];

const performanceData = [
  {
    month: "Jan",
    "Home Cinema": 7,
    "Home Automation": 8,
    "Home Security": 2,
    "Outdoor Audio Solution": 1,
  },
  {
    month: "Feb",
    "Home Cinema": 5,
    "Home Automation": 6,
    "Home Security": 3,
    "Outdoor Audio Solution": 3,
  },
  {
    month: "Mar",
    "Home Cinema": 11,
    "Home Automation": 4,
    "Home Security": 6,
    "Outdoor Audio Solution": 9,
  },
  {
    month: "Apr",
    "Home Cinema": 7,
    "Home Automation": 3,
    "Home Security": 2,
    "Outdoor Audio Solution": 1,
  },
  {
    month: "May",
    "Home Cinema": 11,
    "Home Automation": 6,
    "Home Security": 4,
    "Outdoor Audio Solution": 2,
  },
  {
    month: "Jun",
    "Home Cinema": 2,
    "Home Automation": 1,
    "Home Security": 1,
    "Outdoor Audio Solution": 0,
  },
];

const recentActivities = [
  {
    id: "PROJ01",
    type: "Project Status Changed",
    description: "#Arun- Site Visit - Completed",
    time: "10:30 AM",
  },
  {
    id: "PROJ05",
    type: "New Project Created",
    description: "#Admin- Home Automation Project Created",
    time: "09:45 AM",
  },
  {
    id: "PROJ03",
    type: "Project Status Changed",
    description: "#Bala-Has been marked as Complete",
    time: "09:15 AM",
  },
  {
    id: "PROJ03",
    type: "Project Status Changed",
    description: "#Bala-Has been marked as Complete",
    time: "09:15 AM",
  },
];

const recentProjects = [
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
    customer: "Vaisu K",
    status: "InProgress",
    service: "Security System",
    amount: "₹26,00,000",
    date: "18/05/2025",
    address: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
    progress: "2/5",
    color: "bg-teal-600",
  },
  {
    id: "3",
    customer: "Sanker A",
    status: "Complete",
    service: "Home Automation",
    amount: "₹20,00,000",
    date: "08/04/2025",
    address: "1A/67 Anbu nagar, Anna Nagar, Madurai-625018",
    progress: "3/3",
    color: "bg-cyan-600",
  },
  {
    id: "4",
    customer: "Anu J",
    status: "InProgress",
    service: "Home Cinema",
    amount: "₹32,00,000",
    date: "22/04/2025",
    address: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
    progress: "2/3",
    color: "bg-blue-500",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Service Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {serviceData.map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            count={service.count}
            color={service.color}
            icon={service.icon}
          />
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                Service Performance
              </h2>
              <Button
                variant="flat"
                size="sm"
                endContent={<ChevronDown className="text-gray-600" />}
              >
                Last 6 Month
              </Button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Home Cinema" fill="#3b82f6" />
                  <Bar dataKey="Home Automation" fill="#0891b2" />
                  <Bar dataKey="Home Security" fill="#0d9488" />
                  <Bar dataKey="Outdoor Audio Solution" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                Recent Activities
              </h2>
              <Button isIconOnly variant="light" size="sm">
                <ChevronRight />
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <ActivityItem
                  key={`${activity.id}-${index}`}
                  id={activity.id}
                  type={activity.type}
                  description={activity.description}
                  time={activity.time}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Projects</h2>
          <Button
            as={Link}
            href="/projects"
            variant="flat"
            color="primary"
            size="sm"
            endContent={<ArrowRight />}
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentProjects.map((project) => (
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
    </div>
  );
};

export default Dashboard;
