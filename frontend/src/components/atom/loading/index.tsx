import { Loader2 } from "lucide-react";

interface LoadingProps {
  variant?: "default" | "centered";
}

const Loading: React.FC<LoadingProps> = ({ variant = "default" }) => {
  if (variant === "centered") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Loader2 size={48} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Loader2 size={48} className="animate-spin text-primary" />
    </div>
  );
};

export default Loading;