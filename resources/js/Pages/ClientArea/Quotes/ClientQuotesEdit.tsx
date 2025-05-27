import { router } from "@inertiajs/react";
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
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

// Update the Props interface to include more client details
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
  };
  sub_clients: {
      id: number;
      name: string;
      email: string;
      mobile: string | null;
      landline: string | null;
  }[];
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
  addresses: {
      id: number;
      address: string;
      address_2: string;
      town_city: string;
      county: string;
      postcode: string;
  }[];
  collection_types: Array<{
      id: number;
      colt_name: string;
  }>;
  sanitisation_options: Array<{
    id: number;
    ds_name: string;
  }>;
  status_options: string[];
  staff_members: {
      id: number;
      name: string;
  }[];
}

// Then update the handleDeleteJob function
export default function CollectionsEdit({ job, customers, addresses, collection_types, sanitisation_options, status_options, staff_members,sub_clients }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Replace the entire handleDeleteJob function
  const handleDeleteJob = () => {
    setIsDeleting(true);
    router.delete(`/collections/${job.id}`, {
      onSuccess: () => {
        toast.success("Job successfully deleted!");
        router.get('/collections');
      },
      onError: () => {
        toast.error("Failed to delete job. Please try again.");
        setIsDeleting(false);
      }
    });
  };

  const [formData, setFormData] = useState({
    job_id: job.job_id || "",
    client_id: job.client_id?.toString() || "",
    collection_date: job.collection_date ? new Date(job.collection_date).toISOString().split('T')[0] : "",
    job_status: job.job_status || "",
    staff_collecting: job.staff_collecting || "",
    vehicle: job.vehicle || "",
    address: job.address || "",
    address_2: job.address_2 || "",
    town_city: job.town_city || "",
    postcode: job.postcode || "",
    onsite_contact: job.onsite_contact || "",
    onsite_number: job.onsite_number || "",
    onsite_email: job.onsite_email || "",
    collection_type: job.collection_type?.toString() || "",
    data_sanitisation: job.data_sanitisation || "",
    sla: job.sla || "",
    instructions: job.instructions || "",
    equipment_location: job.equipment_location || "",
    building_access: job.building_access || "",
    collection_route: job.collection_route || "",
    parking_loading: job.parking_loading || "",
    equipment_readiness: job.equipment_readiness || "",   
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add handleStaffSelect function
  const handleStaffSelect = (value: string) => {
    if (value === "manual") {
      setFormData(prev => ({
        ...prev,
        staff_collecting: "",
      }));
      return;
    }
  
    const selectedStaff = staff_members.find(staff => staff.id.toString() === value);
    if (selectedStaff) {
      setFormData(prev => ({
        ...prev,
        staff_collecting: selectedStaff.name,
      }));
    }
  };

  // Update handleAddressSelect function
  const handleAddressSelect = (addressId: string) => {
    if (addressId === "manual") {
      setFormData(prev => ({
        ...prev,
        address: "",
        address_2: "",
        town_city: "",
        county: "",
        postcode: "",
      }));
      return;
    }
  
    if (addressId === "main") {
      if (currentCustomer) {
        setFormData(prev => ({
          ...prev,
          address: currentCustomer.address || "",
          address_2: currentCustomer.address_2|| "",
          town_city: currentCustomer.town_city || "",
          county: currentCustomer.county || "",
          postcode: currentCustomer.postcode || "",
        }));
      }
      return;
    }
  
    const selectedAddress = addresses.find(addr => addr.id.toString() === addressId);
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        address: selectedAddress.address,
        address_2: selectedAddress.address_2,
        town_city: selectedAddress.town_city,
        county: selectedAddress.county || "",
        postcode: selectedAddress.postcode,
      }));
    }
  };

  // Update handleContactSelect function to handle the main contact
  const handleContactSelect = (contactId: string) => {
      if (contactId === "manual") {
          setFormData(prev => ({
              ...prev,
              onsite_contact: "",
              onsite_number: "",
              onsite_email: "",
          }));
          return;
      }
  
      if (contactId === "main" && currentCustomer) {
          setFormData(prev => ({
              ...prev,
              onsite_contact: currentCustomer.contact_name || "",
              onsite_number: currentCustomer.mobile || currentCustomer.landline || "",
              onsite_email: currentCustomer.email || "",
          }));
          return;
      }
  
      const selectedContact = sub_clients.find(contact => contact.id.toString() === contactId);
      if (selectedContact) {
          setFormData(prev => ({
              ...prev,
              onsite_contact: selectedContact.name,
              onsite_number: selectedContact.mobile || selectedContact.landline || "",
              onsite_email: selectedContact.email,
          }));
      }
  };

  // Update the handleSaveChanges function
  const handleSaveChanges = async () => {
      try {
          setIsSubmitting(true);
          // Convert collection_type back to a number before sending
          const dataToSend = {
              ...formData,
              collection_type: formData.collection_type ? parseInt(formData.collection_type) : null
          };
          
          const response = await axios.put(`/collections/${job.id}`, dataToSend);
          if (response.status === 200) {
              toast.success("Changes saved successfully!");
          } else {
              toast.error("Failed to save changes. Please try again.");
          }
      } catch (error: any) {
          console.error('Save error:', error.response?.data || error);
          toast.error(error.response?.data?.message || "An error occurred while saving changes.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // Add this line to find the current customer
  const currentCustomer = customers.find(c => c.id.toString() === formData.client_id);

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
                <BreadcrumbLink href="#">Edit Job</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-semibold text-gray-800">Processing: {job.job_id}</div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = `/collections/${job.id}`)}
              >
                <ArrowLeft className="h-6 w-6" />
                Done Editing
              </Button>
              <Button
                className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                <Save className="h-6 w-6" />
                Save Changes
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-6 w-6" />
                    Delete Job
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this job? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteJob}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                    <Label htmlFor="job_id">Job Number*</Label>
                    <div className="col-span-2">
                      <Input
                        id="job_id"
                        name="job_id"
                        value={formData.job_id}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="client_id">Customer*</Label>
                    <div className="col-span-2">
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) => handleSelectChange("client_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.company_name || customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="job_status">Status*</Label>
                    <div className="col-span-2">
                      <Select
                        value={formData.job_status}
                        onValueChange={(value) => handleSelectChange("job_status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {status_options.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="collection_date">Collection Date</Label>
                    <div className="col-span-2">
                      <Input
                        id="collection_date"
                        name="collection_date"
                        type="date"
                        value={formData.collection_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Staff Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="staff_select">Staff Collecting</Label>
                    <div className="col-span-2">
                      <Select onValueChange={handleStaffSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Enter Manually" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Enter Manually</SelectItem>
                          {staff_members.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id.toString()}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="staff_collecting">Name</Label>
                    <div className="col-span-2">
                      <Input
                        id="staff_collecting"
                        name="staff_collecting"
                        value={formData.staff_collecting}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="vehicle">Vehicle</Label>
                    <div className="col-span-2">
                      <Input
                        id="vehicle"
                        name="vehicle"
                        value={formData.vehicle}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="collection_address">Collection Address</Label>
                    <div className="col-span-2">
                      <Select onValueChange={handleAddressSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Enter Manually" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Enter Manually</SelectItem>
                          {currentCustomer && currentCustomer.address && (
                            <SelectItem value="main">
                            {currentCustomer.address}, {currentCustomer.address_2}, {currentCustomer.town_city}, {currentCustomer.postcode} (Account Address)
                            </SelectItem>
                          )}
                          {addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id.toString()}>
                              {address.address}, {address.address_2}, {address.town_city}, {address.postcode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="address">Address Line 1</Label>
                    <div className="col-span-2">
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="address_2">Address Line 2</Label>
                    <div className="col-span-2">
                      <Input
                        id="address_2"
                        name="address_2"
                        value={formData.address_2}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="town_city">Town/City</Label>
                    <div className="col-span-2">
                      <Input
                        id="town_city"
                        name="town_city"
                        value={formData.town_city}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="county">County</Label>
                    <div className="col-span-2">
                      <Input
                        id="county"
                        name="county"
                        value={(formData as any).county || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="postcode">Postcode</Label>
                    <div className="col-span-2">
                      <Input
                        id="postcode"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="onsite_contact_select">Onsite Contact</Label>
                      <div className="col-span-2">
                          <Select onValueChange={handleContactSelect}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Enter Manually" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="manual">Enter Manually</SelectItem>
                                  {currentCustomer && currentCustomer.contact_name && (
                                      <SelectItem value="main">
                                          {currentCustomer.contact_name} (Main Contact)
                                      </SelectItem>
                                  )}
                                  {sub_clients.map((contact) => (
                                      <SelectItem key={contact.id} value={contact.id.toString()}>
                                          {contact.name}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="onsite_contact">Onsite Contact Name</Label>
                    <div className="col-span-2">
                      <Input
                        id="onsite_contact"
                        name="onsite_contact"
                        value={formData.onsite_contact}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="onsite_number">Onsite Contact Number</Label>
                    <div className="col-span-2">
                      <Input
                        id="onsite_number"
                        name="onsite_number"
                        value={formData.onsite_number}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="onsite_email">Onsite Contact Email</Label>
                    <div className="col-span-2">
                      <Input
                        id="onsite_email"
                        name="onsite_email"
                        type="email"
                        value={formData.onsite_email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                <Separator />

                {/* Collection Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="collection_type">Collection Type*</Label>
                      <div className="col-span-2">
                        <Select
                          value={formData.collection_type?.toString() || ""}
                          onValueChange={(value) => handleSelectChange("collection_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Collection Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {collection_types.map((type) => (
                              <SelectItem key={type.id} value={type.id.toString()}>
                                {type.colt_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="data_sanitisation">Data Sanitisation*</Label>
                      <div className="col-span-2">
                        <Select
                          value={formData.data_sanitisation?.toString() || ""}
                          onValueChange={(value) => handleSelectChange("data_sanitisation", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Data Sanitisation" />
                          </SelectTrigger>
                          <SelectContent>
                            {sanitisation_options.map((option) => (
                              <SelectItem key={option.id} value={option.id.toString()}>
                                {option.ds_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="sla">Service Level Agreement</Label>
                    <div className="col-span-2">
                      <Input
                        id="sla"
                        name="sla"
                        value={formData.sla}
                        onChange={handleInputChange}
                      />
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
              <hr className="my-0" />
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
                    <Label>Address Line 1</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.address || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Address Line 2</Label>
                    <div className="col-span-2">
                      <p>{currentCustomer?.address_2 || '-'}</p>
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
                  <Label htmlFor="equipment_location">Equipment Location</Label>
                  <textarea
                    id="equipment_location"
                    name="equipment_location"
                    rows={4}
                    placeholder="Please enter any notes about Equipment Location here..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.equipment_location}
                    onChange={handleInputChange}
                  />
                  </div>
                  <div>
                  <Label htmlFor="building_access">Building Access</Label>
                  <textarea
                    id="building_access"
                    name="building_access"
                    rows={4}
                    placeholder="Please enter any notes about Building Access here..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.building_access}
                    onChange={handleInputChange}
                  />
                  </div>
                  <div>
                  <Label htmlFor="collection_route">Collection Route</Label>
                  <textarea
                    id="collection_route"
                    name="collection_route"
                    rows={4}
                    placeholder="Please enter any notes about this job here..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.collection_route}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="collection_route">Parking & Loading</Label>
                  <textarea
                    id="parking_loading"
                    name="parking_loading"
                    rows={4}
                    placeholder="Please enter any notes about Parking & Loading here..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.parking_loading}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="equipment_readiness">Equipment Readiness</Label>
                  <textarea
                    id="equipment_readiness"
                    name="equipment_readiness"
                    rows={4}
                    placeholder="Please enter any notes about Equipment Readiness here..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.equipment_readiness}
                    onChange={handleInputChange}
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="collection_route">Other Information</Label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows={4}
                    placeholder="Please enter any notes about this job here..."
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.instructions}
                    onChange={handleInputChange}
                  />
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