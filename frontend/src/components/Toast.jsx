import React, { useEffect } from "react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 5000,
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-green-500",
      icon: "✓",
      iconBg: "bg-green-600",
    },
    error: {
      bg: "bg-red-500",
      icon: "✕",
      iconBg: "bg-red-600",
    },
    info: {
      bg: "bg-blue-500",
      icon: "ℹ",
      iconBg: "bg-blue-600",
    },
    warning: {
      bg: "bg-yellow-500",
      icon: "⚠",
      iconBg: "bg-yellow-600",
    },
  };

  const style = typeStyles[type] || typeStyles.success;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div
        className={`${style.bg} text-white rounded-lg shadow-2xl overflow-hidden max-w-md`}
      >
        <div className="flex items-start p-4">
          {/* Icon */}
          <div
            className={`${style.iconBg} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3`}
          >
            <span className="text-white font-bold text-lg">{style.icon}</span>
          </div>

          {/* Message */}
          <div className="flex-1 pt-0.5">
            <div className="font-medium text-sm leading-relaxed whitespace-pre-line">
              {message}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-black bg-opacity-20">
          <div
            className="h-full bg-white bg-opacity-30 animate-progress"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
