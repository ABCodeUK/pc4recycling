"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  TableMeta,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

import { Button } from "@/Components/ui/button"; // Add this import
import { Maximize2 } from "lucide-react"; // Import the Maximize2 icon from lucide-react
import { Category, JobItem } from "./types"; // Adjust the path as necessary

interface EditableCellProps {
  isEditable: boolean;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({ isEditable, children }) => {
  if (!isEditable) {
    return <span className="py-2">{children}</span>;
  }
  return children;
};

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  meta: {
    categories: Category[];
    setItems: (items: TData[]) => void;
    onExpandItem: (item: TData) => void;
    isEditable: boolean;
    jobStatus?: string;
  };
  columnVisibility?: Record<string, boolean>;
}

export function DataTable<TData>({
  columns,
  data,
  meta,
  columnVisibility,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta,
    state: {
      columnVisibility: {
        processing_data_status: meta.jobStatus !== 'Received at Facility',
        item_status: meta.jobStatus !== 'Received at Facility',
        ...columnVisibility,
      },
    },
  });

  return (
    <div className="border rounded-lg">
      <div className="max-h-[80vh] overflow-auto rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 z-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <TableHead 
                    key={header.id}
                    style={{ 
                      width: header.column.columnDef.size,
                      minWidth: header.column.columnDef.minSize
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      style={{ 
                        width: cell.column.columnDef.size,
                        minWidth: cell.column.columnDef.minSize
                      }}
                    >
                      <EditableCell isEditable={meta.isEditable}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </EditableCell>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No items added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
