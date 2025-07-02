import { Card, CardBody } from "@heroui/card";
import { Tv, Home, Shield, Music } from "lucide-react";

const iconMap = {
  "lucide:tv": Tv,
  "lucide:home": Home,
  "lucide:shield": Shield,
  "lucide:music": Music,
};

const ServiceCard = ({ title, count, color, icon }) => {
  const IconComponent = iconMap[icon] || Home;

  return (
    <Card className={`${color} text-white`}>
      <CardBody className="p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconComponent size={24} />
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">{count}</span>
            <span className="text-sm opacity-80">Projects</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ServiceCard;
