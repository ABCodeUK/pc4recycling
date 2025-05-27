import { Head } from "@inertiajs/react";
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
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { FileText } from "lucide-react";

interface Document {
  id: number;
  title: string;
  description: string; // Add this line
  url: string | null;
  dates: {
    issue_date: string | null;
    expiry_date: string | null;
  };
}

interface Props {
  documents: Document[];
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Permanent";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
};

const handleDocumentOpen = (url: string | null) => {
  if (url) {
    window.open(url, '_blank');
  }
};

export default function Information({ documents }: Props) {
  const sortedDocuments = [...documents].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <SidebarProvider>
      <Head title="Information" />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/information">Information</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-8">
          <h1 className="text-3xl font-semibold">Information</h1>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedDocuments.map((doc) => (
              <Card key={doc.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-center gap-2 pb-2">
                  <div className="bg-gray-100 rounded-full p-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <CardTitle className="text-center">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center flex-1">
                  <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                  <div className="flex items-center justify-center gap-3 w-full mb-4">
                    <p className="text-sm">Issue: {formatDate(doc.dates.issue_date)}</p>
                    <span className="text-gray-300">|</span>
                    <p className="text-sm">Expiry: {formatDate(doc.dates.expiry_date)}</p>
                  </div>
                  {doc.url && (
                    <Button
                      variant="outline"
                      className="w-full mt-auto"
                      onClick={() => handleDocumentOpen(doc.url)}
                    >
                      View Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}