'use client'

import { ClientSessionProvider } from "../auth/ClientSessionProvider"
import {ToastProvider} from "@heroui/toast";
import { AutoLogoutHandler } from "../auth/AutoLogoutHandler"
// import NavigationWrapper from "../layout/NavigationWrapper"

export default function ClientProviders({
  children
}: {
  children: React.ReactNode
}) {
  return (
      <ClientSessionProvider>
        <AutoLogoutHandler />
        <ToastProvider />
        {/* <NavigationWrapper> */}
          {children}
        {/* </NavigationWrapper> */}
      </ClientSessionProvider>
  )
}
