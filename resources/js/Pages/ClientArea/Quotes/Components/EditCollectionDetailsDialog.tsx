import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Separator } from "@/Components/ui/separator";
import { toast } from "sonner";
import axios from "axios";

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
}

export default function EditCollectionDetailsDialog({ 
  isOpen, 
  onClose, 
  jobId, 
  initialData,
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