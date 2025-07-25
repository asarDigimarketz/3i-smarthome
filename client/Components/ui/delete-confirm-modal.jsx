import { Modal, ModalContent, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { X } from "lucide-react";

export function DeleteConfirmModal({ isOpen, onClose, onDelete, submitting }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      placement="center"
      classNames={{
        base: "bg-white rounded-xl max-w-xs",
        header: "border-b-0",
        footer: "border-t-0",
      }}
    >
      <ModalContent>
        <div className="flex justify-center pt-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-6 h-6 text-brand-red" />
          </div>
        </div>

        <ModalBody className="text-center">
          <h3 className="text-xl font-semibold text-brand-red">
            Are You Sure want to Delete?
          </h3>
          <p className="text-gray-600 mt-2">
            Once delete it will be permanently delete from the database!
          </p>
        </ModalBody>

        <ModalFooter className="flex justify-center gap-4 pb-6">
          <Button
            color="primary"
            radius="sm"
            className="px-8"
            onPress={onDelete}
            isLoading={submitting}
            isDisabled={submitting}
          >
            Delete
          </Button>

          <Button
            variant="bordered"
            radius="sm"
            className="px-8"
            onPress={onClose}
            isDisabled={submitting}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
