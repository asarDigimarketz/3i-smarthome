"use client";
import { Bell, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserDisplayName = () => {
    if (!session?.user) return "User";

    if (session.user.isEmployee === false) {
      return "Admin";
    }

    if (session.user.firstName) {
      return `${session.user.firstName} ${session.user.lastName || ""}`.trim();
    }

    return session.user.email?.split("@")[0] || "User";
  };

  return (
    <header
      className="w-full flex items-center justify-end"
      style={{
        background: "linear-gradient(356.27deg, #4E0E10 1.61%, #000000 77.8%)",
      }}
    >
      {/* Right Side - Notifications and User */}
      <div className="flex items-center space-x-2 md:space-x-4 mr-3">
        {/* Notification Bell */}
        <Button
          isIconOnly
          variant="light"
          size="lg"
          className="relative text-white hover:bg-white/10 transition-colors "
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          <span className="absolute -top-[2px] -right-1 h-4 w-4 md:h-5 md:w-5 bg-white rounded-full flex items-center justify-center p-2">
            <span className="text-xs text-primary font-medium">3</span>
          </span>
        </Button>

        {/* User Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              variant="light"
              className="flex items-center space-x-1 md:space-x-2 text-white hover:bg-white/10 px-2 md:px-3 py-2 transition-colors"
              size="lg"
            >
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm font-medium hidden sm:inline">
                {getUserDisplayName()}
              </span>
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu">
            <DropdownItem
              key="settings"
              startContent={<Settings className="h-4 w-4" />}
              onPress={() => router.push("/dashboard/settings")}
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="logout"
              className="text-danger"
              color="danger"
              startContent={<LogOut className="h-4 w-4" />}
              onPress={handleLogout}
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
