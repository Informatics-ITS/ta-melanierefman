import { PenelitianProps } from './penelitian';

interface PivotDoc {
  research_id: number;
  documentation_id: number;
  is_thumbnail: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentationProps {
  id: number;
  member_id: number | null;
  about_id: number | null;
  about_type: string | null;
  judul: string;
  title: string;
  type: string | null;
  image: string;
  youtube_link: string | null;
  keterangan: string;
  caption: string;
  created_at: string;
  updated_at: string;
  research: PenelitianProps[];
  research_id: string | null;
  pivot: PivotDoc;
}