import { Head } from "@inertiajs/react";
import { AppSidebar } from "@/Components/app-sidebar";
import { Progress } from "@/Components/ui/progress";
import { Leaf, Recycle, Trash2, Droplet, Zap, Plane, Cloud, Car, Smartphone, Home, Wind } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface Props {
  jobs?: Array<{
    id: string;
    date: string;
  }>;
  report?: {
    date: string;
    orderNumber: string;
    orderDate: string;
    materialSummary: {
      totalWeight: number;
      totalItems: number;
      recycledItems: number;
      reusedItems: number;
      repurposedItems: number;  // Add this property
    };
    reusedItems: Array<{
      type: string;
      quantity: number;
    }>;
    recycledItems: Array<{
      type: string;
      quantity: number;
    }>;
    repurposedItems: Array<{   // Add this property
      type: string;
      quantity: number;
    }>;
    carbonOffset: number;
    costSavings: number;
    equivalence: {
      waterConsumption: number;
      energySavings: number;
      planeTrips: number;
      ghgEmissions: number;
      smogFormation: number;
      milesDriven: number;
      homeElectricity: number;
      planeDistance: number;
    };
  };
}

export default function Sustainability({ report, jobs }: Props) {
  return (
    <SidebarProvider>
      <Head title="Sustainability Report" />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/sustainability">Sustainability</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-8">
          {/* Header Section with Job Selection */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Sustainability Report</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-muted-foreground">Select Job:</p>
                <Select 
                    defaultValue="J9999 - 24/05/2025 "
                    onValueChange={(value) => {
                        // TODO: Implement live data update instead of navigation
                        console.log('Selected job:', value);
                    }}
                >
                    <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                    <SelectContent>
                        {jobs?.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                                {job.id} - {new Date(job.date).toLocaleDateString()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Report as of</p>
              <p className="font-medium">{report?.date}</p>
              <p className="text-sm text-muted-foreground">Job Number: J9999</p>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-4">
            {/* Material Summary Card */}
            <Card className="bg-emerald-600 text-white">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-white text-lg">Material Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-emerald-100">Total Weight</p>
                    <p className="text-lg font-bold leading-tight">
                      {report?.materialSummary.totalWeight
                        ? `${(report.materialSummary.totalWeight * 0.4536).toFixed(1)} kg`
                        : '238.6 kg'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-100">Total Items</p>
                    <p className="text-lg font-bold leading-tight">{report?.materialSummary.totalItems || '312'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  <div>
                    <p className="text-xs text-emerald-100">Recycled</p>
                    <p className="text-base font-bold leading-tight text-emerald-200">{report?.materialSummary.recycledItems || '35'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-100">Reused</p>
                    <p className="text-base font-bold leading-tight text-emerald-200">{report?.materialSummary.reusedItems || '277'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-100">Repurposed</p>
                    <p className="text-base font-bold leading-tight text-emerald-200">{report?.materialSummary.repurposedItems || '15'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reused Items Card */}
            <Card>
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-lg">Reused (by qty)</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="relative h-24 flex items-center justify-center mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold leading-none">{report?.materialSummary.reusedItems || '277'}</div>
                    <div className="text-xs text-muted-foreground">TOTAL QTY</div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90%]">
                    <Progress value={90} className="h-1" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {report?.reusedItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Recycle className="h-4 w-4 text-blue-500" />
                        {item.type}
                      </span>
                      <span>{item.quantity}</span>
                    </div>
                  )) || (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-blue-500" />
                          Tablet
                        </span>
                        <span>271</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-blue-500" />
                          Monitor
                        </span>
                        <span>2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-blue-500" />
                          Notebook Computer
                        </span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-blue-500" />
                          Hard Disk Drive
                        </span>
                        <span>1</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recycled Items Card */}
            <Card>
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-lg">Recycled (by qty)</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="relative h-24 flex items-center justify-center mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold leading-none">{report?.materialSummary.recycledItems || '35'}</div>
                    <div className="text-xs text-muted-foreground">TOTAL QTY</div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[10%]">
                    <Progress value={10} className="h-1" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {report?.recycledItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Recycle className="h-4 w-4 text-green-500" />
                        {item.type}
                      </span>
                      <span>{item.quantity}</span>
                    </div>
                  )) || (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-green-500" />
                          Television
                        </span>
                        <span>5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-green-500" />
                          Tablet
                        </span>
                        <span>21</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-green-500" />
                          All In One
                        </span>
                        <span>1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-green-500" />
                          Monitor
                        </span>
                        <span>2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-green-500" />
                          Telephone
                        </span>
                        <span>4</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-green-500" />
                          Network and Communication
                        </span>
                        <span>2</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Repurposed Items Card */}
            <Card>
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-lg">Repurposed (by qty)</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="relative h-24 flex items-center justify-center mb-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold leading-none">{report?.materialSummary.repurposedItems || '15'}</div>
                    <div className="text-xs text-muted-foreground">TOTAL QTY</div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[15%]">
                    <Progress value={15} className="h-1" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {report?.repurposedItems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <Recycle className="h-4 w-4 text-purple-500" />
                        {item.type}
                      </span>
                      <span>{item.quantity}</span>
                    </div>
                  )) || (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-purple-500" />
                          Laptop Parts
                        </span>
                        <span>8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-purple-500" />
                          Desktop Parts
                        </span>
                        <span>5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <Recycle className="h-4 w-4 text-purple-500" />
                          Server Components
                        </span>
                        <span>2</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Carbon Offset Card */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-500" />
                  Carbon Lbs Offset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">
                  {report?.carbonOffset?.toLocaleString() || '2,843'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Based on device weights and processing methods</p>
              </CardContent>
            </Card>

            {/* Total Cost Savings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Total Cost Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  £{report?.costSavings?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>

            {/* Carbon Savings Details Card */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Carbon Savings Details</CardTitle>
                <CardDescription>Average Carbon Savings Per 1 kg for Different Processing Methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">Reusing<br/>(kg CO₂e saved per 1 kg)</th>
                        <th className="text-right p-2">Repurposing Parts<br/>(kg CO₂e saved per 1 kg)</th>
                        <th className="text-right p-2">Recycling<br/>(kg CO₂e saved per 1 kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Laptop</td>
                        <td className="text-right p-2">65</td>
                        <td className="text-right p-2">52.5</td>
                        <td className="text-right p-2">11.5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Desktop Computer</td>
                        <td className="text-right p-2">55</td>
                        <td className="text-right p-2">40</td>
                        <td className="text-right p-2">8</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Server</td>
                        <td className="text-right p-2">80</td>
                        <td className="text-right p-2">70</td>
                        <td className="text-right p-2">12.5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Monitor (TFT)</td>
                        <td className="text-right p-2">40</td>
                        <td className="text-right p-2">35</td>
                        <td className="text-right p-2">7.5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Smartphone</td>
                        <td className="text-right p-2">55</td>
                        <td className="text-right p-2">45</td>
                        <td className="text-right p-2">9.5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Network Switch</td>
                        <td className="text-right p-2">60</td>
                        <td className="text-right p-2">50</td>
                        <td className="text-right p-2">15</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>


            {/* Equivalence Conversions Card */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Equivalence Conversions</CardTitle>
                <CardDescription>Environmental impact equivalents of your recycling efforts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-8">
                  <div className="text-center">
                    <Droplet className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-500">
                      {report?.equivalence.waterConsumption?.toLocaleString() || '5,684'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Liters<br />Water Consumption
                    </div>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-500">
                      {report?.equivalence.energySavings?.toLocaleString() || '1,842'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      kWh<br />Energy Savings
                    </div>
                  </div>
                  <div className="text-center">
                    <Plane className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-500">
                      {report?.equivalence.planeDistance?.toLocaleString() || '15,240'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Miles<br />Flight Distance
                    </div>
                  </div>
                  <div className="text-center">
                    <Cloud className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-500">
                      {report?.equivalence.ghgEmissions?.toLocaleString() || '26.58'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tons<br />GHG Emissions
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-8 mt-8">
                  <div className="text-center">
                    <Car className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-500">
                      {report?.equivalence.milesDriven?.toLocaleString() || '152,368'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Miles<br />Car Travel Saved
                    </div>
                  </div>
                  <div className="text-center">
                    <Smartphone className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-indigo-500">
                      122,405
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Times<br />Phone Charges
                    </div>
                  </div>
                  <div className="text-center">
                    <Home className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-500">
                      {report?.equivalence.homeElectricity?.toLocaleString() || '8,760'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      kWh<br />Home Energy
                    </div>
                  </div>
                  <div className="text-center">
                    <Wind className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-teal-500">
                      {report?.equivalence.smogFormation?.toLocaleString() || '142.5'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Units<br />Smog Reduction
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}