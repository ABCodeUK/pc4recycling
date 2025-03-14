export interface SubCategory {
  id: number;
  name: string;
  parent_id: number;
}

export interface Category {
  id: number;
  name: string;
  sub_categories: Array<{
    id: number;
    name: string;
    parent_id: number;
  }>;
}

export interface JobItem {
  id: number;
  job_id: number;
  item_number: string;
  quantity: number;
  category_id: number | null;
  sub_category_id: number | null;
  make: string | null;
  model: string | null;
  erasure_required: 'Yes' | 'No' | 'N/A' | 'Unknown' | null;
  specification: string | null;
  image_path: string | null;
  processing_make: string | null;
  processing_model: string | null;
  processing_specification: string | null;
  processing_erasure_required: string | null;
  added: string | null;
  deleted_at?: string | null;
}