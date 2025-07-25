import NotificationPage from "../../../Components/Notification/Notificatiom";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

const Notification = () => {
  return (
    <PermissionGuard requiredPermission="notifications" requiredAction="view">
      <NotificationPage />
    </PermissionGuard>
  );
};

export default Notification;
