import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined,
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              min-w-[300px] max-w-[400px]
              flex items-start gap-3
              p-4
              border-2 border-black
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              font-mono font-bold
              animate-in slide-in-from-right-full duration-300
              ${toast.type === "success" ? "bg-[#4ade80] text-black" : ""}
              ${toast.type === "error" ? "bg-[#f87171] text-black" : ""}
              ${toast.type === "info" ? "bg-[#60a5fa] text-black" : ""}
            `}
          >
            <div className="mt-0.5">
              {toast.type === "success" && <CheckCircle size={20} />}
              {toast.type === "error" && <AlertCircle size={20} />}
              {toast.type === "info" && <Info size={20} />}
            </div>
            <div className="flex-1 break-words">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="hover:opacity-60 transition-opacity"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
