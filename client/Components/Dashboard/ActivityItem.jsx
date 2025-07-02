import { Avatar } from "@heroui/avatar";

const ActivityItem = ({ id, type, description, time }) => {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-divider p-3">
      <Avatar
        color="primary"
        size="sm"
        icon={<span className="text-white text-xs">A</span>}
      />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {type} - {id}
          </span>
          <span className="text-xs text-default-500">{time}</span>
        </div>
        <span className="text-sm text-default-500">{description}</span>
      </div>
    </div>
  );
};

export default ActivityItem;
