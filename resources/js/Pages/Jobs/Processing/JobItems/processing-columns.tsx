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
import { Category, JobItem } from "./types";
import axios from "axios";
import { toast } from "sonner";

interface CustomTableMeta extends TableMeta<JobItem> {
  setItems: (items: JobItem[]) => void;
  onExpandItem: (item: JobItem) => void;
  categories: Category[];
  isEditable: boolean;
}

export const processingColumns: ColumnDef<JobItem>[] = [
  {
    accessorKey: "item_number",
    header: "Item #",
    cell: ({ row }) => row.original.item_number
  },
  {
    accessorKey: "quantity",
    header: "Qty",
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
            row.original.category_id = parseInt(value);
            row.original.sub_category_id = null;
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
  {
    accessorKey: "processing_make",
    header: "Make",
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.processing_make || ""}
          onChange={(e) => {
            row.original.processing_make = e.target.value;
            meta?.setItems?.([...table.options.data]);
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
    accessorKey: "processing_specification",
    header: "Specification",
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.processing_specification || ""}
          onChange={(e) => {
            row.original.processing_specification = e.target.value;
            meta?.setItems?.([...table.options.data]);
          }}
          placeholder="Enter specification"
        />
      ) : (
        <span>{row.original.processing_specification || '-'}</span>
      );
    }
  },
  {
    accessorKey: "processing_erasure_required",
    header: "Erasure Required",
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
    id: "actions",
    header: ({ table }) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      return meta?.isEditable ? "Actions" : null;
    },
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
  }
];