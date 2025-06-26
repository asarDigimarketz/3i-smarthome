import React from "react";
import { Avatar } from "@heroui/avatar";

const NotificationItem = ({ title, description, time, avatar }) => {
  return (
    <div className="flex items-start mb-4 p-3 hover:bg-[#F5F5F5] rounded-lg transition-colors">
      <Avatar src={avatar} size="md" className="mr-3" />
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
};

export default NotificationItem;
