"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/Components/ui/sidebar";
import {
  IconClipboardCheck, // Proposal
  IconHome, // Dashboard
  IconPackage, // Customers
  IconUserCircle, // Settings
  IconUsersGroup, // Customers
  IconUser, // Employee
  IconCalendar, // Tasks
  IconBell, // Notification
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// import { MdOutlineSettings } from "react-icons/md";
// import { BiBookContent } from "react-icons/bi";

import "./sidebarr.css";

import { motion } from "framer-motion";
import apiClient from "../../lib/axios";

export function SidebarDemo() {
  const { data: session } = useSession();
  const [hotelData, setHotelData] = useState(null);
  const [visibleLinks, setVisibleLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/settings/general`);
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

  // All possible navigation links
  const allLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      permission: "dashboard",
      icon: (
        <IconHome className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Proposal",
      href: "/dashboard/proposal",
      permission: "proposals",
      icon: (
        <IconClipboardCheck className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Projects",
      href: "/dashboard/projects",
      permission: "projects",
      icon: (
        <IconPackage className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Task",
      href: "/dashboard/task",
      permission: "tasks",
      icon: (
        <IconCalendar className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Customers",
      href: "/dashboard/customers",
      permission: "customers",
      icon: (
        <IconUsersGroup className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Employee",
      href: "/dashboard/employees",
      permission: "employees",
      icon: (
        <IconUser className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Notification",
      href: "/dashboard/notification",
      permission: "notification",
      icon: (
        <IconBell className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      permission: "settings",
      icon: (
        <IconUserCircle className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />

      ),
    },
  ];

  // Filter links based on user permissions
  useEffect(() => {
    const filterLinks = () => {
      if (!session?.user) {
        setVisibleLinks([]);
        return;
      }

      // Hotel admin has access to all links
      if (!session.user.isEmployee) {
        setVisibleLinks(allLinks);
        return;
      }

      // Filter links based on employee permissions
      const permissions = session.user.permissions || [];
      const filteredLinks = allLinks.filter((link) => {
        // Dashboard is always visible for authenticated users
        if (link.permission === "dashboard") {
          return true;
        }

        // Check if user has view permission for this module
        const permission = permissions.find(
          (p) => p.page?.toLowerCase() === link.permission.toLowerCase()
        );
        return permission?.actions?.view || false;
      });

      setVisibleLinks(filteredLinks);
    };

    filterLinks();
  }, [session]);

  const [open, setOpen] = useState(true);

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className={cn(
        " flex flex-col bg-white dark:bg-neutral-800 max-w-[200px] overflow-hidden h-screen sidebarmain"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col flex-1 overflow-y-auto"
          >
            {open ? (
              <Logo hotelData={hotelData} />
            ) : (
              <LogoIcon hotelData={hotelData} />
            )}
            <div className="mt-8 flex flex-col gap-2">
              {visibleLinks.map((link, idx) => (
                <motion.div
                  key={`${link.permission}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <SidebarLink link={link} />
                </motion.div>
              ))}

              {/* Show message if no links are visible */}
              {visibleLinks.length === 0 && session?.user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-2 text-sm text-gray-500 text-center"
                >
                  No accessible modules
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* User info section
          {session?.user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">
                    {(session.user.name || session.user.firstName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                {open && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session.user.name || session.user.firstName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session.user.isEmployee ? "Employee" : "Admin"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )} */}
        </SidebarBody>
      </Sidebar>
    </motion.div>
  );
}

export const Logo = ({ hotelData }) => {
  const logoUrl = hotelData?.logo || "/logo.png";

  return (
    <Link
      href={`/dashboard`}
      className="logo-container h-16 flex items-center px-4 transition-all duration-300"
    >
      <div className="logo-wrapper relative w-[160px] h-16">
        {/* Fixed height container with flexible width */}
        <div className="absolute inset-0 flex items-center justify-start">
          <Image
            src={logoUrl}
            alt="Hotel Logo"
            width={200}
            height={200}
            className="w-auto h-full max-w-full object-contain"
            priority
          />
        </div>
      </div>
    </Link>
  );
};

export const LogoIcon = ({ hotelData }) => {
  const logoUrl = hotelData?.logo || "/logo.png";

  return (
    <Link
      href={`/dashboard`}
      className="logo-container h-16 flex items-center justify-center transition-all duration-300"
    >
      <div className="logo-wrapper relative w-12 h-12">
        {/* Square container for collapsed state */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={logoUrl}
            alt="Hotel Logo"
            width={200}
            height={200}
            className="w-auto h-[32px] max-w-[32px] object-contain"
            priority
          />
        </div>
      </div>
    </Link>
  );
};
