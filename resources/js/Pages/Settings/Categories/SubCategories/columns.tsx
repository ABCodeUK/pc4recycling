import { ColumnDef } from "@tanstack/react-table";

export interface SubCategory {
  id: number;
  name: string;
  default_weight: string;
  parent_id: number;
}

export const subCategoryColumns: ColumnDef<SubCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "default_weight",
    header: "Default Weight",
    cell: (info) => `${info.getValue()} kg`,
  },
];