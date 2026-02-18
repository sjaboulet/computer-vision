import { useEffect, useState } from "react";
import type { CandidateData } from "../types/types";
import { ArrowRight, Trash2 } from "lucide-react";
import { cn } from "../utils/utils";
import { useToast } from "../context/useToast";

interface HistoryProps {
  onSelectCandidate: (candidate: CandidateData) => void;
  isDarkMode: boolean;
}

export default function History({ onSelectCandidate, isDarkMode }: HistoryProps) {
  const [historyData, setHistoryData] = useState<CandidateData[]>([]);
  const { toast } = useToast();

  const fetchHistory = () => {
    fetch('http://127.0.0.1:8000/history')
      .then(res => res.json())
      .then(data => setHistoryData(data))
      .catch(err => console.error("Failed to load history", err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);


  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/history/${id}`, { method: 'DELETE' });
      if (res.ok) {

        setHistoryData(prev => prev.filter(c => c.id !== id));
      } else {
        toast("Error deleting candidate", "error");
      }
    } catch {
      toast("Server error", "error");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className={cn("text-3xl font-black font-mono uppercase border-b-4 mb-8 pb-2 inline-block", isDarkMode ? "border-white" : "border-black")}>
        Database Records
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {historyData.map((candidate) => (
          <div
            key={candidate.id}
            className={cn(
              "border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col cursor-pointer group relative",
              isDarkMode ? "bg-[#2a2a2a] text-white" : "bg-white text-black"
            )}
            onClick={() => onSelectCandidate(candidate)}
          >
            <button
              onClick={(e) => candidate.id && handleDelete(e, candidate.id)}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors z-10"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            <div className="flex justify-between items-start mb-4 pr-8">
              <h3 className="text-xl font-black font-mono truncate">{candidate.full_name}</h3>
              {candidate.score != null && (
                <span
                  className="ml-2 shrink-0 px-2 py-0.5 border-2 border-black font-black font-mono text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: candidate.score >= 70 ? '#bbf7d0' : candidate.score >= 40 ? '#fef08a' : '#fecaca' }}
                >
                  {candidate.score}
                </span>
              )}
            </div>

            <span className={cn("text-[10px] font-mono border border-black px-1 mb-2 self-start", isDarkMode ? "bg-gray-700" : "bg-gray-100")}>
              #{candidate.id} • {candidate.email}
            </span>

            <p className="font-mono text-xs opacity-60 mb-4 line-clamp-3 flex-1">
              {candidate.summary}
            </p>

            <button className={cn("mt-4 w-full border-2 border-black py-2 font-bold text-xs uppercase flex items-center justify-center gap-2 group-hover:bg-yellow-400 group-hover:text-black transition-colors", isDarkMode ? "bg-black text-white" : "bg-white")}>
              View Details <ArrowRight size={14} />
            </button>
          </div>
        ))}
        {historyData.length === 0 && <div className="text-gray-500 font-mono">No records found.</div>}
      </div>
    </div>
  );
}