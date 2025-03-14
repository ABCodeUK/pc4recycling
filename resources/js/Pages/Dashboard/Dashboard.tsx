import { AppSidebar } from "@/Components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/Components/ui/breadcrumb"
import { Separator } from "@/Components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/Components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { CalendarDays, ClipboardList, PackageCheck, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import UpcomingJobs from "./Jobs/UpcomingJobs"
import DriverJobs from "./DriverJobs/DriverJobs"
import { ClientOnly, StaffOnly, Role } from '@/Components/Auth/Can';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardMetrics {
  jobsThisYear: number
  jobsLast30Days: number
  upcomingCollections: number
  completedJobsThisYear: number
  recentJobs: any[]
}

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    jobsThisYear: 0,
    jobsLast30Days: 0,
    upcomingCollections: 0,
    completedJobsThisYear: 0,
    recentJobs: []
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/dashboard-metrics')
        setMetrics(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-8 w-100">
          <StaffOnly>
            <Role role="Developer|Administrator|Employee|Manager|Director">
            <h1 className="text-3xl font-semibold text-gray-800">Staff Dashboard</h1>
            </Role>
            <Role role="Drivers">
            <h1 className="text-3xl font-semibold text-gray-800">Driver Dashboard</h1>
            </Role>
            <Role role="Developer|Administrator|Employee|Manager|Director"> 
          {/* Metrics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs This Year</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.jobsThisYear}</div>
                <p className="text-xs text-muted-foreground">Jobs in <b>{new Date().getFullYear()}</b></p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Jobs</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.jobsLast30Days}</div>
                <p className="text-xs text-muted-foreground">Jobs in the last 30 days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Collections</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.upcomingCollections}</div>
                <p className="text-xs text-muted-foreground">Scheduled collections</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completedJobsThisYear}</div>
                <p className="text-xs text-muted-foreground">Completed in <b>{new Date().getFullYear()}</b></p>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Jobs Component */}
          <UpcomingJobs />
          </Role>
          <Role role="Drivers">
          {/* Driver Upcoming Jobs Component */}
          <DriverJobs />
          </Role>
          </StaffOnly>

          <ClientOnly>
            <h1 className="text-3xl font-semibold text-gray-800">Client Dashboard</h1>
          </ClientOnly>

          
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
