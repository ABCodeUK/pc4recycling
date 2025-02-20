import { ColumnDef } from "@tanstack/react-table";

export interface UserAddress {
  id: number;
  address: string;
  address_2: string;
  town_city: string;
  county: string;
  postcode: string;
  user_id: number;
  isDefault?: boolean; // Add a flag for default address
}

export const userAddressColumns: ColumnDef<UserAddress>[] = [
  {
    accessorKey: "address",
    header: "Address Line 1",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "address_2",
    header: "Address Line 2",
    cell: (info) => info.getValue() || "-", // Add fallback for empty values
  },
  {
    accessorKey: "town_city",
    header: "Town / City",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "county",
    header: "County",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "postcode",
    header: "Postcode",
    cell: (info) => info.getValue(),
  },
];