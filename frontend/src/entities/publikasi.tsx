export interface PublikasiProps {
    id: number;
    user_id: number;
    research_id: number | null;
    title: string;
    author: string;
    year: number;
    name_journal: string | null;
    volume: number | null;
    issue: number | null;
    page: string | null;
    DOI_link: string;
    article_link: string | null;
    image: string | null;
    created_at: string;
    updated_at: string;
}