import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { Typography } from "../../atom/typography";
import { Button } from "../../atom/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  showFooter?: boolean;
  confirmText?: string;
  cancelText?: string;
  sizeClass?: string;
  footerContent?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  showFooter = true,
  confirmText = "Confirm",
  cancelText = "Cancel",
  sizeClass = "md:w-1/3",
  footerContent,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />
      <div className="fixed inset-0 z-50 w-full flex items-center justify-center p-4">
        <DialogPanel
          className={`relative flex flex-col rounded-md bg-white text-left shadow-lg transition-all sm:my-8 ${sizeClass} max-h-[50vh] sm:max-h-[90vh]`}
        >
          <div className="flex justify-between items-center border-b px-6 py-3">
            <Typography type="paragraph" weight="semibold">
              {title}
            </Typography>
            <button
              onClick={onClose}
              className="text-typo-icon hover:text-typo focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4 flex-1 overflow-auto">
            {children ? (
              children
            ) : (
              <Typography
                type="body"
                font="dm-sans"
                weight="regular"
                className="text-typo-secondary"
              >
                {message}
              </Typography>
            )}
          </div>

          {showFooter && (
            <div className="px-6 pb-4 border-t pt-3 flex justify-end space-x-4">
              {footerContent ? (
                footerContent
              ) : (
                <>
                  <Button variant="outline2" onClick={onClose}>
                    {cancelText}
                  </Button>
                  {onConfirm && (
                    <Button variant="primary" onClick={onConfirm}>
                      {confirmText}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Modal;