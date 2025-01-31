import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "./data-table";
import { subClientColumns } from "./columns";
import { SubClient } from "./columns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Add this import at the top with other imports
import { Edit, Trash2 } from "lucide-react";

export default function ClientSubClients({ parentId }: { parentId: number }) {
  const [data, setData] = useState<SubClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    landline: "",
    mobile: "",
    // Remove password from initial state
  });
  
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    // Remove password from formErrors
  });

  const resetFormErrors = () => {
    setFormErrors({
      name: "",
      email: "",
      // Remove password from resetFormErrors
    });
  };

  const resetAddForm = () => {
    setAddFormData({
      name: "",
      email: "",
      landline: "",
      mobile: "",
      // Remove password from resetAddForm
    });
    resetFormErrors();
  };

  const [editFormData, setEditFormData] = useState<SubClient | null>(null);

  useEffect(() => {
    const fetchSubClients = async () => {
      try {
        console.log('Fetching sub-clients for parent:', parentId);
        const response = await axios.get(`/customers/${parentId}/sub-clients`);
        console.log('Sub-clients response:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching sub-clients:', error);
        toast.error("Failed to fetch sub-clients.");
      }
    };

    if (parentId) fetchSubClients();
  }, [parentId]);

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
      const response = await axios.post("/sub-clients", {
        ...addFormData,
        parent_id: parentId,
      });
      setData((prev) => [...prev, response.data]);
      toast.success("Sub-client successfully added!");
      setIsAddDialogOpen(false);
      resetAddForm();
    } catch (error: any) {
      toast.error("Failed to add sub-client.");
      setFormErrors(error.response?.data.errors || {});
    }
  };

  const handleEditSubmit = async () => {
    if (!editFormData) return;
    resetFormErrors();
    try {
      const response = await axios.put(`/sub-clients/${editFormData.id}`, editFormData);
      setData((prev) =>
        prev.map((item) => (item.id === editFormData.id ? response.data : item))
      );
      setIsEditDialogOpen(false);
      toast.success("Sub-client successfully updated!");
    } catch (error: any) {
      if (error.response?.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Failed to update sub-client.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/sub-clients/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Sub-client successfully deleted!");
    } catch {
      toast.error("Failed to delete sub-client.");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add columnsWithActions
  const columnsWithActions = [
    ...subClientColumns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
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
                  Are you sure you want to delete <b>{row.original.name}</b>?
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
            Manage Sub-Clients
          </h2>
          <p className="text-sm text-muted-foreground">
            Add, edit, or delete sub-clients for this customer.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsAddDialogOpen(true)}>Add Sub-Client</Button>
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
            <DialogTitle>Add Sub-Client</DialogTitle>
            <DialogDescription>
              Fill in the details for the new sub-client below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={addFormData.name}
                onChange={(e) => handleInputChange(e, "add")}
              />
              {formErrors.name && (
                <p className="text-red-600 text-sm">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={addFormData.email}
                onChange={(e) => handleInputChange(e, "add")}
              />
              {formErrors.email && (
                <p className="text-red-600 text-sm">{formErrors.email}</p>
              )}
            </div>
            {/* Remove this block
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={addFormData.password}
                onChange={(e) => handleInputChange(e, "add")}
              />
              {formErrors.password && (
                <p className="text-red-600 text-sm">{formErrors.password}</p>
              )}
            </div>
            */}
            <div>
              <Label htmlFor="landline">Landline</Label>
              <Input
                id="landline"
                name="landline"
                value={addFormData.landline}
                onChange={(e) => handleInputChange(e, "add")}
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                value={addFormData.mobile}
                onChange={(e) => handleInputChange(e, "add")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit}>Add Sub-Client</Button>
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
            <DialogTitle>Edit Sub-Client</DialogTitle>
            <DialogDescription>
              Update the details for the sub-client below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={editFormData?.name || ""}
                onChange={(e) => handleInputChange(e, "edit")}
              />
              {formErrors.name && (
                <p className="text-red-600 text-sm">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={editFormData?.email || ""}
                onChange={(e) => handleInputChange(e, "edit")}
              />
              {formErrors.email && (
                <p className="text-red-600 text-sm">{formErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="landline">Landline</Label>
              <Input
                id="landline"
                name="landline"
                value={editFormData?.landline || ""}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                value={editFormData?.mobile || ""}
                onChange={(e) => handleInputChange(e, "edit")}
              />
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