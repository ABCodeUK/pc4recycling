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
import {
  Calendar,
  CalendarCurrentDate,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarYearView,
} from "@/Components/ui/full-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { router } from "@inertiajs/react";

interface Props {
  jobs?: {
    id: number;
    job_id: string;
    client_name: string;
    collection_date: string;
    job_status: string;
    url: string;
  }[];
}

export default function CalendarPage({ jobs = [] }: Props) {
  console.log('All jobs:', jobs); // Add this debug line

  const events = jobs.map(job => {
    let color: 'green' | 'orange' | 'red' | undefined;
    console.log('Job Status:', job.job_status); // Debug line

    switch (job.job_status) {
      case 'Scheduled':
        color = 'orange';
        break;
      case 'Postponed':
      case 'Cancelled':
        color = 'red';
        break;
      case 'Collected':
      case 'Processing':
      case 'Complete':
        color = 'green';
        break;
      default:
        color = undefined;
    }

    console.log('Color assigned:', color); // Debug line

    return {
      id: job.id.toString(),
      title: `${job.job_id} - ${job.client_name}`,
      start: new Date(job.collection_date),
      end: new Date(job.collection_date),
      color,
      url: `/collections/${job.id}`
    };
  });

  const handleEventClick = (event: any) => {
    if (event.url) {
      router.visit(event.url);
    }
  };

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
                <BreadcrumbLink href="#">Calendar</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-semibold text-gray-800">Calendar</div>
          </div>
          <section className="bg-white border shadow rounded-lg">
            <div className="p-6">
              <Calendar 
                events={events} 
                onEventClick={handleEventClick}
                view="month"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarPrevTrigger>
                      <ChevronLeft className="h-4 w-4" />
                    </CalendarPrevTrigger>
                    <CalendarCurrentDate />
                    <CalendarNextTrigger>
                      <ChevronRight className="h-4 w-4" />
                    </CalendarNextTrigger>
                    <CalendarTodayTrigger>Today</CalendarTodayTrigger>
                  </div>
                </div>
                <div className="mt-6 h-[calc(100vh-20rem)]">
                  <CalendarMonthView />
                </div>
              </Calendar>
            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}