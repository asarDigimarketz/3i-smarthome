"use client";
import { List, Speaker, Tv2, Cctv, HouseWifi } from "lucide-react";
import { useState } from "react";

const ProposalFilters = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    {
      icon: List,
      label: "All",
      activeColor: "bg-red-50",
      iconColor: "text-red-500",
    },
    {
      icon: Tv2,
      label: "Home Cinema",
      activeColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },

    {
      icon: HouseWifi,
      label: "Home Automation",
      activeColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: Cctv,
      label: "Security System",
      activeColor: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      icon: Speaker,
      label: "Outdoor Audio",
      activeColor: "bg-pink-50",
      iconColor: "text-pink-500",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex bg-gray-50 rounded-full p-1 mx-4">
        {filters.map((filter, index) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.label;

          return (
            <div
              key={index}
              onClick={() => setActiveFilter(filter.label)}
              className={`flex-1 flex items-center justify-center py-3 px-4 cursor-pointer transition-all duration-200 rounded-full ${
                isActive
                  ? `${filter.activeColor} shadow-sm`
                  : "hover:bg-white/50"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? filter.iconColor : "text-gray-400"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalFilters;
