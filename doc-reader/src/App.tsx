import { BrainCircuit, CheckCircle, Eye, FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { cn } from "./utils/utils";
import { useCallback, useState } from "react";

interface ExtractedBlock {
  id: number;
  type: string;
  extraction_method: 'native' | 'ocr_tesseract';
  content: string;
  ui_color: string;
  coordinates: number[];
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ExtractedBlock[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isResultImage, setIsResultImage] = useState(false);

  const [formValues, setFormValues] = useState({
    full_name: '',
    email: '',
    phone: '',
    skills: '',
    summary: ''
  });

  const removeSkill = (skillName: string) => {
    setFormValues({
      ...formValues,
      skills: formValues.skills.filter((s: string) => s !== skillName)
    });
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsLoading(true);
    setData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Server error");

      const result = await response.json();

      if (result.status === "success") {
        setData(result.visual_data);
        setPreviewUrl(result.image_url);

        let finalSkills: string[] = [];
        const rawSkills = result.profile_data.skills;

        if (Array.isArray(rawSkills) && rawSkills.length > 0 && typeof rawSkills[0] === 'object') {
          finalSkills = rawSkills.flatMap((cat: any) => cat.items || []);
        }
        else if (Array.isArray(rawSkills)) {
          finalSkills = rawSkills;
        }
        else if (typeof rawSkills === 'string') {
          finalSkills = rawSkills.split(',').map(s => s.trim());
        }

        setFormValues({
          ...result.profile_data,
          skills: finalSkills
        });
      }
    } catch (error) {
      console.error(error);
      alert("An error occured while trying to contact the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setData(null);
      setIsResultImage(false);
    }
  }, []);

  const brutalButtonClass = "px-6 py-2 bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm";

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-black font-sans">
      <header className="bg-white border-b-2 border-black sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-1.5 rounded-sm">
              <BrainCircuit size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-tight uppercase">ATS Reader</h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#" className="hover:underline underline-offset-4">Analysis</a>
            <a href="#" className="hover:underline underline-offset-4">History</a>
            <a href="#" className="hover:underline underline-offset-4">Settings</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section aria-labelledby="upload-heading" className="mb-12">
          <h2 id="upload-heading" className="sr-only">Upload</h2>
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              "border-2 border-dashed border-black p-10 text-center transition-all duration-200 bg-white relative",
              file ? "bg-slate-50" : "hover:bg-slate-50"
            )}
          >
            {!file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Upload className="text-black" size={24} />
                </div>
                <div>
                  <p className="text-lg font-bold">Upload Document</p>
                  <p className="text-sm text-gray-500 mt-1">PDF format supported (Max 10MB)</p>
                </div>
                <label className={cn(brutalButtonClass, "cursor-pointer bg-white text-black hover:bg-gray-50")}>
                  Select File
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFile(e.target.files[0]);
                      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                      setData(null);
                    }
                  }} />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-300">
                <FileText size={48} strokeWidth={1.5} />
                <p className="text-lg font-bold">{file.name}</p>
                <button
                  onClick={handleProcess}
                  disabled={isLoading}
                  className={brutalButtonClass}
                >
                  {isLoading ? (
                    <><Loader2 className="animate-spin" size={16} /> Processing</>
                  ) : (
                    <>Start Extraction</>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {!data && previewUrl && (
          <div className="mb-12 animate-in fade-in duration-500">
            <iframe src={previewUrl} className="w-full max-w-2xl h-[600px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mx-auto" title="Initial PDF Preview" />
          </div>
        )}

        {data && (
          <section aria-labelledby="results-heading" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black">
              <h2 id="results-heading" className="text-xl font-bold flex items-center gap-2">
                <CheckCircle size={20} /> Extraction Report
              </h2>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-black bg-blue-300"></span> Structure
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-black bg-yellow-300"></span> Content
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 min-h-[800px]">
              <article className="bg-[#2a2a2a] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
                <div className="bg-black px-4 py-2 border-b border-white/20 flex items-center justify-between text-white text-xs font-mono uppercase">
                  <span className="flex items-center gap-2"><Eye size={14} /> Scanner_View</span>
                  <span className="opacity-50">Debug_Mode</span>
                </div>
                <div className="flex-1 relative overflow-auto p-8 flex items-center justify-center bg-[#202020]">
                  <div className="relative bg-white shadow-2xl max-w-full">
                    {isResultImage ? (
                      <img src={previewUrl!} className="w-[500px] border-none" alt="AI Analysis Result" />
                    ) : (
                      <iframe src={previewUrl!} className="w-[500px] h-[700px] border-none" title="PDF Preview" />
                    )}
                  </div>
                </div>
              </article>

              <article className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="bg-gray-100 px-4 py-2 border-b-2 border-black flex items-center justify-between text-black text-xs font-mono uppercase font-bold">
                  <span className="flex items-center gap-2"><Sparkles size={14} /> Smart_Application_Form</span>
                  <span>Auto-Filled</span>
                </div>

                <div className="flex-1 overflow-auto p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold font-mono uppercase bg-yellow-200 px-1 border border-black inline-block">Full Name</label>
                    <input
                      type="text"
                      value={formValues.full_name}
                      onChange={(e) => setFormValues({ ...formValues, full_name: e.target.value })}
                      className="w-full p-2 border-2 border-black font-mono text-sm focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold font-mono uppercase bg-blue-200 px-1 border border-black inline-block">Email</label>
                      <input
                        type="email"
                        value={formValues.email}
                        onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                        className="w-full p-2 border-2 border-black font-mono text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold font-mono uppercase bg-blue-200 px-1 border border-black inline-block">Phone</label>
                      <input
                        type="text"
                        value={formValues.phone}
                        onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                        className="w-full p-2 border-2 border-black font-mono text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold font-mono uppercase bg-purple-200 px-1 border border-black inline-block">AI Profile Summary</label>
                    <textarea
                      rows={4}
                      value={formValues.summary}
                      onChange={(e) => setFormValues({ ...formValues, summary: e.target.value })}
                      className="w-full p-2 border-2 border-black font-mono text-xs italic resize-none outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold font-mono uppercase bg-orange-200 px-1 border border-black inline-block">
                      Detected Skills
                    </label>

                    <div className="flex flex-wrap gap-2 p-4 border-2 border-black bg-white min-h-[60px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {(formValues.skills || []).length > 0 ? (
                        formValues.skills.map((skill: string, index: number) => (
                          <span
                            key={`${skill}-${index}`}
                            className="flex items-center gap-2 px-2 py-1 bg-white border-2 border-black text-xs font-bold font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 transition-colors group"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-gray-400 hover:text-red-600 font-black text-sm leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 font-mono text-xs italic">No skills detected...</span>
                      )}
                    </div>
                  </div>

                  <button className="w-full py-3 bg-black text-white font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_#93c5fd] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#93c5fd] active:translate-y-[4px] active:shadow-none transition-all">
                    Submit Candidate Data
                  </button>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}