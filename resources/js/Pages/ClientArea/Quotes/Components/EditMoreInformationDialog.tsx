import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Separator } from "@/Components/ui/separator";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

interface EditMoreInformationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  initialData: {
    instructions: string;
    equipment_location: string;
    building_access: string;
    collection_route: string;
    parking_loading: string;
    equipment_readiness: string;
  };
}

export default function EditMoreInformationDialog({ 
  isOpen, 
  onClose, 
  jobId, 
  initialData,
}: EditMoreInformationDialogProps) {
  const [formData, setFormData] = useState({
    instructions: initialData?.instructions ?? '',
    equipment_location: initialData?.equipment_location ?? '',
    building_access: initialData?.building_access ?? '',
    collection_route: initialData?.collection_route ?? '',
    parking_loading: initialData?.parking_loading ?? '',
    equipment_readiness: initialData?.equipment_readiness ?? ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        toast.success("More information updated successfully");
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating more information:', error);
      toast.error("Failed to update more information");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit More Information</DialogTitle>
          <DialogDescription>
            Update additional information about the collection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="equipment_location" className="text-left">Equipment Location</Label>
            <Textarea
              id="equipment_location"
              name="equipment_location"
              value={formData.equipment_location}
              onChange={handleInputChange}
              className="col-span-3"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="building_access" className="text-left">Building Access</Label>
            <Textarea
              id="building_access"
              name="building_access"
              value={formData.building_access}
              onChange={handleInputChange}
              className="col-span-3"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parking_loading" className="text-left">Parking/Loading</Label>
            <Textarea
              id="parking_loading"
              name="parking_loading"
              value={formData.parking_loading}
              onChange={handleInputChange}
              className="col-span-3"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="equipment_readiness" className="text-left">Equipment Readiness</Label>
            <Textarea
              id="equipment_readiness"
              name="equipment_readiness"
              value={formData.equipment_readiness}
              onChange={handleInputChange}
              className="col-span-3"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instructions" className="text-left">Other Information</Label>
            <Textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSaveChanges}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}