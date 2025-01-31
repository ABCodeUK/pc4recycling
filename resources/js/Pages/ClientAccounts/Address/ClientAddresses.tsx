import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";

export default function ClientAddresses({ parentId }: { parentId: number }) {
  const [data, setData] = useState<UserAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [addFormData, setAddFormData] = useState({
    address: "",
    town_city: "",
    county: "",
    postcode: "",
  });
  const [editFormData, setEditFormData] = useState<UserAddress | null>(null);
  const [formErrors, setFormErrors] = useState({
    address: "",
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

        if (defaultAddressData) {
          const defaultRow: UserAddress = {
            id: -1, // Unique identifier for the default address
            address: defaultAddressData.address || "",
            town_city: defaultAddressData.town_city || "",
            county: defaultAddressData.county || "",
            postcode: defaultAddressData.postcode || "",
            user_id: parentId,
          };
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
      town_city: "",
      county: "",
      postcode: "",
    });

  const resetAddForm = () => {
    setAddFormData({
      address: "",
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
      const response = await axios.post("/addresses", {
        ...addFormData,
        parent_id: parentId,
      });
      setData((prev) => [...prev, response.data]);
      toast.success("Address successfully added!");
      setIsAddDialogOpen(false);
      resetAddForm();
    } catch (error: any) {
      toast.error("Failed to add address.");
      setFormErrors(error.response?.data.errors || {});
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
          <div className="grid gap-4">
            {/* Address Form */}
            <div>
              <Label htmlFor="address">Address</Label>
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
              <Label htmlFor="town_city">Town / City</Label>
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
              <Label htmlFor="postcode">Postcode</Label>
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
          <div className="grid gap-4">
            {/* Edit Form */}
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