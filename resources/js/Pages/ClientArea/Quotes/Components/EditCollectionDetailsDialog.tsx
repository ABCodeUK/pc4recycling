import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Separator } from "@/Components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { toast } from "sonner";
import axios from "axios";

interface Address {
  id: number;
  address: string;
  address_2: string;
  town_city: string;
  county: string;
  postcode: string;
}

interface EditCollectionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  initialData: {
    address: string;
    address_2: string;
    town_city: string;
    postcode: string;
    onsite_contact: string;
    onsite_number: string;
    onsite_email: string;
  };
  job: {
    id: number;
    job_id: string;
    client_id: number;
    collection_date: string;
    job_status: string;
    staff_collecting: string;
    vehicle: string;
    driver_type?: string;
    driver_carrier_registration?: string;
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
  addresses: Address[];
  sub_clients: {
    id: number;
    name: string;
    email: string;
    mobile: string | null;
    landline: string | null;
  }[];
  customers:{
    id: number;
    name: string;
    landline?: string;
    mobile?: string;
    email?: string;
    address?: string;
    address_2?: string;
    town_city?: string;
    postcode?: string;
  }[];
}

export default function EditCollectionDetailsDialog({ 
  isOpen, 
  onClose, 
  jobId, 
  initialData,
  addresses,
  customers,
  job,
  sub_clients,
}: EditCollectionDetailsDialogProps) {
  const [formData, setFormData] = useState({
    address: initialData?.address ?? '',
    address_2: initialData?.address_2 ?? '',
    town_city: initialData?.town_city ?? '',
    postcode: initialData?.postcode ?? '',
    onsite_contact: initialData?.onsite_contact ?? '',
    onsite_number: initialData?.onsite_number ?? '',
    onsite_email: initialData?.onsite_email ?? ''

  });

const currentCustomer = customers.find(c => c.id === job.client_id);

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
      onsite_contact: currentCustomer.name || "",
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

// Update the SelectContent in the contact selection section
<SelectContent>
  {currentCustomer && (
    <SelectItem value="main">
      {currentCustomer.name} (Main Contact)
    </SelectItem>
  )}
  {sub_clients.map((contact) => (
    <SelectItem key={contact.id} value={contact.id.toString()}>
      {contact.name}
    </SelectItem>
  ))}
  <SelectItem value="manual">Enter Manually</SelectItem>
</SelectContent>

  const handleAddressSelect = (addressId: string) => {
    if (addressId === "manual") {
      setFormData(prev => ({
        ...prev,
        address: "",
        address_2: "",
        town_city: "",
        postcode: "",
      }));
      return;
    }

    if (addressId === "main" && currentCustomer) {
      setFormData(prev => ({
        ...prev,
        address: currentCustomer.address || "",
        address_2: currentCustomer.address_2 || "",
        town_city: currentCustomer.town_city || "",
        postcode: currentCustomer.postcode || "",
      }));
      return;
    }

    const selectedAddress = addresses.find(addr => addr.id.toString() === addressId);
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        address: selectedAddress.address,
        address_2: selectedAddress.address_2,
        town_city: selectedAddress.town_city,
        postcode: selectedAddress.postcode,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(`/client/quotes/${jobId}/update`, formData);
      
      if (response.status === 200) {
        toast.success("Collection details updated successfully");
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating collection details:', error);
      toast.error("Failed to update collection details");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Collection Details</DialogTitle>
          <DialogDescription>
            Update the collection address and contact details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address-select" className="text-left">Select Address</Label>
            <Select 
              onValueChange={handleAddressSelect}
            >
              <SelectTrigger className="w-full col-span-3">
                <SelectValue placeholder="Choose an address" />
              </SelectTrigger>
              <SelectContent>
                {currentCustomer && (
                  <SelectItem value="main">
                    {currentCustomer.address}, {currentCustomer.town_city} {currentCustomer.postcode} (Main Contact)
                  </SelectItem>
                )}
                {addresses.map((address) => (
                  <SelectItem key={address.id} value={address.id.toString()}>
                    {address.address}, {address.town_city}
                  </SelectItem>
                ))}
                <SelectItem value="manual">Enter Manually</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-left">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address_2" className="text-left">Address 2</Label>
            <Input
              id="address_2"
              name="address_2"
              value={formData.address_2}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="town_city" className="text-left">Town/City</Label>
            <Input
              id="town_city"
              name="town_city"
              value={formData.town_city}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="postcode" className="text-left">Postcode</Label>
            <Input
              id="postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <Separator className="my-2" />

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact-select" className="text-left">Select Contact</Label>
              <Select 
                onValueChange={handleContactSelect}
              >
                <SelectTrigger className="w-full col-span-3">
                  <SelectValue placeholder="Choose a contact" />
                </SelectTrigger>
                <SelectContent>
                  {initialData?.onsite_contact && (
                    <SelectItem value="main">
                      {currentCustomer?.name || 'Main Contact'} (Main Contact)
                    </SelectItem>
                  )}
                  {sub_clients.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="manual">Enter Manually</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="onsite_contact" className="text-left">Contact Name</Label>
            <Input
              id="onsite_contact"
              name="onsite_contact"
              value={formData.onsite_contact}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="onsite_number" className="text-left">Contact Number</Label>
            <Input
              id="onsite_number"
              name="onsite_number"
              value={formData.onsite_number}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="onsite_email" className="text-left">Contact Email</Label>
            <Input
              id="onsite_email"
              name="onsite_email"
              value={formData.onsite_email}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}