export interface AnggotaProps {
  id: number;
  name: string;
  role: 'researcher' | 'postdoc' | 'research assistant' | 'student' | 'alumni';
  is_alumni: boolean | null;
  is_head: boolean | null;
  email: string | null;
  phone: string | null;
  scopus_link: string | null;
  scholar_link: string | null;
  members_education: { id: number; degree: string; major: string; university: string; member_id: number }[];
  members_expertise: { id: number; keahlian: string; expertise: string }[];
  documentation: { id: number; image: string | null };
  research: { id: number; judul: string; title: string }[];
  judul_project: string | null;
  project_title: string | null;
  created_at: string;
  updated_at: string;
  image: string;
}