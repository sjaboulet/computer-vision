export interface ExtractedBlock {
  id: number;
  type: string;
  extraction_method: "native" | "ocr_tesseract";
  content: string;
  ui_color: string;
  coordinates: number[];
}

export interface CandidateData {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  created_at?: string;
}
