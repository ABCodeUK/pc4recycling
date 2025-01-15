import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "./data-table";
import { subCategoryColumns } from "./columns"; // Import dynamic columns
import { SubCategory } from "./columns"; // Import SubCategory type
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
import { Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function SubCategories({ parentId }: { parentId: number }) {
  const [data, setData] = useState<SubCategory[]>([]);
  const [addFormData, setAddFormData] = useState({ name: "", default_weight: "" });
  const [editFormData, setEditFormData] = useState<SubCategory | null>(null);
  const [formErrors, setFormErrors] = useState({ name: "", default_weight: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(`/sub-categories/${parentId}`);
        setData(response.data);
      } catch (error) {
        toast.error("Failed to fetch subcategories.");
      }
    };
    fetchSubCategories();
  }, [parentId]);

  const resetFormErrors = () => setFormErrors({ name: "", default_weight: "" });

  const resetAddForm = () => {
    setAddFormData({ name: "", default_weight: "" });
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
    resetFormErrors();
  
    // Check if the name already exists in the current data
    const nameExists = data.some(
      (subCategory) => subCategory.name.toLowerCase() === addFormData.name.toLowerCase()
    );
  
    if (nameExists) {
      setFormErrors((prev) => ({ ...prev, name: "This name is already in use." }));
      return; // Stop further execution
    }
  
    try {
      const response = await axios.post("/sub-categories", { ...addFormData, parent_id: parentId });
      setData((prev) => [...prev, response.data]);
      setIsAddDialogOpen(false);
      resetAddForm();
      toast.success("SubCategory successfully created!");
    } catch (error: any) {
      if (error.response?.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error creating SubCategory.");
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!editFormData) return;
    resetFormErrors();
    try {
      const response = await axios.put(`/sub-categories/${editFormData.id}`, editFormData);
      setData((prev) =>
        prev.map((item) => (item.id === editFormData.id ? response.data : item))
      );
      setIsEditDialogOpen(false);
      toast.success("SubCategory successfully updated!");
    } catch (error: any) {
      if (error.response?.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error updating SubCategory.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/sub-categories/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("SubCategory successfully deleted!");
    } catch {
      toast.error("Error deleting SubCategory.");
    }
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...subCategoryColumns.filter((column) =>
      ["name", "default_weight"].includes(column.accessorKey as string)
    ), // Include only Name and Default Weight from imported columns
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => (
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
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete SubCategory <b>{row.original.name}</b>?
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
                  Manage Sub Categories
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete Sub Categories.
                </p>
              </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search Sub Categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => setIsAddDialogOpen(true)}>Add SubCategory</Button>
        </div>
      </header>
      <Separator className="my-4" />
      <DataTable columns={columnsWithActions} data={filteredData} />

      {/* Add Dialog */}
      <Dialog
  open={isAddDialogOpen}
  onOpenChange={(isOpen) => {
    if (!isOpen) resetAddForm(); // Reset the form when the dialog is closed
    setIsAddDialogOpen(isOpen);
  }}
>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add SubCategory</DialogTitle>
            <DialogDescription>
              Fill in the details for the new SubCategory below.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-6">
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
                <Label htmlFor="default_weight">Default Weight*</Label>
                <div className="relative flex items-center">
                <Input
                  id="default_weight"
                  name="default_weight"
                  type="number"
                  value={addFormData?.default_weight || ""}
                  onChange={(e) => handleInputChange(e, "add")}
                  required
                  className="pr-10"
                />
              <span className="absolute right-3 text-sm text-gray-500">kg</span>
                {formErrors.default_weight && (
                  <p className="text-red-600 text-sm">{formErrors.default_weight}</p>
                )}
              </div>
              </div>
            </div>
          </div>
          <DialogFooter>
          <Button
        variant="outline"
        onClick={() => {
          resetAddForm(); // Reset form when "Cancel" button is clicked
          setIsAddDialogOpen(false);
        }}
      >
        Cancel
      </Button>
            <Button onClick={handleAddSubmit}>Create SubCategory</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit SubCategory</DialogTitle>
            <DialogDescription>
              Update the details for the SubCategory below.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-6">
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
                <Label htmlFor="default_weight">Default Weight*</Label>
                <div className="relative flex items-center">
                <Input
                  id="default_weight"
                  name="default_weight"
                  type="number"
                  value={editFormData?.default_weight || ""}
                  onChange={(e) => handleInputChange(e, "edit")}
                  required
                  className="pr-10"
                />
              <span className="absolute right-3 text-sm text-gray-500">kg</span>
                {formErrors.default_weight && (
                  <p className="text-red-600 text-sm">{formErrors.default_weight}</p>
                )}
              </div>
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