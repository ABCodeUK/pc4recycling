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
    header: "SubCategory Name",
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
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subCategory = row.original;
      return (
        <div className="flex justify-end space-x-2">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => {
              // Call edit handler here
              console.log(`Edit SubCategory ID: ${subCategory.id}`);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-500 hover:underline"
            onClick={() => {
              // Call delete handler here
              console.log(`Delete SubCategory ID: ${subCategory.id}`);
            }}
          >
            Delete
          </button>
        </div>
      );
    },
  },
];