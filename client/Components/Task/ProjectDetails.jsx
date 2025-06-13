import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Calendar, ChevronDown, File } from "lucide-react";

const ProjectDetails = () => {
  return (
    <Card className="bg-red-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-semibold">Vinoth R</h3>
            <p className="text-sm text-gray-500">+91 98345 78341</p>
          </div>
          <ChevronDown className="text-gray-400" />
        </div>
        <p className="text-lg font-semibold mb-4">₹30,00,000</p>
        <Divider className="my-2" />
        <div className="space-y-2">
          <DetailItem
            label="Address"
            value="123/ss colony, Thirunager, Madurai-625018"
          />
          <DetailItem label="Email Id" value="vinoth@gmail.com" />
          <DetailItem
            label="Description"
            value="Full home automation system including lights"
          />
          <DetailItem label="Size" value="2200 X 3450 sqt" />
          <DetailItem label="Customer" value="Vinoth R" />
          <DetailItem label="Phone Number" value="+91 98345 78341" />
          <DetailItem label="Service" value="Home Cinema" />
          <DetailItem label="Amount" value="₹30,00,000" />
          <DetailItem
            label="Attachment"
            value={
              <div className="flex items-center text-blue-600">
                <File className="mr-1" />
                <span>pro-987665.pdf</span>
              </div>
            }
          />
          <DetailItem
            label="Date"
            value={
              <div className="flex items-center">
                <Calendar className="mr-1" />
                <span>26/05/2025</span>
              </div>
            }
          />
        </div>
      </div>
    </Card>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium block">{value}</span>
  </div>
);

export default ProjectDetails;
