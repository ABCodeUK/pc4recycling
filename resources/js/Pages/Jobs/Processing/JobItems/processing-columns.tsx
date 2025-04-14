import { ColumnDef, TableMeta, CellContext } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Maximize2, Trash2 } from "lucide-react";
import { Category, JobItem, ProcessingDataStatus } from "./types";  // Add ProcessingDataStatus here
import axios from "axios";
import { toast } from "sonner";
import { Label } from "@/Components/ui/label";
import { useEffect, useRef, memo } from "react";

interface CustomTableMeta extends TableMeta<JobItem> {
  setItems: (items: JobItem[]) => void;
  onExpandItem: (item: JobItem) => void;
  categories: Category[];
  isEditable: boolean;
  jobStatus?: string;  // Add this
}

export const processingColumns: ColumnDef<JobItem>[] = [
  {
    id: "actions",
    header: ({ table }) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      return meta?.isEditable ? "Actions" : null;
    },
    minSize: 100,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      
      // Don't show actions for Collection items
      if (!isEditable || row.original.added === 'Collection') return null;

      return (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              const isExistingItem = row.original.id > 0;
              if (isExistingItem) {
                try {
                  await axios.delete(`/api/jobs/${row.original.job_id}/items/${row.original.id}`);
                  const items = [...table.options.data];
                  const index = items.indexOf(row.original);
                  items.splice(index, 1);
                  meta?.setItems?.([...items]);
                  toast.success("Item deleted successfully");
                } catch (error) {
                  console.error('Error deleting item:', error);
                  toast.error("Failed to delete item");
                }
              } else {
                const items = [...table.options.data];
                const index = items.indexOf(row.original);
                items.splice(index, 1);
                meta?.setItems?.([...items]);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  },
  {
    accessorKey: "item_number",
    header: "Item #",
    cell: ({ row }) => row.original.item_number,
    minSize: 120,
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    minSize: 150,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;

      if (!isEditable) {
        return <span>{row.original.quantity}</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={row.original.quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              row.original.quantity = newQuantity;
              meta?.setItems?.([...table.options.data]);
            }}
            className="w-20"
          />
          {row.original.quantity > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => meta?.onExpandItem?.(row.original)}
              title="Expand quantity into individual items"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "category_id",
    header: "Category",
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const categories = meta?.categories ?? [];
      const isEditable = meta?.isEditable ?? false;

      if (!isEditable) {
        const category = categories.find((cat) => cat.id === row.original.category_id);
        return <span>{category?.name || '-'}</span>;
      }

      return (
        <Select
          value={row.original.category_id?.toString() || ""}
          onValueChange={(value) => {
            // Reset related fields when category changes
            row.original.category_id = parseInt(value);
            row.original.sub_category_id = null;
            row.original.processing_specification = {}; // Reset specifications
            meta?.setItems?.([...table.options.data]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
  },
  {
    accessorKey: "sub_category_id",
    header: "Sub Category",
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const categories = meta?.categories ?? [];
      const isEditable = meta?.isEditable ?? false;

      const category = categories.find((cat) => cat.id === row.original.category_id);
      const subCategories = category?.sub_categories ?? [];

      // Don't render anything if no sub-categories are available
      if (subCategories.length === 0) {
        return null;
      }

      if (!isEditable) {
        const subCategory = subCategories.find((sub) => sub.id === row.original.sub_category_id);
        return <span>{subCategory?.name || '-'}</span>;
      }

      return (
        <Select
          value={row.original.sub_category_id?.toString() || ""}
          onValueChange={(value) => {
            row.original.sub_category_id = parseInt(value);
            meta?.setItems?.([...table.options.data]);
          }}
          disabled={!row.original.category_id}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sub-category" />
          </SelectTrigger>
          <SelectContent>
            {subCategories.map((subCategory) => (
              <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                {subCategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
  },
  // In the processing_make column
  {
    accessorKey: "processing_make",
    header: "Make",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.processing_make || ""}
          onChange={(e) => {
            const newData = table.options.data.map(item => ({
              ...item,
              processing_make: item === row.original ? e.target.value : item.processing_make
            }));
            meta?.setItems?.(newData);
          }}
          placeholder="Enter make"
        />
      ) : (
        <span>{row.original.processing_make || '-'}</span>
      );
    }
  },
  {
    accessorKey: "processing_model",
    header: "Model",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.processing_model || ""}
          onChange={(e) => {
            row.original.processing_model = e.target.value;
            meta?.setItems?.([...table.options.data]);
          }}
          placeholder="Enter model"
        />
      ) : (
        <span>{row.original.processing_model || '-'}</span>
      );
    }
  },
  {
    accessorKey: "serial_number",
    header: "Serial Number",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.serial_number || ""}
          onChange={(e) => {
            row.original.serial_number = e.target.value;
            meta?.setItems?.([...table.options.data]);
          }}
          placeholder="Enter serial number"
        />
      ) : (
        <span>{row.original.serial_number || '-'}</span>
      );
    }
  },
  {
    accessorKey: "asset_tag",
    header: "Asset Tag",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.asset_tag || ""}
          onChange={(e) => {
            row.original.asset_tag = e.target.value;
            meta?.setItems?.([...table.options.data]);
          }}
          placeholder="Enter asset tag"
        />
      ) : (
        <span>{row.original.asset_tag || '-'}</span>
      );
    }
  },
  {
    accessorKey: "processing_erasure_required",
    header: "Erasure Required",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Select
          value={row.original.processing_erasure_required || ''}
          onValueChange={(value) => {
            row.original.processing_erasure_required = value;
            meta?.setItems?.([...table.options.data]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yes">Yes</SelectItem>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="N/A">N/A</SelectItem>
            <SelectItem value="Unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <span>{row.original.processing_erasure_required || '-'}</span>
      );
    }
  },
  {
    accessorKey: "processing_data_status",
    header: ({ table }) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      return ['Processing', 'Received at Facility', 'Completed'].includes(meta?.jobStatus || '') ? "Data Status" : null;
    },
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      const jobStatus = meta?.jobStatus;

      if (!['Processing','Received at Facility', 'Completed'].includes(jobStatus || '')) {
        return null;
      }
      
      // In the processing_data_status column
      return isEditable ? (
        <Select
          value={row.original.processing_data_status || ''}
          onValueChange={(value: string) => {
            row.original.processing_data_status = value as ProcessingDataStatus;
            meta?.setItems?.([...table.options.data]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Destroyed (Physical Destruction)">Destroyed (Physical Destruction)</SelectItem>
            <SelectItem value="Wiped Aiken">Wiped Aiken</SelectItem>
            <SelectItem value="Wiped Ziperase">Wiped Ziperase</SelectItem>
            <SelectItem value="No Erasure Required">No Erasure Required</SelectItem>
            <SelectItem value="Drive Removed by Client">Drive Removed by Client</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <span>{row.original.processing_data_status || '-'}</span>
      );
    }
  },
  {
    accessorKey: "processing_specification",
    header: "Specifications",
    minSize: 800,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      const categories = meta?.categories ?? [];
      
      // Find the current category and its spec fields
      const category = categories.find(cat => cat.id === row.original.category_id);
      const specFields = category?.spec_fields ?? [];
      
      // Parse the specification JSON if it's a string
      if (typeof row.original.processing_specification === 'string') {
        try {
          row.original.processing_specification = JSON.parse(row.original.processing_specification);
        } catch (e) {
          row.original.processing_specification = {};
        }
      }

      if (!isEditable) {
        if (!row.original.processing_specification) return '-';
        return (
          <div className="space-y-1">
            {specFields.map(field => (
              <div key={field.id} className="text-sm">
                <span className="font-medium">{field.spec_name}:</span>{' '}
                {row.original.processing_specification?.[field.spec_name] || '-'}
              </div>
            ))}
          </div>
        );
      }

      if (!category || specFields.length === 0) {
        return <span className="text-muted-foreground"></span>;
      }

      // In the specifications cell
      return (
        <div className="flex flex-row gap-2">
          {specFields.map(field => (
            <div key={field.id} className="relative w-[250px]">
              <span 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground whitespace-nowrap pointer-events-none"
              >
                {field.spec_name}:
              </span>
              <Input
                value={row.original.processing_specification?.[field.spec_name] || ''}
                onChange={(e) => {
                  const newData = table.options.data.map(item => {
                    if (item === row.original) {
                      return {
                        ...item,
                        processing_specification: {
                          ...item.processing_specification,
                          [field.spec_name]: e.target.value
                        }
                      };
                    }
                    return item;
                  });
                  meta?.setItems?.(newData);
                }}
                className="h-9 w-full pl-[calc(1.5rem+var(--label-width))]"
                style={{ '--label-width': `${field.spec_name.length * 8}px` } as any}
              />
            </div>
          ))}
        </div>
      );
    }
  }
];