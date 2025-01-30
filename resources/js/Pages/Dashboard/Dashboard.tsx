import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ClipboardList, PackageCheck, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import UpcomingJobs from "./Jobs/UpcomingJobs"

interface DashboardMetrics {
  jobsThisYear: number
  jobsLast30Days: number
  upcomingCollections: number
  completedJobsThisYear: number
  recentJobs: any[]
}

export default function Dashboard() {
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

        <div className="flex flex-1 flex-col gap-6 p-8">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
          
          {/* Metrics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs This Year</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.jobsThisYear}</div>
                <p className="text-xs text-muted-foreground">Total jobs in {new Date().getFullYear()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.jobsLast30Days}</div>
                <p className="text-xs text-muted-foreground">Jobs in the last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Collections</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
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
                <p className="text-xs text-muted-foreground">Completed this year</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Jobs Component */}
          <UpcomingJobs />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
