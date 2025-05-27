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
import ClientJobs from "./ClientJobs/ClientJobs"

// Update the DashboardMetrics interface
interface DashboardMetrics {
  jobsThisYear: number
  jobsLast30Days: number
  upcomingCollections: number
  completedJobsThisYear: number
  recentJobs: any[]
  // Add new client metrics
  clientMetrics?: {
    lifetimeItemsRecycled: number
    carbonSavings: number
    jobsThisYear: number
    jobsLastYear: number
  }
}

export default function Dashboard() {
  const { user, refreshUserData, isInitialized } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    jobsThisYear: 0,
    jobsLast30Days: 0,
    upcomingCollections: 0,
    completedJobsThisYear: 0,
    recentJobs: []
  })

  // Add this effect to refresh user data when component mounts
  useEffect(() => {
    if (!user?.staffDetails?.role) {
      refreshUserData();
    }
  }, []);

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

  // Add this debug section to see what's happening with user data
  console.log('Dashboard user data:', {
    user,
    staffDetails: user?.staffDetails,
    role: user?.staffDetails?.role,
    roleName: user?.staffDetails?.role?.name,
    isInitialized
  });

  // If user data is not initialized yet, show loading state
  if (!isInitialized) {
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
          <div className="flex flex-1 flex-col items-center justify-center">
            <p>Loading dashboard...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
            
            {/* Client Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lifetime Items Recycled</CardTitle>
                  <PackageCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.clientMetrics?.lifetimeItemsRecycled || 312}</div>
                  <p className="text-xs text-muted-foreground">Total items recycled with us this year.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Carbon Savings</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-500">{metrics.clientMetrics?.carbonSavings?.toLocaleString() || '58,603'}</div>
                  <p className="text-xs text-muted-foreground">lbs CO₂ offset based on device weights and processing methods this year.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jobs Comparison</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.clientMetrics?.jobsThisYear || 10}</div>
                  <p className="text-xs text-muted-foreground">
                    vs {metrics.clientMetrics?.jobsLastYear || 6} last year.
                  </p>
                </CardContent>
              </Card>
            </div>

            <ClientJobs />
          </ClientOnly>

          
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
