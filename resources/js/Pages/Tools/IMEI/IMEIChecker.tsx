import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

export default function IMEIChecker() {
  const [imei, setIMEI] = useState("");
  const [service, setService] = useState(""); // Service ID as input
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIMEICheck = async () => {
    if (!imei || !service) {
      toast.error("IMEI and Service are required.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/tools/imei-checker/check", {
        imei,
        service: parseInt(service, 10), // Ensure service ID is an integer
      });

      if (response.data) {
        setResult(response.data);
        toast.success("IMEI check successful!");
      }
    } catch (error: any) {
      console.error("IMEI Check Error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to check IMEI. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <h1 className="text-xl font-semibold text-gray-800">IMEI Checker</h1>
          <div className="ml-auto">
            <Badge variant={isLoading ? 'secondary' : result ? 'success' : 'destructive'}>
              {isLoading ? 'Loading...' : result ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
        </header>
        <div className="flex flex-col gap-6 p-8">
          <section className="bg-white border shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold leading-7 text-gray-900">
              Check IMEI Details
            </h2>
            <Separator className="my-4" />
            <div className="grid gap-4">
              <div>
                <Label htmlFor="imei">IMEI Number</Label>
                <Input
                  id="imei"
                  placeholder="Enter IMEI Number"
                  value={imei}
                  onChange={(e) => setIMEI(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="service">Service ID</Label>
                <Input
                  id="service"
                  placeholder="Enter Service ID"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                />
              </div>
              <Button
                onClick={handleIMEICheck}
                disabled={isLoading}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                {isLoading ? "Checking..." : "Check IMEI"}
              </Button>
            </div>
            {result && (
              <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                <h3 className="text-lg font-semibold">IMEI Check Result</h3>
                <pre className="mt-2 text-sm text-gray-700">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}