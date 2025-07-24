export interface MateriProps {
    id: number;
    user_id: number;
    judul: string;       
    title: string;
    type: "file" | "video";
    doc_type: "lecturer" | "guideline";
    file?: string;
    youtube_link?: string;
    kata_kunci?: string;
    keyword?: string;
    thumbnail?: string;
    created_at: string;
    updated_at: string;
}