"use client";

import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import General from "./General/General";
import EmailConfiguration from "./EmailConfiguration/EmailConfiguration";
import UserManagement from "./RolesResponsiblity/RolesResponsiblity.jsx";
import axios from "axios";
import DashboardHeader from "../header/DashboardHeader.jsx";
import React from "react";

export default function SettingsInterface() {
  const [selectedTab, setSelectedTab] = useState("general");

  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/settings/general`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
        if (response.data.success) {
          const hotelData = response.data.generalData;
          setHotelData(hotelData);
        } else {
          setError(response.data.message || "Failed to fetch hotel data.");
        }
      } catch (err) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00529C]"></div>
      </div>
    );
  if (error) return <p className="text-red-500 p-4 text-center">{error}</p>;

  const tabs = [
    { key: "general", title: "General" },
    { key: "email", title: "Email Configuration" },
    { key: "user-management", title: "User Management" },
    { key: "firebase", title: "Firebase Notification" }, // Added tab
  ];

  return (
    <section aria-label="3i smart home Settings" className="">
      <div className="px-4 lg:px-6 pt-6 pb-2 mb-6">
        <DashboardHeader
          title="Settings"
          description="Configure your system preferences"
        />
      </div>
      <nav
        aria-label="Settings Navigation"
        className="bg-primary rounded-lg overflow-x-auto shadow-sm mx-4 lg:mx-6 mb-2"
      >
        <div className=" mx-auto">
          <div className="flex flex-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={cn(
                  "px-4 lg:px-10 py-3 lg:py-4 text-sm font-medium transition-colors whitespace-nowrap",
                  selectedTab === tab.key
                    ? "bg-white text-primary font-[700] rounded-md m-[2px]"
                    : "text-white hover:bg-primary"
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div
        className="w-full mx-auto px-4 lg:px-6 pt-1 pb-8"
        role="tabpanel"
        aria-label="Settings Content Panel"
        aria-labelledby={`${selectedTab}-tab`}
      >
        <div className="">
          {selectedTab === "general" && (
            <General initialHotelData={hotelData} />
          )}
          {selectedTab === "email" && <EmailConfiguration />}
          {selectedTab === "user-management" && <UserManagement />}
          {selectedTab === "firebase" && (
            <React.Suspense
              fallback={<div>Loading Firebase Notification Setup...</div>}
            >
              {typeof window !== "undefined" &&
                (require("./FirebaseNotificationSetup.jsx").default
                  ? React.createElement(
                      require("./FirebaseNotificationSetup.jsx").default
                    )
                  : null)}
            </React.Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
