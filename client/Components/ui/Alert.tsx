import React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "default" | "success" | "danger" | "warning" | "primary";
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", color = "default", icon, children, ...props }, ref) => {
    const colorClasses = {
      default: "bg-gray-50 text-gray-800 border-gray-200",
      success: "bg-green-50 text-green-800 border-green-200",
      danger: "bg-red-50 text-red-800 border-red-200",
      warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
      primary: "bg-blue-50 text-blue-800 border-blue-200",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative w-full rounded-lg border p-4 ${colorClasses[color]} ${className}`}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert }; 