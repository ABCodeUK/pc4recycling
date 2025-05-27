"use client";

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

import { toast } from "sonner";
import axios from "axios";

// Import the JobItem and Category types
import { Category, JobItem } from "./types"; // Adjust the path as necessary

// Define a custom TableMeta type
interface CustomTableMeta extends TableMeta<JobItem> {
  setItems: (items: JobItem[]) => void;
  onExpandItem: (item: JobItem) => void;
  categories: Category[];
  isEditable: boolean;
}

// Remove the custom CellContext type definition since we're using the one from TanStack

export const jobItemColumns: ColumnDef<JobItem>[] = [
  {
    accessorKey: "item_number",
    header: "Item #",
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.item_number}
          readOnly
          className="w-24"
        />
      ) : (
        row.original.item_number
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      
      if (!isEditable) return row.original.quantity;

      return (
        <div className="flex items-center">
          <Input
            type="number"
            min={1}
            value={row.original.quantity}
            onChange={(e) => {
              row.original.quantity = parseInt(e.target.value);
              meta?.setItems?.([...table.options.data]);
            }}
            className="w-20"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => meta?.onExpandItem?.(row.original)}
            className="ml-2"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "category_id",
    header: "Category",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      const categories = meta?.categories ?? [];
      const category = categories.find((cat) => cat.id === row.original.category_id);
      
      return isEditable ? (
        <Select
          value={row.original.category_id?.toString()}
          onValueChange={(value) => {
            const newCategoryId = parseInt(value);
            row.original.category_id = newCategoryId;
            row.original.sub_category_id = null;
            
            // Find the selected category to get its default weight
            const selectedCategory = categories.find(cat => cat.id === newCategoryId);
            
            // Set the weight to the category's default weight
            if (selectedCategory?.default_weight) {
              row.original.weight = selectedCategory.default_weight;
            } else {
              row.original.weight = null;
            }
            
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
      ) : (
        <span>{category?.name || '-'}</span>
      );
    },
  },
  {
    accessorKey: "sub_category_id",
    header: "Sub Category",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      const categories = meta?.categories ?? [];
      const selectedCategory = categories.find((cat) => cat.id === row.original.category_id);
      const subCategory = selectedCategory?.sub_categories?.find((sub) => sub.id === row.original.sub_category_id);

      if (!selectedCategory?.sub_categories?.length) {
        return null;
      }

      return isEditable ? (
        <Select
          value={row.original.sub_category_id?.toString()}
          onValueChange={(value) => {
            const newSubCategoryId = parseInt(value);
            row.original.sub_category_id = newSubCategoryId;
            
            // Find the selected subcategory to get its default weight
            const selectedSubCategory = selectedCategory.sub_categories?.find(
              (sub) => sub.id === newSubCategoryId
            );
            
            // Update the weight with the subcategory's default weight
            if (selectedSubCategory?.default_weight) {
              row.original.weight = selectedSubCategory.default_weight;
            }
            
            meta?.setItems?.([...table.options.data]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sub-category" />
          </SelectTrigger>
          <SelectContent>
            {/* Fix the type issue with sub_categories.map */}
            {selectedCategory.sub_categories.map((subCat) => (
              <SelectItem key={subCat.id} value={subCat.id.toString()}>
                {subCat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span>{subCategory?.name || '-'}</span>
      );
    },
  },
  {
    accessorKey: "make",
    header: "Make",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.make || ""}
          onChange={(e) => {
            row.original.make = e.target.value;
            meta?.setItems?.([...table.options.data]);
          }}
          placeholder="Enter make"
        />
      ) : (
        <span>{row.original.make || '-'}</span>
      );
    },
  },
  {
    accessorKey: "model",
    header: "Model",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.model || ""}
          onChange={(e) => {
            row.original.model = e.target.value;
            meta?.setItems?.([...table.options.data]);
          }}
          placeholder="Enter model"
        />
      ) : (
        <span>{row.original.model || '-'}</span>
      );
    },
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
    },
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
    },
  },
  {
    accessorKey: "weight",
    header: "Weight (kg)",
    minSize: 100,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Input
          value={row.original.weight || ""}
          onChange={(e) => {
            row.original.weight = e.target.value;
            meta?.setItems?.([...table.options.data]);
          }}
          placeholder="Enter weight"
        />
      ) : (
        <span>{row.original.weight || '-'}</span>
      );
    }
  },
  {
    accessorKey: "erasure_required",
    header: "Erasure Required",
    minSize: 180,
    cell: ({ row, table }: CellContext<JobItem, unknown>) => {
      const meta = table.options.meta as CustomTableMeta | undefined;
      const isEditable = meta?.isEditable ?? false;
      return isEditable ? (
        <Select
          value={row.original.erasure_required || ''}
          onValueChange={(value) => {
            row.original.erasure_required = value as "Yes" | "No" | "N/A" | "Unknown";
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
        <span>{row.original.erasure_required || '-'}</span>
      );
    },
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
      if (!isEditable) return null;
      
      const isExistingItem = row.original.id > 0;
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
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
      );
    },
  }
];