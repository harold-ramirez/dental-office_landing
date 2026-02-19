import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: "success" | "error";
}

export default function Modal(props: Props) {
  const {
    title,
    message,
    buttonText = "Aceptar",
    onClose,
    type = "success",
  } = props;

  // Evitar scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm md:max-w-md shadow-2xl transform transition-all scale-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className={`p-4 border-b flex justify-between items-center ${type === "error" ? "bg-red-50" : "bg-green-50"}`}
        >
          <h2
            className={`font-bold text-xl ${type === "error" ? "text-red-600" : "text-green-600"}`}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Content */}
        <div className="p-6">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${type === "error" ? "bg-red-100" : "bg-green-100"}`}
          >
            {type === "error" ? (
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <p className="text-gray-600 text-center text-lg leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className={`w-full max-w-xs font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${
              type === "error"
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
                : "bg-green-500 hover:bg-green-600 text-white shadow-green-200"
            }`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
