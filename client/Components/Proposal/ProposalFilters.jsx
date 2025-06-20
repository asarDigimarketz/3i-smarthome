"use client";
import { List, Speaker, Tv2, Cctv, HouseWifi } from "lucide-react";
import { useState } from "react";

const ProposalFilters = ({ onServiceChange }) => {
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
      activeColor: "bg-purple-50",
      iconColor: "text-purple-600",
      style: { color: "#5500FF" },
      backgroundColor: "#F3F3FF",
    },
    {
      icon: HouseWifi,
      label: "Home Automation",
      activeColor: "bg-blue-50",
      iconColor: "text-blue-600",
      style: { color: "#006BAD" },
      backgroundColor: "#EBFBFC",
    },
    {
      icon: Cctv,
      label: "Security System",
      activeColor: "bg-blue-50",
      iconColor: "text-blue-600",
      style: { color: "#006BAD" },
      backgroundColor: "#EBFBFC",
    },
    {
      icon: Speaker,
      label: "Outdoor Audio Solution",
      activeColor: "bg-pink-50",
      iconColor: "text-pink-600",
      style: { color: "#DB0A89" },
      backgroundColor: "#FEEFB8", // Light cream/yellow - exact from color palette
    },
  ];

  const handleFilterChange = (filterLabel) => {
    setActiveFilter(filterLabel);
    onServiceChange && onServiceChange(filterLabel);
  };

  return (
    <div className="w-full">
      <div className="flex bg-gray-50 rounded-full p-1 mx-4">
        {filters.map((filter, index) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.label;

          return (
            <div
              key={index}
              onClick={() => handleFilterChange(filter.label)}
              className={`flex-1 flex items-center justify-center py-3 px-4 cursor-pointer transition-all duration-200 rounded-full ${
                isActive ? `shadow-sm` : "hover:bg-white/50"
              }`}
              style={
                isActive && filter.backgroundColor
                  ? { backgroundColor: filter.backgroundColor }
                  : {}
              }
            >
              <Icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? filter.iconColor : "text-gray-400"
                }`}
                style={isActive && filter.style ? filter.style : {}}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalFilters;
