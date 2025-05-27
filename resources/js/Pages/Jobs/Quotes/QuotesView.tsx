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
import JobItems from "./JobItems/JobItems";
import { Textarea } from "@/Components/ui/textarea";
import JobAuditLog from './Components/JobAuditLog';
import { ClientOnly, StaffOnly, Role } from '@/Components/Auth/Can';
import { useAuth } from '@/contexts/AuthContext';

// Use the same Props interface as CollectionsEdit
interface Props {
  job: {
    id: number;
    job_id: string;
    client_id: number;
    job_quote?: string;  // Added this property
    quote_information?: string;  // Added this property
    collection_date: string;
    job_status: string;
    staff_collecting: string;
    vehicle: string;
    address: string;
    address_2: string;
    town_city: string;
    postcode: string;
    onsite_contact: string;
    onsite_number: string;
    onsite_email: string;
    collection_type: string;
    data_sanitisation: string;
    sla: string;
    instructions: string;
    equipment_location: string;
    building_access: string;
    collection_route: string;
    parking_loading: string;
    equipment_readiness: string;
    driver_type?: string;
    driver_carrier_registration?: string;
  };
  customers: { 
    id: number; 
    name: string;
    company_name?: string;
    address?: string;
    address_2?: string;
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
  uuid: string;
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

export default function QuotesView({ job, customers, documents: initialDocuments }: Props) {
    

    const handleMarkJobCollected = async (customerSignature: string, customerName: string, driverSignature: string, driverName: string) => {
      try {
          const response = await axios.post(`/api/jobs/${job.job_id}/mark-collected`, {
              customer_signature: customerSignature,
              customer_name: customerName,
              driver_signature: driverSignature,
              driver_name: driverName
          });

          toast.success("Job marked as collected successfully");
          
          // Handle redirect based on response
          if (response.data.redirect) {
              window.location.href = response.data.redirect;
          }
      } catch (error) {
          console.error('Error marking job as collected:', error);
          toast.error("Failed to mark job as collected");
      }
  };

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
      // Check file size (128MB = 128 * 1024 * 1024 bytes)
      const maxSize = 128 * 1024 * 1024; // 128MB in bytes
      if (file.size > maxSize) {
        toast.error('File size must be less than 128MB');
        e.target.value = ''; // Reset input
        return;
      }
      setSelectedFiles(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };
  
  
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

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="py-1 grid grid-cols-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 text-left">{value || "-"}</dd>
    </div>
  );
  
  const getAccountStatusColor = (status?: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Postponed':
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Collected':
      case 'Processing':
      case 'Complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

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
              <Role role="Developer|Administrator|Employee|Manager|Director">
              <BreadcrumbItem>
                <BreadcrumbLink href="/quotes">Quotes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              </Role>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">View Quote</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-3xl font-semibold text-gray-800">Quote: {job.job_id}</div>
            <div className="flex flex-wrap items-center gap-3">
              <Role role="Developer|Administrator|Employee|Manager|Director">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/quotes")}
              >
                <ArrowLeft className="h-6 w-6" />
                Back to Quotes
              </Button></Role>
              <Role role="Drivers">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard")}
              >
                <ArrowLeft className="h-6 w-6" />
                Back to Dashboard
              </Button>
              </Role>
              <Role role="Developer|Administrator|Employee|Manager|Director">
              <Button
                onClick={() => (window.location.href = `/quotes/${job.id}/edit`)}
              >
                <Edit className="h-6 w-6" />
                Edit Quote
              </Button></Role>
            </div>
          </div>

          {/* Update the grid to be responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Left Column - Collection Details */}
            <section className="bg-white border shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900 flex justify-between items-center">
                Quote Details
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${getStatusColor(job.job_status)}`}>
                    {job.job_status}
                  </span>
                </div>
              </h2>
              <Separator className="my-4" />
              <dl className="grid gap-2">
                <DetailRow label="Job Number" value={job.job_id} />
                <div className="py-1 grid grid-cols-2">
                  <dt className="text-sm font-medium text-gray-500">Customer</dt>
                  <dd className="text-sm text-left">
                  <Role role="Developer|Administrator|Employee|Manager|Director">
                    <a 
                      href={`/customers/${currentCustomer?.id}`}
                      className="text-primary hover:text-primary/90"
                    >
                      {currentCustomer?.company_name || currentCustomer?.name || "-"}
                    </a>
                    </Role>
                    <Role role="Drivers">
                    {currentCustomer?.company_name || currentCustomer?.name || "-"}
                    </Role>
                  </dd>
                </div>
                <DetailRow label="Collection Date" value={formattedDate} />
                <Separator className="my-2" />
                <DetailRow label="Address Line 1" value={job.address} />
                <DetailRow label="Address Line 2" value={job.address_2} />
                <DetailRow label="Town/City" value={job.town_city} />
                <DetailRow label="Postcode" value={job.postcode} />
                <Separator className="my-2" />
                <DetailRow label="Onsite Contact" value={job.onsite_contact || "-"} />
                <DetailRow label="Onsite Number" value={job.onsite_number || "-"} />
                <DetailRow label="Onsite Email" value={job.onsite_email || "-"} />
              </dl>
            </section>

            {/* Middle Column - More Information */}
            <section className="bg-white border shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">
                More Information
              </h2>
              <Separator className="my-4" />
              <dl className="grid gap-2">
                <DetailRow label="Collection Type" value={job.collection_type || "-"} />
                <DetailRow label="Data Sanitisation" value={job.data_sanitisation || "-"} />
                <DetailRow label="Service Level Agreement" value={job.sla || "-"} />
                <Separator className="my-2" />
                <DetailRow label="Equipment Location" value={job.equipment_location || "-"} />
                <DetailRow label="Building Access" value={job.building_access || "-"} />
                <DetailRow label="Collection Route" value={job.collection_route || "-"} />
                <DetailRow label="Parking & Loading" value={job.parking_loading || "-"} />
                <DetailRow label="Equipment Readiness" value={job.equipment_readiness || "-"} />
                <Separator className="my-2" />
                <div className="py-1">
                  <dt className="text-sm font-medium text-gray-500">Other Information</dt>
                  <dd className="mt-2 text-sm text-gray-900">
                    {job.instructions || "No instructions provided."}
                  </dd>
                </div>
              </dl>
            </section>
            <Role role="Developer|Administrator|Employee|Manager|Director">
            {/* Right Column - Customer Details */}
            <section className="bg-white border shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900 flex justify-between items-center">
                Customer Details
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Account:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${getAccountStatusColor(currentCustomer?.account_status)}`}>
                    {currentCustomer?.account_status || 'Disabled'}
                  </span>
                </div>
              </h2>
              <Separator className="my-4" />
              <dl className="grid gap-2">
                <DetailRow 
                  label="Company Name" 
                  value={currentCustomer?.company_name || currentCustomer?.name || "-"} 
                />
                <DetailRow label="Address Line 1" value={currentCustomer?.address || "-"} />
                <DetailRow label="Address Line 2" value={currentCustomer?.address_2 || "-"} />
                <DetailRow label="Town/City" value={currentCustomer?.town_city || "-"} />
                <DetailRow label="County" value={currentCustomer?.county || "-"} />
                <DetailRow label="Postcode" value={currentCustomer?.postcode || "-"} />
                <Separator className="my-2" />
                <DetailRow label="Contact Name" value={currentCustomer?.contact_name || "-"} />
                <DetailRow label="Position" value={currentCustomer?.position || "-"} />
                <DetailRow label="Landline" value={currentCustomer?.landline || "-"} />
                <DetailRow label="Mobile" value={currentCustomer?.mobile || "-"} />
                <DetailRow label="Email" value={currentCustomer?.email || "-"} />
              </dl>
            </section>
            </Role>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {(job.job_status === "Quote Provided" || job.job_status === "Quote Declined") && (
                    <section className="bg-white border shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold leading-7 text-gray-900">
                            Quote Information
                        </h2>
                        <Separator className="my-4" />
                        <dl className="grid grid-cols-3 gap-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Quote Amount</dt>
                                <dd className="mt-2 text-sm text-gray-900">
                                    {job.job_quote ? `£${job.job_quote} +VAT` : "-"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Suggested Collection Date</dt>
                                <dd className="mt-2 text-sm text-gray-900">
                                    {job.collection_date ? new Date(job.collection_date).toLocaleDateString() : "-"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Additional Information</dt>
                                <dd className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                                    {job.quote_information || "No additional information provided."}
                                </dd>
                            </div>
                        </dl>
                    </section>
                )}
                <section>
                    <JobItems 
                        jobId={job.job_id} 
                        jobStatus={job.job_status}
                        job={job}
                    />
                </section>    
            </div>
            </div>
              </SidebarInset>
            </SidebarProvider>
          );
        }

