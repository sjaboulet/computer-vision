import React, { useState, useCallback } from 'react';
import { Upload, FileText, Eye, Sparkles, Loader2, Save, RotateCcw, Plus } from 'lucide-react';
import { cn } from "../utils/utils";
import type { ExtractedBlock, CandidateData } from "../types/types";
import { useToast } from "../context/useToast";

interface AnalyzerProps {
  isDarkMode: boolean;
}

export default function Analyzer({ isDarkMode }: AnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visualData, setVisualData] = useState<ExtractedBlock[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<CandidateData>({
    full_name: '',
    email: '',
    phone: '',
    summary: '',
    skills: []
  });

  const handleProcess = async () => {
    if (!file) return;
    setIsLoading(true);
    setVisualData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        setVisualData(result.visual_data);
        setPreviewUrl(`${result.image_url}?t=${new Date().getTime()}`);

        let finalSkills: string[] = [];
        const rawSkills = result.profile_data.skills;
        if (Array.isArray(rawSkills)) {
          finalSkills = rawSkills.flatMap((s: any) => (typeof s === 'object' ? (s.name || s.items || []) : s));
        } else if (typeof rawSkills === 'string') {
          finalSkills = rawSkills.split(',').map((s: string) => s.trim());
        }

        setFormValues({
          full_name: result.profile_data.full_name || '',
          email: result.profile_data.email || '',
          phone: result.profile_data.phone || '',
          skills: finalSkills,
          summary: result.profile_data.summary || ''
        });
      } else {
        toast(result.message, "error");
        if (result.message?.includes("not seem to be a Resume")) handleReset();
      }
    } catch (error) {
      console.error(error);
      toast("Backend error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      const res = await response.json();
      if (res.status === "success") {
        toast("Candidate saved to Database!", "success");
      }
    } catch {
      toast("Error saving to DB", "error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setVisualData(null);
    setPreviewUrl(null);
    setFormValues({ full_name: '', email: '', phone: '', summary: '', skills: [] });
  };

  const removeSkill = (s: string) => setFormValues({ ...formValues, skills: formValues.skills.filter(x => x !== s) });

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      setFormValues({ ...formValues, skills: [...formValues.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setVisualData(null);
    }
  }, []);

  const brutalButtonClass = cn(
    "px-6 py-2 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all flex items-center gap-2 text-sm disabled:opacity-50"
  );

  return (
    <div>
      {!visualData && (
        <section className="mb-12">
          <div
            onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
            className={cn("border-4 border-dashed rounded-none p-12 text-center transition-all bg-white relative", isDarkMode ? "border-gray-600 bg-[#252525]" : "border-black")}
          >
            {!file ? (
              <div className="flex flex-col items-center gap-6">
                <Upload size={48} className={isDarkMode ? "text-white" : "text-black"} />
                <p className={cn("text-xl font-black font-mono", isDarkMode ? "text-white" : "text-black")}>DROP PDF HERE</p>
                <label className={cn(brutalButtonClass, "cursor-pointer bg-black text-white")}>
                  Select File
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onDrop({ preventDefault: () => { }, dataTransfer: { files: e.target.files } } as any)} />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <FileText size={48} className={isDarkMode ? "text-white" : "text-black"} />
                <p className={cn("font-bold", isDarkMode ? "text-white" : "text-black")}>{file.name}</p>
                <div className="flex gap-4">
                  <button onClick={handleReset} className={cn(brutalButtonClass, "bg-red-500 text-white")}>Cancel</button>
                  <button onClick={handleProcess} disabled={isLoading} className={cn(brutalButtonClass, "bg-green-500 text-black")}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Start Analysis"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {visualData && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className={cn("flex justify-between items-center mb-6 border-b-4 pb-4", isDarkMode ? "border-gray-600" : "border-black")}>
            <h2 className="text-2xl font-black font-mono">EXTRACTION RESULT</h2>
            <div className="flex gap-3">
              <button onClick={handleReset} className={cn(brutalButtonClass, "bg-white text-black")}><RotateCcw size={16} /> Reset</button>
              <button onClick={handleSaveToDB} className={cn(brutalButtonClass, "bg-blue-400 text-black")}><Save size={16} /> Save to DB</button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 h-[800px]">
            <article className="bg-[#2a2a2a] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
              <div className="bg-black text-white px-4 py-2 font-mono text-xs flex justify-between">
                <span className="flex gap-2 items-center"><Eye size={14} /> VISION LAYER</span>
              </div>
              <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center bg-[#202020]">
                {previewUrl && <img src={previewUrl} className="max-w-full border-2 border-white/20" />}
              </div>
            </article>

            <article className={cn("border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col", isDarkMode ? "bg-[#2a2a2a]" : "bg-white")}>
              <div className="bg-yellow-400 text-black px-4 py-2 font-mono text-xs flex gap-2 items-center font-bold border-b-4 border-black">
                <Sparkles size={14} /> EXTRACTED DATA
              </div>
              <div className="flex-1 overflow-auto p-8 space-y-6">

                <div>
                  <label className="font-mono text-xs font-bold uppercase bg-yellow-200 text-black px-1 border border-black">Full Name</label>
                  <input
                    value={formValues.full_name}
                    onChange={e => setFormValues({ ...formValues, full_name: e.target.value })}
                    className={cn("w-full border-2 border-black p-2 font-bold font-mono text-lg mt-1", isDarkMode ? "bg-black text-white" : "bg-white")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs font-bold uppercase bg-blue-200 text-black px-1 border border-black">Email</label>
                    <input
                      value={formValues.email}
                      onChange={e => setFormValues({ ...formValues, email: e.target.value })}
                      className={cn("w-full border-2 border-black p-2 font-mono text-sm mt-1", isDarkMode ? "bg-black text-white" : "bg-white")}
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs font-bold uppercase bg-blue-200 text-black px-1 border border-black">Phone</label>
                    <input
                      value={formValues.phone}
                      onChange={e => setFormValues({ ...formValues, phone: e.target.value })}
                      className={cn("w-full border-2 border-black p-2 font-mono text-sm mt-1", isDarkMode ? "bg-black text-white" : "bg-white")}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs font-bold uppercase bg-purple-200 text-black px-1 border border-black">AI Summary</label>
                  <textarea
                    rows={4}
                    value={formValues.summary}
                    onChange={e => setFormValues({ ...formValues, summary: e.target.value })}
                    className={cn("w-full border-2 border-black p-2 font-mono text-sm mt-1 resize-none", isDarkMode ? "bg-black text-white" : "bg-white")}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end">
                    <label className="font-mono text-xs font-bold uppercase bg-orange-200 text-black px-1 border border-black">Skills</label>
                    <span className="text-[10px] font-mono opacity-50">Type & Enter to add</span>
                  </div>
                  <div className={cn("border-2 border-black p-4 mt-1 min-h-[100px]", isDarkMode ? "bg-black" : "bg-white")}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formValues.skills.map((skill, i) => (
                        <span key={i} className={cn("px-2 py-1 text-xs font-bold border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 group", isDarkMode ? "bg-[#333] text-white" : "bg-white text-black")}>
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-red-500 font-black">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <Plus size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={handleAddSkill}
                        placeholder="Add skill..."
                        className="w-full bg-transparent border-b border-dashed border-gray-500 pl-5 py-1 text-sm font-mono outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}