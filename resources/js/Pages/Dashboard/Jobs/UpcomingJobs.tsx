import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "./data-table";  // Using local data-table
import { clientJobColumns } from "./columns";
import { ClientJob } from "./columns";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function UpcomingJobs() {
  const [data, setData] = useState<ClientJob[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/upcoming-jobs');
        setData(response.data);
      } catch (error) {
        toast.error("Failed to fetch jobs.");
      }
    };

    fetchJobs();
  }, []);

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
            <h2 className="text-xl font-semibold leading-7 text-gray-900">
              Next 2 Weeks Collections
            </h2>
            <p className="text-sm text-muted-foreground">
              View scheduled collections for the next 14 days
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search Jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>
      </header>
      <Separator />
      <div className="p-6">
        <DataTable 
          columns={clientJobColumns} 
          data={filteredData.filter(job => 
            job.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )} 
        />
      </div>
    </section>
  );
}