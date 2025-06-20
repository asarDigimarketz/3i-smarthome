import HotelManagementInterface from "../../../Components/Settings/HotelDetailsForm";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard requiredPermission="settings" requiredAction="view">
      <HotelManagementInterface />
    </PermissionGuard>
  );
}
