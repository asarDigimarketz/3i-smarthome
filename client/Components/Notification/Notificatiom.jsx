"use client";

import DashboardHeader from "../header/DashboardHeader.jsx";
import NotificationList from "./NotificationList";

const NotificationPage = () => {



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
