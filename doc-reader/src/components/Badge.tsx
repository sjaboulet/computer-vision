import { cn } from "../utils/utils";

export const Badge = ({ method }: { method: string }) => {
    const isNative = method === 'native';
    return (
        <span className={cn(
            "text-[10px] uppercase font-bold px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            isNative ? "bg-green-100 text-black" : "bg-orange-100 text-black"
        )}>
            {isNative ? 'PDF Layer' : 'OCR Layer'}
        </span>
    );
};