import { PenelitianProps } from "./penelitian";

export interface MitraProps {
    id: number;
    name: string;
    partners_member: { id: number; name: string }[];
    research: PenelitianProps[];
    created_at: string;
    updated_at: string;
}