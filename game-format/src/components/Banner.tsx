import React, { useState } from "react";

interface BannerProps {
  message: string;
  type?: "warning" | "error" | "info" | "success";
  dismissible?: boolean;
  onDismiss?: () => void;
  showIcon?: boolean;
  className?: string;
  persistent?: boolean;
  position?: "top" | "bottom";
}

const Banner: React.FC<BannerProps> = ({
  message,
  type = "warning",
  dismissible = true,
  onDismiss,
  showIcon = true,
  className = "",
  persistent = false,
  position = "top",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible && !persistent) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "warning":
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
  };

  const getIcon = () => {
    const baseClass =
      "inline-flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0 rounded-full text-white font-bold text-xs";
    switch (type) {
      case "error":
        return <span className={`${baseClass} bg-red-500`}>✕</span>;
      case "success":
        return <span className={`${baseClass} bg-green-500`}>✓</span>;
      case "info":
        return <span className={`${baseClass} bg-blue-500`}>i</span>;
      case "warning":
      default:
        return <span className={`${baseClass} bg-yellow-500`}>!</span>;
    }
  };

  const positionStyles =
    position === "bottom"
      ? "fixed bottom-0 left-0 right-0 z-50"
      : "fixed top-0 left-0 right-0 z-50";

  return (
    <div
      className={`${positionStyles} ${getTypeStyles()} border-b px-4 py-3 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {showIcon && getIcon()}
          <p className="text-sm font-medium flex-1">{message}</p>
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200 text-lg font-bold"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Banner;
