export interface User {
    id: string;
    name: string;
    role?: {
        id: string;
        name: string;
    };
}

export interface Thesis {
    id: string;
    title: string;
    author: User;
    advisor: User;
    co_advisor: User | null;
    defense_date: string;
    created_at: string;
    abstract: string;
    keywords: string;
    status: string;
}

export interface ThesisFilters {
    title?: string;
    author_name?: string;
    advisor_name?: string;
    co_advisor_name?: string;
    defense_date?: string;
    context?: string;
    order_by?: OrderByOption;
    page?: number;
    orientation?: 'ADVISOR' | 'COADVISOR';
}

export type OrderByOption =
    'BYAUTHORDESC' | 'BYAUTHORASC' |
    'BYADVISERDESC' | 'BYADVISERASC' |
    'BYDEFENSEDATEDESC' | 'BYDEFENSEDATEASC' |
    'BYTITLEASC' | 'BYTITLEDESC';

export interface ThesisListResponse {
    items: Thesis[];
    total: number;
    pages: number;
    current_page: number;
}


export interface PdfMetadata {
    info: {
        [key: string]: string;
    };
    size: number;
    pages: number;
}


export interface ThesisDetail {
    id: string;
    title: string;
    author: User;
    advisor: User;
    co_advisor: User | null;
    abstract: string;
    keywords: string;
    defense_date: string;
    status: string;
    pdf_file: string | null;
    pdf_metadata?: PdfMetadata;
    pdf_size?: number;
    pdf_pages?: number;
    pdf_uploaded_at?: string;
    created_by: User;
    created_at: string;
    updated_at: string;
}

