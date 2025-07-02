import { Card, CardBody } from "@heroui/card";

import NotificationItem from "./NotificationItem";
import DashboardHeader from "../header/DashboardHeader.jsx";

const notifications = [
  {
    id: 1,
    title: "Project Status Changed - PROJ01",
    description: "#Arun- Site Visit - Completed",
    time: "10:30 AM",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=1",
  },
  {
    id: 2,
    title: "New Project Created - PROJ05",
    description: "#Admin- Home Automation Project Created",
    time: "09:45 AM",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=2",
  },
  {
    id: 3,
    title: "Project Status Changed - PROJ03",
    description: "#Beta-task1 Has been marked as Complete.",
    time: "09:15 AM",
    avatar: "https://img.heroui.chat/image/avatar?w=200&h=200&u=3",
  },
];

const NotificationPage = () => {
  return (
    <div className="  text-white">
      <DashboardHeader
        title="Notification"
        description="Manage all your notification"
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <Card className="bg-white rounded-lg shadow-lg">
            <CardBody>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} {...notification} />
              ))}
            </CardBody>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default NotificationPage;
