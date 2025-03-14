import { useEffect, useState } from "react";
import { Separator } from "@/Components/ui/separator";
import { DataTable } from "./data-table";
// Change this import to match the correct case
import { driverJobColumns, DriverJob } from "./Columns";
import { Input } from "@/Components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardFooter } from "@/Components/ui/card";
import { Eye, MapPin, Calendar, User, Package, Tag } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function DriverJobs() {
  const [data, setData] = useState<DriverJob[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/driver-jobs');
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
      item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.client?.name && item.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Postponed':
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Collected':
      case 'Processing':
      case 'Complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className="bg-white border shadow rounded-lg">
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold leading-7 text-gray-900">
              Your Assigned Collections
            </h2>
            <p className="text-sm text-muted-foreground">
              Collections assigned to you over the next 30 days.
            </p>
          </div>
        </div>
      </header>
      <Separator />
      <div className="p-6">
        {isDesktop ? (
          <DataTable 
            columns={driverJobColumns} 
            data={filteredData} 
          />
        ) : (
          <div className="grid gap-4">
            {filteredData.length > 0 ? (
              filteredData.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-primary">
                          <a 
                            href={`/collections/${job.id}`} 
                            className="hover:underline"
                          >
                            {job.job_id}
                          </a>
                        </h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.job_status)}`}>
                          {job.job_status}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="font-medium mb-2">{job.client?.name || "N/A"}</div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                        <span className="text-sm">{`${job.address}, ${job.town_city}, ${job.postcode}`}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {job.collection_date
                            ? new Date(job.collection_date).toLocaleDateString()
                            : "Not Scheduled"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{job.items_count} items</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/collections/${job.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No collections found
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}