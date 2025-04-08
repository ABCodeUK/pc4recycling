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

// Add this type for the data status
export type ProcessingDataStatus = 
  | "Destroyed (Physical Destruction)"
  | "Wiped Aiken"
  | "Wiped Ziperase"
  | "No Erasure Required"
  | "Drive Removed by Client"
  | null;

// Update the JobItem interface
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
  processing_specification: { [key: string]: string } | null;
  processing_erasure_required: string | null;
  processing_data_status: ProcessingDataStatus;
  added: string | null;
  deleted_at?: string | null;
  original_item_number?: string;
  serial_number: string | null;  // Add new field
  asset_tag: string | null;      // Add new field
}

export interface Category {
  id: number;
  name: string;
  sub_categories: Array<{
    id: number;
    name: string;
    parent_id: number;
  }>;
  spec_fields: Array<{
    id: number;
    spec_name: string;
    spec_order: number;
    spec_default: boolean;
  }>;
}