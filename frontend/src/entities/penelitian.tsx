import { DocumentationProps } from './dokumentasi';
import { ProgresPenelitianProps } from './progres-penelitian';
import { PublikasiProps } from './publikasi';

interface PartnerMember {
  id: number;
  partner_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface PartnerProps {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  partners_member: PartnerMember[];
}

interface Pivot {
  research_id: number;
  member_id: number;
  is_coor: number;
  created_at: string;
  updated_at: string;
}

interface MemberProps {
  id: number;
  name: string;
  role: string;
  is_head: number;
  email: string;
  phone: string;
  scopus_link: string;
  scholar_link: string;
  created_at: string;
  updated_at: string;
  judul_project: string | null;
  project_title: string | null;
  pivot: Pivot;
}  
  
export interface PenelitianProps {
    id: number;
    user_id: number;
    judul: string;
    title: string;
    deskripsi: string;
    description: string;
    map_link: string;
    latitude: string;
    longitude: string;
    zoom: string;
    start_month: string;
    start_year: number;
    end_month: string;
    end_year: number;
    start_date: string;
    end_date: string;
    coordinator_id: string;
    research_progress: ProgresPenelitianProps[];
    publication: PublikasiProps;
    partners: PartnerProps[];
    documentations: DocumentationProps[];
    members: MemberProps[];
    created_at: string;
    updated_at: string;
}