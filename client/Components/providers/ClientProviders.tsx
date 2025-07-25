'use client'

import { ClientSessionProvider } from "../auth/ClientSessionProvider"
import {ToastProvider} from "@heroui/toast";
import { AutoLogoutHandler } from "../auth/AutoLogoutHandler"
import { FCMProvider } from "./FCMProvider"
// import NavigationWrapper from "../layout/NavigationWrapper"

export default function ClientProviders({
  children
}: {
  children: React.ReactNode
}) {
  return (
      <ClientSessionProvider>
        <AutoLogoutHandler />
        <FCMProvider>
          <ToastProvider 
            placement="top-right"
            maxVisibleToasts={5}
            toastOffset={16}
            toastProps={{
              variant: "flat",
              radius: "sm",
              timeout: 2000,
              shouldShowTimeoutProgress: true,
              // classNames: {
              //   base: "bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg",
              //   content: "px-4 py-3",
              //   title: "text-gray-900 font-semibold text-sm",
              //   description: "text-gray-600 text-sm mt-1",
              //   closeButton: "text-gray-400 hover:text-gray-600 transition-colors",
              //   progressTrack: "bg-gray-200/50",
              //   progressIndicator: "bg-gradient-to-r from-blue-500 to-purple-600",
              //   icon: "text-lg"
              // }
            }}
            regionProps={{
              classNames: {
                base: "z-[9999]"
              }
            }}
          />
          {/* <NavigationWrapper> */}
            {children}
          {/* </NavigationWrapper> */}
        </FCMProvider>
      </ClientSessionProvider>
  )
}
