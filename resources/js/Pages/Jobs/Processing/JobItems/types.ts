export interface SubCategory {
  id: number;
  name: string;
  parent_id: number;
}

export type ProcessingDataStatus = 
  | "Destroyed (Physical Destruction)"
  | "Wiped Aiken"
  | "Wiped Ziperase"
  | "No Erasure Required"
  | "Drive Removed by Client";

export interface SpecField {
  id: number;
  spec_name: string;
}

export interface Category {
  id: number;
  name: string;
  sub_categories: SubCategory[];
  spec_fields: SpecField[];
}

export interface JobItem {
  id: number;
  job_id: number;
  item_number: string;
  quantity: number;
  category_id: number | null;
  sub_category_id: number | null;
  // Legacy fields
  make: string | null;
  model: string | null;
  erasure_required: 'Yes' | 'No' | 'N/A' | 'Unknown' | null;
  specification: string | null;
  image_path: string | null;  // Add this field
  // New processing fields
  processing_make: string | null;
  processing_model: string | null;
  processing_specification: Record<string, string> | null;
  processing_erasure_required: string | null;
  processing_data_status: ProcessingDataStatus | null;
  serial_number: string | null;
  asset_tag: string | null;
  added: string;
  deleted_at?: string | null;
  original_item_number?: string;
}