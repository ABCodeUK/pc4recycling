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
import { Input } from "@/Components/ui/input"; // Add this import
import { Edit, ArrowLeft } from "lucide-react";
import { useState } from "react"; // Add this for state management
import { toast } from "sonner";
import axios from "axios";
import { Upload, Trash2, FileText } from "lucide-react";

// Use the same Props interface as CollectionsEdit
interface Props {
  job: {
    id: number;
    job_id: string;
    client_id: number;
    collection_date: string;
    job_status: string;
    staff_collecting: string;
    vehicle: string;
    address: string;
    town_city: string;
    postcode: string;
    onsite_contact: string;
    onsite_number: string;
    onsite_email: string;
    collection_type: string;
    data_sanitisation: string;
    sla: string;
    instructions: string;
  };
  customers: { 
    id: number; 
    name: string;
    company_name?: string;
    address?: string;
    town_city?: string;
    county?: string;
    postcode?: string;
    contact_name?: string;
    position?: string;
    landline?: string;
    mobile?: string;
    email?: string;
    account_status?: string;
  }[];
  documents?: {
    collection_manifest: Document | null;
    hazard_waste_note: Document | null;
    data_destruction_certificate: Document | null;
    other: Document[];
  };
}

// Add interface for document type
interface Document {
  id: number;
  file_path: string;
  original_filename: string;
}

interface DocumentState {
  collection_manifest: Document | null;
  hazard_waste_note: Document | null;
  data_destruction_certificate: Document | null;
  other: Document[];
}

// Add this import
import { router } from '@inertiajs/react';

export default function CollectionsView({ job, customers, documents: initialDocuments }: Props) {
  // Initialize documents state with passed data
  const [documents, setDocuments] = useState<DocumentState>(initialDocuments || {
    collection_manifest: null,
    hazard_waste_note: null,
    data_destruction_certificate: null,
    other: []
  });

  // Remove the isUploading state since we won't use it anymore
  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File | null}>({
      collection_manifest: null,
      hazard_waste_note: null,
      data_destruction_certificate: null,
      other: null
  });
  
  // Update the handleFileUpload function
  const handleFileUpload = async (type: string) => {
      const file = selectedFiles[type];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', type);
  
      try {
          const response = await axios.post(`/collections/${job.id}/documents`, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
  
          if (response.data) {
              // Update the documents state with the response data
              if (type === 'other') {
                  setDocuments(prev => ({
                      ...prev,
                      other: [...prev.other, response.data.document]
                  }));
              } else {
                  setDocuments(prev => ({
                      ...prev,
                      [type]: response.data.document
                  }));
              }
              
              setSelectedFiles(prev => ({
                  ...prev,
                  [type]: null
              }));
              toast.success('Document uploaded successfully');
          }
      } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload document');
      }
  };
  
  // Add this function after the state declarations and before handleFileUpload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };
  
  // Remove these example button components that were in the middle of the file:
  // Update the upload buttons to remove loading state
  // Example for collection manifest (apply to all similar buttons):
  <Button
      variant="ghost"
      size="icon"
      onClick={() => handleFileUpload('collection_manifest')}
      disabled={!selectedFiles.collection_manifest}
  >
      <Upload className="h-4 w-4" />
  </Button>

  // Remove the standalone button component that's in the middle of the file
  
  const handleDeleteDocument = (documentId: number, type: string) => {
    router.delete(`/collections/${job.id}/documents/${documentId}`, {
      preserveScroll: true,
      onSuccess: () => {
        if (type === 'other') {
          // For 'other' documents, filter out the deleted document
          setDocuments(prev => ({
            ...prev,
            other: prev.other.filter(doc => doc.id !== documentId)
          }));
        } else {
          // For single documents, set to null
          setDocuments(prev => ({
            ...prev,
            [type]: null
          }));
        }
        toast.success('Document deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete document');
      }
    });
  };

  // Find the current customer
  const currentCustomer = customers.find(c => c.id === job.client_id);

  // Format the collection date
  const formattedDate = job.collection_date ? new Date(job.collection_date).toLocaleDateString() : '-';

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
                <BreadcrumbLink href="/collections">Collections</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">View Job</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-semibold text-gray-800">Collection: {job.job_id}</div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/collections")}
              >
                <ArrowLeft className="h-6 w-6" />
                Back to Collections
              </Button>
              <Button
                onClick={() => (window.location.href = `/collections/${job.id}/edit`)}
              >
                <Edit className="h-6 w-6" />
                Edit Job
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Collection Details */}
            <section className="bg-white border shadow rounded-lg">
              <header className="p-6">
                <h2 className="text-lg font-semibold">Collection Details</h2>
              </header>
              <Separator />
              <div className="p-6 space-y-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Job Number</Label>
                    <div className="col-span-2">
                      <p>{job.job_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Customer</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.company_name || currentCustomer?.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Collection Date</Label>
                    <div className="col-span-2">
                      <p>{formattedDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Status</Label>
                    <div className="col-span-2">
                      <p>{job.job_status}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Staff Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Staff Collecting</Label>
                    <div className="col-span-2">
                      <p>{job.staff_collecting || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Vehicle</Label>
                    <div className="col-span-2">
                      <p>{job.vehicle || '-'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Address</Label>
                    <div className="col-span-2">
                      <p>{job.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Town/City</Label>
                    <div className="col-span-2">
                      <p>{job.town_city}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Postcode</Label>
                    <div className="col-span-2">
                      <p>{job.postcode}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Onsite Contact</Label>
                    <div className="col-span-2">
                      <p>{job.onsite_contact || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Onsite Number</Label>
                    <div className="col-span-2">
                      <p>{job.onsite_number || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Onsite Email</Label>
                    <div className="col-span-2">
                      <p>{job.onsite_email || '-'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Collection Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Collection Type</Label>
                    <div className="col-span-2">
                      <p>{job.collection_type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Data Sanitisation</Label>
                    <div className="col-span-2">
                      <p>{job.data_sanitisation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Service Level Agreement</Label>
                    <div className="col-span-2">
                      <p>{job.sla || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Column - Customer Details */}
            <section className="bg-white border shadow rounded-lg self-start">
              <div className="flex items-center justify-between p-6">
                <h2 className="text-lg font-semibold">Customer Details</h2>
                <div className="text-sm">
                  Account Status: <span className="text-green-500">Active</span>
                </div>
              </div>
              <Separator />
              <div className="p-6 space-y-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Company Name</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.company_name || currentCustomer?.name || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Address</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.address || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Town/City</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.town_city || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>County</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.county || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Postcode</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.postcode || '-'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Contact Name</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.contact_name || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Position</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.position || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Landline</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.landline || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Mobile</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.mobile || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Email</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.email || '-'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Job Instructions</Label>
                    <div className="mt-2 whitespace-pre-wrap rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {job.instructions || 'No instructions provided.'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
<section className="bg-white border shadow rounded-lg">
  <header className="p-6">
    <h2 className="text-lg font-semibold">Job Documents</h2>
  </header>
  <Separator />
  <div className="p-6 space-y-6">
    {/* Collection Manifest */}
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Collection Manifest</h3>
        <div className="flex gap-2 items-center">
          {documents.collection_manifest ? (
            <>
              <a 
                href={`/storage/${documents.collection_manifest.file_path}`}
                target="_blank"
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {documents.collection_manifest.original_filename}
              </a>
              <Button
                variant="ghost"
                size="icon"
onClick={() => documents.collection_manifest && handleDeleteDocument(documents.collection_manifest.id, 'collection_manifest')}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          ) : (
            <div className="flex gap-2 items-center">
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e, 'collection_manifest')}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFileUpload('collection_manifest')}
                disabled={!selectedFiles.collection_manifest}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Hazard Waste Note */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Hazard Waste Note</h3>
          <div className="flex gap-2 items-center">
            {documents.hazard_waste_note ? (
              <>
                <a 
                  href={`/storage/${documents.hazard_waste_note.file_path}`}
                  target="_blank"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {documents.hazard_waste_note.original_filename}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => documents.hazard_waste_note && handleDeleteDocument(documents.hazard_waste_note.id, 'hazard_waste_note')}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileSelect(e, 'hazard_waste_note')}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFileUpload('hazard_waste_note')}
                  disabled={!selectedFiles.hazard_waste_note}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Destruction Certificate */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Data Destruction Certificate</h3>
          <div className="flex gap-2 items-center">
            {documents.data_destruction_certificate ? (
              <>
                <a 
                  href={`/storage/${documents.data_destruction_certificate.file_path}`}
                  target="_blank"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {documents.data_destruction_certificate.original_filename}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => documents.data_destruction_certificate && handleDeleteDocument(documents.data_destruction_certificate.id, 'data_destruction_certificate')}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileSelect(e, 'data_destruction_certificate')}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFileUpload('data_destruction_certificate')}
                  disabled={!selectedFiles.data_destruction_certificate}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    
    {/* Other Documents */}
    <div className="space-y-4">
      <h3 className="font-medium">Other Documents</h3>
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <Input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileSelect(e, 'other')}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFileUpload('other')}
            disabled={!selectedFiles.other}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        
        {documents.other.length > 0 && (
          <div className="space-y-2">
            {documents.other.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <a 
                  href={`/storage/${doc.file_path}`}
                  target="_blank"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {doc.original_filename}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDocument(doc.id, 'other')}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}