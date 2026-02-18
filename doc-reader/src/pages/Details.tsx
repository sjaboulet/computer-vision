import type { CandidateData } from "../types/types";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { cn } from "../utils/utils";

interface DetailsProps {
  candidate: CandidateData;
  onBack: () => void;
  isDarkMode: boolean;
}

export default function Details({ candidate, onBack, isDarkMode }: DetailsProps) {
  return (
    <div className="animate-in slide-in-from-right duration-300 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className={cn("mb-6 px-4 py-2 border-2 border-black font-bold font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2", isDarkMode ? "bg-white text-black" : "bg-white")}
      >
        <ArrowLeft size={16} /> Back to List
      </button>

      <div className={cn("border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8", isDarkMode ? "bg-[#2a2a2a]" : "bg-white")}>
        <div className="border-b-4 border-black pb-6 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black font-mono uppercase">{candidate.full_name}</h1>
            <div className="flex gap-4 mt-2 font-mono text-sm">
              <span className="flex items-center gap-2 bg-blue-200 text-black px-2 border border-black"><Mail size={14} /> {candidate.email}</span>
              <span className="flex items-center gap-2 bg-green-200 text-black px-2 border border-black"><Phone size={14} /> {candidate.phone}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-gray-400">ID: {candidate.id}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold font-mono uppercase bg-purple-200 inline-block px-1 border border-black mb-2">Professional Summary</h3>
          <p className="font-mono text-lg leading-relaxed border-l-4 border-gray-300 pl-4 italic">
            "{candidate.summary}"
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold font-mono uppercase bg-orange-200 inline-block px-1 border border-black mb-4">Skill Set</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills?.map((skill, i) => (
              <span key={i} className="px-3 py-1 border-2 border-black font-bold font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm bg-white text-black">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}