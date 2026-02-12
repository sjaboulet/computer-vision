import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Eye, Code, BrainCircuit, Loader2, Badge } from 'lucide-react';
import { cn } from './utils/utils';

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

      if (!response.ok) {
        throw new Error("Server error");
      }

      const result = await response.json();

      if (result.status === "success") {
        setData(result.data)

        setPreviewUrl(`${result.image_url}?t=${new Date().getTime()}`);
      } else {
        alert("Error: " + result.message);
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

        <div>
          {previewUrl && !data ? (
            <iframe src={previewUrl} className="w-[500px] h-[700px] border-none mx-auto" title="PDF Preview" />
          ) : null}
        </div>

        {data && (
          <section aria-labelledby="results-heading" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-black">
              <h2 id="results-heading" className="text-xl font-bold flex items-center gap-2">
                <CheckCircle size={20} /> Analysis Report
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

            <div className="grid lg:grid-cols-2 gap-8 h-[800px]">

              <article className="bg-[#2a2a2a] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
                <div className="bg-black px-4 py-2 border-b border-white/20 flex items-center justify-between text-white text-xs font-mono">
                  <span className="flex items-center gap-2"><Eye size={14} /> DOCUMENT_PREVIEW</span>
                  <span className="opacity-50">READ_ONLY</span>
                </div>
                <div className="flex-1 relative overflow-auto p-8 flex items-center justify-center bg-[#202020]">
                  <div className="relative bg-white shadow-2xl max-w-full">
                    {previewUrl ? (
                      <iframe src={previewUrl} className="w-[500px] h-[700px] border-none" title="PDF Preview" />
                    ) : (
                      <div className="w-[400px] h-[600px] bg-white flex items-center justify-center font-mono text-sm">Preview Unavailable</div>
                    )}
                  </div>
                </div>
              </article>

              <article className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="bg-gray-100 px-4 py-2 border-b-2 border-black flex items-center justify-between text-black text-xs font-mono uppercase font-bold">
                  <span className="flex items-center gap-2"><Code size={14} /> EXTRACTED_DATA</span>
                  <span>JSON</span>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-4">
                  {data.map((block) => (
                    <div
                      key={block.id}
                      className="group p-4 border-2 border-black bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 border border-black text-black uppercase tracking-wide"
                          style={{ backgroundColor: block.type === 'Title' ? '#93c5fd' : block.type === 'Text' ? '#fde047' : '#fdba74' }}
                        >
                          {block.type}
                        </span>
                        <Badge method={block.extraction_method} />
                      </div>

                      <p className="text-sm font-mono leading-relaxed text-gray-800">
                        {block.content}
                      </p>

                      <div className="mt-3 pt-2 border-t border-gray-200 text-[10px] text-gray-400 font-mono">
                        Coordinates: {JSON.stringify(block.coordinates)}
                      </div>
                    </div>
                  ))}

                  {data.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <AlertCircle className="mb-2" size={32} />
                      <p className="font-mono text-sm">No data extracted.</p>
                    </div>
                  )}
                </div>
              </article>

            </div>
          </section>
        )}

      </main>
    </div>
  );
}