import { useEffect, useState } from "react";
import { Separator } from "@/Components/ui/separator";
import { DataTable } from "./data-table";
import { clientJobColumns } from "./columns";
import { ClientJob } from "./columns";
import { Input } from "@/Components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/Components/ui/button";
import { Plus } from "lucide-react";

export default function ClientJobs({ parentId }: { parentId: number }) {
  const [data, setData] = useState<ClientJob[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`/customers/${parentId}/jobs`);
        setData(response.data);
      } catch (error) {
        toast.error("Failed to fetch jobs.");
      }
    };

    if (parentId) fetchJobs();
  }, [parentId]);

  const filteredData = data.filter(
    (item) =>
      item.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-white border shadow rounded-lg">
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">Manage Jobs</h3>
            <p className="text-sm text-muted-foreground">
              View and manage all jobs for this customer.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search Jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={() => window.location.href = `/collections/create?client_id=${parentId}`}>
              Add New Job
            </Button>
          </div>
        </div>
      </header>
      <Separator />
      <div className="p-6">
        <DataTable columns={clientJobColumns} data={filteredData} />
      </div>
    </section>
  );
}