export interface ProgresPenelitianProps {
    id: number;
    research_id: number;
    judul_progres: string;
    title_progress: string;
    deskripsi?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    progress_images: ProgressImageProps[];
    progress_videos: ProgressVideoProps[];
    text_editors: TextEditorProps[];
    progress_maps: ProgressMapProps[];
}

export interface ProgressVideoProps {
    id: string;
    progress_research_id: number;
    youtube_link: string;
    index_order: number;
}

export interface ProgressMapProps {
    id: string;
    progress_research_id: number;
    map_link: string;
    latitude: string;
    longitude: string;
    zoom: string;
    index_order: number;
}

export interface TextEditorProps {
    id: string;
    progress_research_id: number;
    text_editor_id: string;
    text_editor_en: string;
    index_order: number;
}

export interface ProgressImageProps {
    id: string;
    progress_research_id: number;
    image: string | File;
    keterangan: string;
    caption: string;
    index_order: number;
}