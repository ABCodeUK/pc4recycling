import { useState } from "react";
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
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

interface Term {
  id: number;
  terms: string;
  created_at: string;
  updated_at: string;
}

export default function Terms({ terms }: { terms: Term[] }) {
  const [formData, setFormData] = useState({
    terms1: terms[0]?.terms || "",
    terms2: terms[1]?.terms || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quill editor modules/formats configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  const handleQuillChange = (value: string, editor: string) => {
    setFormData((prev) => ({ ...prev, [editor]: value }));
  };

  const handleSaveTerms1 = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`/settings/terms/${terms[0].id}`, {
        terms: formData.terms1,
      });

      if (response.status === 200) {
        toast.success("Ad-Hoc Terms & Conditions successfully updated!");
      } else {
        toast.error("Failed to update Ad-Hoc Terms & Conditions. Please try again.");
      }
    } catch (error) {
      toast.error("Error updating Ad-Hoc Terms & Conditions. Please check the logs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTerms2 = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`/settings/terms/${terms[1].id}`, {
        terms: formData.terms2,
      });

      if (response.status === 200) {
        toast.success("Contract Terms & Conditions successfully updated!");
      } else {
        toast.error("Failed to update Contract Terms & Conditions. Please try again.");
      }
    } catch (error) {
      toast.error("Error updating Contract Terms & Conditions. Please check the logs.");
    } finally {
      setIsSubmitting(false);
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
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/terms">Terms & Conditions</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <h1 className="text-3xl font-semibold">Terms & Conditions</h1>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Ad-Hoc Terms & Conditions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Edit the ad-hoc terms and conditions for one-time services.
                </p>
              </div>
            </header>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="editor-container">
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    value={formData.terms1}
                    onChange={(value) => handleQuillChange(value, 'terms1')}
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveTerms1} 
                disabled={isSubmitting}
                className="mt-12" // Add margin-top to account for Quill toolbar
              >
                Save Ad-Hoc Terms & Conditions
              </Button>
            </div>
          </section>

          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Contract Terms & Conditions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Edit the contract terms and conditions for ongoing service agreements.
                </p>
              </div>
            </header>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="editor-container">
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    value={formData.terms2}
                    onChange={(value) => handleQuillChange(value, 'terms2')}
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveTerms2} 
                disabled={isSubmitting}
                className="mt-12" // Add margin-top to account for Quill toolbar
              >
                Save Contract Terms & Conditions
              </Button>
            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}