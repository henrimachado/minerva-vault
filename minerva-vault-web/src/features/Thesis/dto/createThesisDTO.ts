
export interface CreateThesisFormData {
    title: string;
    author_id: string;
    advisor_id: string;
    co_advisor_id?: string | null;
    abstract: string;
    keywords: string;
    defense_date: string;
    pdf_file: File | null;
}

export interface UpdateThesisFormData {
    title?: string;
    author_id?: string;
    advisor_id?: string;
    co_advisor_id?: string | null;
    abstract?: string;
    keywords?: string;
    defense_date?: string;
    pdf_file?: File;
    status?: string;
}