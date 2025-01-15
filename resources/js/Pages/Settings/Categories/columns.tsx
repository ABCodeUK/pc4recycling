import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface Category {
  id: number;
  name: string;
  default_weight: string;
  ewc_code: { id: number; ewc_code: string } | null;
  hp_codes: { id: number; hp_code: string; hp_type: string }[];
  spec_fields: { id: number; spec_name: string }[];
  physical_form: string | null;
  concentration: string | null;
  chemical_component: string | null;
  container_type: string | null;
}

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "default_weight",
    header: "Default Weight",
    cell: (info) => {
      const weight = info.getValue() as string;
      return `${weight} kg`; // Add "kg" suffix
    },
  },
  {
    accessorKey: "ewc_code",
    header: "EWC Code",
    cell: (info) => info.row.original.ewc_code?.ewc_code || "",
  },
  {
    accessorKey: "hp_codes",
    header: "HP Codes",
    cell: (info) =>
      info.row.original.hp_codes.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {info.row.original.hp_codes.map((hp) => (
            <Badge key={hp.id} variant="outline">
              {hp.hp_code}
            </Badge>
          ))}
        </div>
      ) : (
        ""
      ),
  },
  {
    accessorKey: "physical_form",
    header: "Physical Form",
    cell: (info) => info.getValue() || "",
  },
  {
    accessorKey: "concentration",
    header: "Concentration",
    cell: (info) => info.getValue() || "",
  },
  {
    accessorKey: "chemical_component",
    header: "Chemical Component",
    cell: (info) => info.getValue() || "",
  },
  {
    accessorKey: "container_type",
    header: "Container Type",
    cell: (info) => info.getValue() || "",
  },
];