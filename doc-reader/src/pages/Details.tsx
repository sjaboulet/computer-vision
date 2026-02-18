import type { CandidateData } from "../types/types";
import { ArrowLeft, Mail, Phone, ThumbsUp, ThumbsDown } from "lucide-react";
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
          <div className="text-right flex flex-col items-end gap-2">
            <span className="text-xs font-mono text-gray-400">ID: {candidate.id}</span>
            {candidate.score != null && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-mono font-bold uppercase">Resume Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 border-2 border-black bg-gray-100 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${candidate.score}%`,
                        backgroundColor: candidate.score >= 70 ? '#22c55e' : candidate.score >= 40 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <span
                    className="px-2 py-0.5 border-2 border-black font-black font-mono text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: candidate.score >= 70 ? '#bbf7d0' : candidate.score >= 40 ? '#fef08a' : '#fecaca' }}
                  >
                    {candidate.score}/100
                  </span>
                </div>
              </div>
            )}
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

        {(candidate.pros?.length || candidate.cons?.length) ? (
          <div className="grid grid-cols-2 gap-6 mt-8 border-t-4 border-black pt-6">
            {candidate.pros?.length ? (
              <div>
                <h3 className="text-sm font-bold font-mono uppercase bg-green-200 inline-flex items-center gap-1 px-1 border border-black mb-3">
                  <ThumbsUp size={12} /> Strengths
                </h3>
                <ul className="space-y-2">
                  {candidate.pros.map((p, i) => (
                    <li key={i} className={cn("font-mono text-sm border-l-4 border-green-400 pl-3 py-0.5", isDarkMode ? "text-white" : "text-black")}>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {candidate.cons?.length ? (
              <div>
                <h3 className="text-sm font-bold font-mono uppercase bg-red-200 inline-flex items-center gap-1 px-1 border border-black mb-3">
                  <ThumbsDown size={12} /> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {candidate.cons.map((c, i) => (
                    <li key={i} className={cn("font-mono text-sm border-l-4 border-red-400 pl-3 py-0.5", isDarkMode ? "text-white" : "text-black")}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
