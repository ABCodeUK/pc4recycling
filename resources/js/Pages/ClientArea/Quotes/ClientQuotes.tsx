import { useState, useEffect } from "react";
import { AppSidebar } from "@/Components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Job } from "./columns";
import { Eye } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { router } from '@inertiajs/react'; // Add this import

interface Props {
  jobs: Job[];
}

export default function ClientJobs({ jobs }: Props) {
  const [data, setData] = useState<Job[]>(jobs);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/my-quotes');
        setData(response.data.jobs);
      } catch (error) {
        toast.error("Failed to fetch jobs.");
      }
    };

    fetchJobs();
  }, []);

  const handleSearch = async (searchTerm: string) => {
    try {
      const response = await axios.get('/client-quotes/search', {
        params: { search: searchTerm }
      });
      setData(response.data);
    } catch (error) {
      toast.error("Failed to search quotes.");
    }
  };

  const handleRequestQuote = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Creating new quote...");
      
      const response = await axios.post('/my-quotes/request-quote');
      
      toast.dismiss(loadingToast);
      
      if (response.data.success) {
        toast.success("Quote created successfully");
        // Use router.visit instead of window.location for smoother navigation
        router.visit(response.data.redirect);
      } else {
        toast.error(response.data.message || "Failed to create quote");
      }
    } catch (error) {
      console.error("Error creating quote:", error);
      toast.error("Failed to create quote. Please try again.");
    }
  };

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        const job = row.original;
        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/my-quotes/${job.id}/`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/my-quotes">My Quotes</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">My Quotes</div>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Your Quotes
                </h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your quotes.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Collections..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  className="max-w-sm"
                />
                <Button onClick={handleRequestQuote}>
                  Request A Quote
                </Button>
              </div>
            </header>
            <Separator className="my-4" />
            <DataTable 
              columns={columnsWithActions} 
              data={data} 
            />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}