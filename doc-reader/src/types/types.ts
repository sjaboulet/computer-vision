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
  score?: number | null;
  pros?: string[] | null;
  cons?: string[] | null;
  created_at?: string;
}
