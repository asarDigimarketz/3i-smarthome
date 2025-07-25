"use client";

import { Card, CardBody } from "@heroui/card";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { usePermissions } from "../../lib/utils";
import NotificationList from "./NotificationList";

const NotificationPage = () => {
  const { canView } = usePermissions();

  // Show access denied if no view permission
  if (!canView("notifications")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to view notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <DashboardHeader
        title="Notification"
        description="Manage all your notification"
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <NotificationList />
        </main>
      </div>
    </div>
  );
};

export default NotificationPage;
