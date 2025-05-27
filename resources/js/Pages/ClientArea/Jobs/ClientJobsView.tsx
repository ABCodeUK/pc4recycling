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
import JobItems from "./JobItems/JobItems";  // Update the import 
import { Textarea } from "@/Components/ui/textarea";
import { ClientOnly, StaffOnly, Role } from '@/Components/Auth/Can';
import { useAuth } from '@/contexts/AuthContext';

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

export default function ProcessingView({ job, customers, documents: initialDocuments }: Props) {
  // Remove signature-related state and handlers
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
              <BreadcrumbItem>
                <BreadcrumbLink href="/my-collections">My Collections</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">View Collection</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-3xl font-semibold text-gray-800">Collection: {job.job_id}</div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/my-collections/")}
              >
                <ArrowLeft className="h-6 w-6" />
                Back to Collections
              </Button>
            </div>
          </div>

          {/* Quote Information Section - Only show for specific statuses */}
          {(job.job_quote || job.quote_information) && 
           ['Quote Requested', 'Quote Received', 'Quote Rejected'].includes(job.job_status) && (
            <section className="bg-white border shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">
                Quote Information
              </h2>
              <Separator className="my-4" />
              {job.job_quote && (
                <div className="mb-4">
                  <Label htmlFor="job_quote" className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Amount
                  </Label>
                  <div className="text-lg font-semibold">£{job.job_quote}</div>
                </div>
              )}
              {job.quote_information && (
                <div className="mb-6">
                  <Label htmlFor="quote_information" className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Details
                  </Label>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: job.quote_information }} />
                  </div>
                </div>
              )}
              
              {/* Quote Action Buttons - Only show for Quote Received status */}
              {job.job_status === 'Quote Received' && (
                <div className="flex gap-4 mt-4">
                  <Button 
                    onClick={async () => {
                      try {
                        await axios.post(`/my-collections/${job.id}/accept-quote`);
                        toast.success("Quote accepted successfully");
                        window.location.reload();
                      } catch (error) {
                        console.error('Error accepting quote:', error);
                        toast.error("Failed to accept quote");
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept Quote
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await axios.post(`/my-collections/${job.id}/reject-quote`);
                        toast.success("Quote rejected");
                        window.location.reload();
                      } catch (error) {
                        console.error('Error rejecting quote:', error);
                        toast.error("Failed to reject quote");
                      }
                    }}
                  >
                    Reject Quote
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Update the grid to be responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Left Column - Collection Details */}
            <section className="bg-white border shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900 flex justify-between items-center">
                Collection Details
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
                <DetailRow label="Collection Date" value={formattedDate} />
                <Separator className="my-2" />
                <DetailRow label="Collection By" value={job.staff_collecting || "-"} />
                <DetailRow label="Vehicle Reistraton" value={job.vehicle || "-"} />
                <DetailRow label="Carrier Registration" value={job.driver_carrier_registration || "-"} />
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



            {/* Right Column - Customer Details */}
            <section className="bg-white border shadow rounded-lg p-6">

<h2 className="text-xl font-semibold leading-7 text-gray-900">
  Job Documents
</h2>

<Separator className="my-4" />
<div className="space-y-6">

{/* Collection Manifest */}
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="text-sm font-medium text-gray-500">Collection Manifest</h3>
    <div className="flex gap-2 items-center">
      {documents.collection_manifest ? (
        <>
            <a 
                href={`/documents/${job.id}/${documents.collection_manifest.uuid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/90 flex items-center gap-2"
            >
                <FileText className="h-4 w-4" />
                View Document
            </a>
      </>
    ) : (
      <div className="flex gap-2 items-center">
        -
      </div>
    )}
  </div>
</div>
{/* Hazard Waste Note */}
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="text-sm font-medium text-gray-500">Hazard Waste Note</h3>
    <div className="flex gap-2 items-center">
      {documents.hazard_waste_note ? (
        <>
          <a 
            href={`/documents/${job.id}/${documents.hazard_waste_note.uuid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/90 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View Document
          </a>
        </>
      ) : (
        <div className="flex gap-2 items-center">
          -
        </div>
      )}
    </div>
  </div>
</div>

{/* Data Destruction Certificate */}
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="text-sm font-medium text-gray-500">Data Destruction Certificate</h3>
    <div className="flex gap-2 items-center">
      {documents.data_destruction_certificate ? (
        <>
          <a 
            href={`/documents/${job.id}/${documents.data_destruction_certificate.uuid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/90 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View Document
          </a>
        </>
      ) : (
        <div className="flex gap-2 items-center">
          -
        </div>
      )}
    </div>
  </div>
</div>
</div>

{/* Other Documents */}
<div className="space-y-4">
<h3 className="text-sm font-medium text-gray-500">Other Documents</h3>
<div className="space-y-4">
  
  {documents.other
    .filter(doc => !doc.original_filename.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    .length > 0 && (
    <div className="space-y-2">
      {documents.other
        .filter(doc => !doc.original_filename.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        .map((doc) => (
        <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <a 
            href={`/documents/${job.id}/${doc.uuid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/90 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {doc.original_filename}
          </a>
        </div>
      ))}
    </div>
  )}
</div>
</div>
<Separator className="my-4" />

</div>

{/* Collection Images Gallery */}
<div className="mt-6">

<h3 className="text-sm font-medium text-gray-500 mb-4">Collection Images</h3>

<div className="space-y-6">
{/* Modern Image Upload Button */}
<div className="flex justify-center w-full">
  <label className="relative group cursor-pointer w-full">
    <input
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={(e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('document_type', 'other');
          
          axios.post(`/collections/${job.id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          }).then(response => {
            if (response.data) {
              setDocuments(prev => ({
                ...prev,
                other: [...prev.other, response.data.document]
              }));
              toast.success(`Uploaded ${file.name}`);
            }
          }).catch(error => {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${file.name}`);
          });
        });
      }}
    />
    
  </label>
</div>

{/* Images Grid */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
  {documents.other
    .filter(doc => doc.original_filename.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    .map((image) => (
      <div key={image.id} className="relative group aspect-square">
        <img
          src={`/storage/${image.file_path}`}
          alt={image.original_filename}
          className="w-full h-full object-cover rounded-lg shadow-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg flex items-end justify-between p-2">
          <a
            href={`/storage/${image.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-white" />
          </a>
        </div>
      </div>
  ))}
</div>
</div>
</div>

</section>



            </div>

            {/* Update the grid layout here */}

                        <div className="grid grid-cols-1 gap-6">
                          <section>
                            <JobItems 
                              jobId={job.job_id} 
                              jobStatus={job.job_status}
                            />
                          </section>    
                        </div>
                        </div>
                          </SidebarInset>
                        </SidebarProvider>
                      );
                    }
