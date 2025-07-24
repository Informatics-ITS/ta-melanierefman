import { DocumentationProps } from "./dokumentasi";

export interface TentangProps {
  id: number;
  tentang: string;
  about: string;
  fokus_penelitian: string;
  research_focus: string;
  tujuan: string;
  purpose: string;
  address: string;
  phone: string;
  email: string;
  documentation: DocumentationProps[];
  created_at: string;
  updated_at: string;
}

export interface AboutResponse {
  message: string;
  about: TentangProps;
}