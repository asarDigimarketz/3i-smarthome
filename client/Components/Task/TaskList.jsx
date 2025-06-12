import { Card } from "@heroui/card";
import { Calendar, Circle, Clock, File } from "lucide-react";

const TaskList = () => {
  return (
    <>
      <TaskItem
        title="Electric Work"
        assignee="Arun R"
        status="new"
        startDate="28/03/2025"
        endDate="-"
      />
      <TaskItem
        title="Home Cinema Setup"
        assignee="Kamal N"
        status="inprogress"
        startDate="18/04/2025"
        endDate="19/04/2025"
        note="Interested in 5-seater Dolby setup"
        attachments={[
          {
            type: "image",
            url: "https://img.heroui.chat/image/furniture?w=50&h=50&u=1",
          },
          {
            type: "image",
            url: "https://img.heroui.chat/image/furniture?w=50&h=50&u=2",
          },
        ]}
        pdfAttachment="pro-987665.pdf"
      />
      <TaskItem
        title="Site Visit"
        assignee="Arun R"
        status="completed"
        startDate="04/03/2025"
        endDate="05/03/2025"
        note="Complete check and verify the site"
        attachments={[
          {
            type: "image",
            url: "https://img.heroui.chat/image/furniture?w=50&h=50&u=3",
          },
          {
            type: "image",
            url: "https://img.heroui.chat/image/furniture?w=50&h=50&u=4",
          },
        ]}
        pdfAttachment="pro-987665.pdf"
      />
    </>
  );
};

const TaskItem = ({
  title,
  assignee,
  status,
  startDate,
  endDate,
  note,
  attachments,
  pdfAttachment,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "new":
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
        );
      case "inprogress":
        return <Clock className="w-6 h-6 text-orange-500 mr-3" />;
      case "completed":
        return <Circle className="w-6 h-6 text-green-500 mr-3" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "new":
        return (
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
            New Task
          </span>
        );
      case "inprogress":
        return (
          <span className="bg-orange-200 text-orange-700 text-xs px-2 py-1 rounded-full">
            In progress
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full">
            Completed
          </span>
        );
    }
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex items-center mb-2">
          {getStatusIcon()}
          <div>
            <div className="flex items-center">
              <h4 className="font-medium mr-2">{title}</h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-500">Assignee: {assignee}</p>
          </div>
        </div>
        <div className="ml-9">
          {note && <p className="text-sm text-gray-500 mb-2">Note: {note}</p>}
          {(attachments || pdfAttachment) && (
            <>
              <p className="text-sm text-gray-500 mb-2">Attachment:</p>
              <div className="flex space-x-2 mb-2">
                {attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <img
                      src={attachment.url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {pdfAttachment && (
                  <div className="flex items-center text-blue-600">
                    <File className="mr-1" />
                    <span className="text-sm">{pdfAttachment}</span>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{attachments ? "Before" : ""}</span>
            <div className="flex items-center">
              <Calendar className="mr-1" />
              <span>Start Date: {startDate}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1" />
              <span>End Date: {endDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskList;
