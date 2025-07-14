"use client";

import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import General from "./General/General";
import EmailConfiguration from "./EmailConfiguration/EmailConfiguration";
import UserManagement from "./RolesResponsiblity/RolesResponsiblity.jsx";
import FirebaseNotificationSetup from "./FirebaseNotificationSetup";
import axios from "axios";

export default function HotelManagementInterface() {
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
    { key: "firebase-notifications", title: "Firebase Notifications" },
  ];

  return (
    <section
      aria-label="Hotel Management Settings"
      className="max-w-[1440px] mx-auto"
    >
      <nav
        aria-label="Settings Navigation"
        className="bg-primary rounded-lg overflow-x-auto shadow-sm mx-4 lg:mx-6 mb-2"
      >
        <div className="min-w-max lg:max-w-[70rem] mx-auto">
          <div className="flex flex-nowrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={cn(
                  "px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-colors whitespace-nowrap",
                  selectedTab === tab.key
                    ? "bg-white text-primary font-[700] rounded-t-lg mt-3"
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
          {selectedTab === "firebase-notifications" && <FirebaseNotificationSetup />}
        </div>
      </div>
    </section>
  );
}
