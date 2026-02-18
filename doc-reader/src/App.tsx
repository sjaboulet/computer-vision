import { useState, useEffect } from 'react';
import { BrainCircuit, Sun, Moon, History as HistoryIcon, Search } from "lucide-react";
import { cn } from "./utils/utils";
import Analyzer from "./pages/Analyzer";
import History from "./pages/History";
import Details from "./pages/Details";
import type { CandidateData } from "./types/types";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [view, setView] = useState<'upload' | 'history' | 'details'>('upload');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className={cn("min-h-screen font-sans transition-colors duration-300", isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-[#f8f7f4] text-black")}>

      <header className={cn("border-b-2 border-black sticky top-0 z-20 transition-colors", isDarkMode ? "bg-[#2a2a2a]" : "bg-white")}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 border-2 border-black p-1.5 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight uppercase font-mono">ATS Reader</h1>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-bold font-mono">
              <button onClick={() => setView('upload')} className={cn("flex items-center gap-2 hover:text-yellow-500", view === 'upload' && "underline decoration-4 decoration-yellow-400")}>
                <Search size={16} /> Analyzer
              </button>
              <button onClick={() => setView('history')} className={cn("flex items-center gap-2 hover:text-yellow-500", (view === 'history' || view === 'details') && "underline decoration-4 decoration-yellow-400")}>
                <HistoryIcon size={16} /> Database
              </button>
            </nav>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 border-2 border-black rounded-full hover:bg-gray-200 bg-white text-black transition-transform active:scale-95">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className={cn(view === 'upload' ? "block" : "hidden")}>
          <Analyzer isDarkMode={isDarkMode} />
        </div>

        {view === 'history' && (
          <History
            isDarkMode={isDarkMode}
            onSelectCandidate={(c) => {
              setSelectedCandidate(c);
              setView('details');
            }}
          />
        )}

        {view === 'details' && selectedCandidate && (
          <Details
            candidate={selectedCandidate}
            isDarkMode={isDarkMode}
            onBack={() => setView('history')}
          />
        )}
      </main>
    </div>
  );
}