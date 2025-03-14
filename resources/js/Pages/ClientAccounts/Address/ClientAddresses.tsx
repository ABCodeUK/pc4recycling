import { useEffect, useState } from "react";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { DataTable } from "./data-table";
import { userAddressColumns } from "./columns"; // Import dynamic columns
import { UserAddress } from "./columns"; // Import UserAddress type
import { Edit, ArrowLeft, Trash2, Trash } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/Components/ui/alert-dialog";

export default function ClientAddresses({ parentId }: { parentId: number }) {
  const [data, setData] = useState<UserAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [addFormData, setAddFormData] = useState({
    address: "",
    address_2: "",
    town_city: "",
    county: "",
    postcode: "",
  });
  const [editFormData, setEditFormData] = useState<UserAddress | null>(null);
  const [formErrors, setFormErrors] = useState({
    address: "",
    address_2: "",
    town_city: "",
    county: "",
    postcode: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch addresses and default address on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        // Fetch additional addresses
        const addressesResponse = await axios.get(`/addresses/${parentId}`);
        const addresses = addressesResponse.data;

        // Fetch default address from the `users_clients` table
        const defaultResponse = await axios.get(`/customers/${parentId}/default-address`);
        const defaultAddressData = defaultResponse.data;

        // In the useEffect where default address is fetched
        if (defaultAddressData) {
          const defaultRow: UserAddress = {
            id: -1, // Unique identifier for the default address
            address: defaultAddressData.address || "",
            address_2: defaultAddressData.address_2 || "", // Make sure this is properly mapped
            town_city: defaultAddressData.town_city || "",
            county: defaultAddressData.county || "",
            postcode: defaultAddressData.postcode || "",
            user_id: parentId,
          };
          console.log('Default address data:', defaultAddressData); // Add this debug log
          console.log('Created default row:', defaultRow); // Add this debug log
          setDefaultAddress(defaultRow);
        }

        setData(addresses);
      } catch (error) {
        toast.error("Failed to fetch addresses.");
      }
    };

    if (parentId) fetchAddresses(); // Ensure parentId is valid before fetching
  }, [parentId]);

  const resetFormErrors = () =>
    setFormErrors({
      address: "",
      address_2: "",
      town_city: "",
      county: "",
      postcode: "",
    });

  const resetAddForm = () => {
    setAddFormData({
      address: "",
      address_2: "",
      town_city: "",
      county: "",
      postcode: "",
    });
    resetFormErrors();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "add" | "edit"
  ) => {
    const { name, value } = e.target;
    if (type === "add") {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    } else if (editFormData) {
      setEditFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    }
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddSubmit = async () => {
    try {
      const payload = {
        ...addFormData,
        parent_id: parentId,
      };
      
      console.log('Sending payload:', payload); // Debug log
      
      const response = await axios.post("/addresses", payload);
      
      setData((prev) => [...prev, response.data]);
      toast.success("Address successfully added!");
      setIsAddDialogOpen(false);
      resetAddForm();
    } catch (error: any) {
      console.error('Error response:', error.response?.data); // Debug log
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.entries(errors).forEach(([key, value]) => {
          toast.error(`${key}: ${value}`);
        });
        setFormErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add address. Please try again.");
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!editFormData) return;
    resetFormErrors();
    try {
      const response = await axios.put(`/addresses/${editFormData.id}`, editFormData);
      setData((prev) =>
        prev.map((item) => (item.id === editFormData.id ? response.data : item))
      );
      setIsEditDialogOpen(false);
      toast.success("Address successfully updated!");
    } catch (error: any) {
      if (error.response?.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Failed to update address.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/addresses/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Address successfully deleted!");
    } catch {
      toast.error("Failed to delete address.");
    }
  };

  const filteredData = [
    ...(defaultAddress ? [defaultAddress] : []), // Add default address first
    ...data.filter((item) =>
      item.address.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  ];

  const columnsWithActions = [
    ...userAddressColumns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) =>
        row.original.id === -1 ? (
          <div className="text-right text-muted-foreground">(Default Address)</div>
        ) : (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData(row.original);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this address?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(row.original.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ),
    },
  ];

  return (
    <section className="bg-white border shadow rounded-lg p-6">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold leading-7 text-gray-900">
            Manage Addresses
          </h2>
          <p className="text-sm text-muted-foreground">
            Add, edit, or delete addresses for this user.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>Add Address</Button>
        </div>
      </header>
      <Separator className="my-4" />
      <DataTable columns={columnsWithActions} data={filteredData} />

      {/* Add Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetAddForm();
          setIsAddDialogOpen(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
            <DialogDescription>
              Fill in the details for the new address below.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Address Line 1*</Label>
                <Input
                  id="address"
                  name="address"
                  value={addFormData.address}
                  onChange={(e) => handleInputChange(e, "add")}
                />
                {formErrors.address && (
                  <p className="text-red-600 text-sm">{formErrors.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address_2">Address Line 2*</Label>
                <Input
                  id="address_2"
                  name="address_2"
                  value={addFormData.address_2}
                  onChange={(e) => handleInputChange(e, "add")}
                />
                {formErrors.address_2 && (
                  <p className="text-red-600 text-sm">{formErrors.address_2}</p>
                )}
              </div>
              <div>
                <Label htmlFor="town_city">Town / City*</Label>
                <Input
                  id="town_city"
                  name="town_city"
                  value={addFormData.town_city}
                  onChange={(e) => handleInputChange(e, "add")}
                />
                {formErrors.town_city && (
                  <p className="text-red-600 text-sm">{formErrors.town_city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  name="county"
                  value={addFormData.county}
                  onChange={(e) => handleInputChange(e, "add")}
                />
                {formErrors.county && (
                  <p className="text-red-600 text-sm">{formErrors.county}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postcode">Postcode*</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  value={addFormData.postcode}
                  onChange={(e) => handleInputChange(e, "add")}
                />
                {formErrors.postcode && (
                  <p className="text-red-600 text-sm">{formErrors.postcode}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit}>Add Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(isOpen) => setIsEditDialogOpen(isOpen)}
      >
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update the details for the address below.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={editFormData?.address || ""}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
                {formErrors.address && (
                  <p className="text-red-600 text-sm">{formErrors.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address_2">Address Line 2</Label>
                <Input
                  id="address_2"
                  name="address_2"
                  value={editFormData?.address_2 || ""}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
                {formErrors.address_2 && (
                  <p className="text-red-600 text-sm">{formErrors.address_2}</p>
                )}
              </div>
              <div>
                <Label htmlFor="town_city">Town / City</Label>
                <Input
                  id="town_city"
                  name="town_city"
                  value={editFormData?.town_city || ""}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
                {formErrors.town_city && (
                  <p className="text-red-600 text-sm">{formErrors.town_city}</p>
                )}
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  name="county"
                  value={editFormData?.county || ""}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
                {formErrors.county && (
                  <p className="text-red-600 text-sm">{formErrors.county}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  name="postcode"
                  value={editFormData?.postcode || ""}
                  onChange={(e) => handleInputChange(e, "edit")}
                />
                {formErrors.postcode && (
                  <p className="text-red-600 text-sm">{formErrors.postcode}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}