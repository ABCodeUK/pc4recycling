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
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { HPCode } from "./columns";
import VariablesNavigation from "@/Pages/Settings/Variables/VariablesNavigation";
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
import { Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function HPCodes({ hpCodes }: { hpCodes: HPCode[] }) {
  const [data, setData] = useState<HPCode[]>(hpCodes);
  const [addFormData, setAddFormData] = useState({
    hp_code: "",
    hp_type: "",
    hp_description: "",
  });
  const [editFormData, setEditFormData] = useState({
    hp_code: "",
    hp_type: "",
    hp_description: "",
  });
  const [formErrors, setFormErrors] = useState({
    hp_code: "",
    hp_type: "",
    hp_description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => {
    setFormErrors({ hp_code: "", hp_type: "", hp_description: "" });
  };

  const resetAddForm = () => {
    setAddFormData({
      hp_code: "",
      hp_type: "",
      hp_description: "",
    });
    resetFormErrors();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    type: "add" | "edit"
  ) => {
    const { name, value } = e.target;
    if (type === "add") {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // Clear errors as the user types
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddSubmit = async () => {
    resetFormErrors();
    const dataToSubmit = {
      hp_code: addFormData.hp_code,
      hp_type: addFormData.hp_type,
      hp_description: addFormData.hp_description || "", // Optional field
    };
    try {
      setIsSubmitting(true);
      const response = await axios.post("/settings/variables/hp-codes", dataToSubmit);

      if (response.status === 200) {
        const newCode = response.data;
        setData((prev) => [...prev, newCode]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("HP Code successfully created!");
      } else {
        toast.error("Failed to create HP Code. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error creating HP Code. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;

    resetFormErrors();
    const dataToSubmit = {
      hp_code: editFormData.hp_code,
      hp_type: editFormData.hp_type,
      hp_description: editFormData.hp_description || "", // Optional field
    };
    try {
      setIsSubmitting(true);
      const response = await axios.put(
        `/settings/variables/hp-codes/${editingId}`,
        dataToSubmit
      );

      if (response.status === 200) {
        const updatedCode = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedCode : item))
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("HP Code successfully updated!");
      } else {
        toast.error("Failed to update HP Code. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error updating HP Code. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/hp-codes/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("HP Code successfully deleted!");
      } else {
        toast.error("Failed to delete HP Code. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting HP Code. Please check the logs.");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.hp_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hp_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hp_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const hpCode = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({
                  hp_code: hpCode.hp_code,
                  hp_type: hpCode.hp_type,
                  hp_description: hpCode.hp_description,
                });
                resetFormErrors();
                setEditingId(hpCode.id);
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
                    Are you sure you want to delete HP Code <b>{hpCode.hp_code}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(hpCode.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

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
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/variables">
                  Variables
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/variables/hp-codes" >
                  HP Codes
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="hp-codes" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage HP Codes
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete HP codes used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search HP Codes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />
<Dialog
  open={isAddDialogOpen}
  onOpenChange={(isOpen) => {
    if (!isOpen) resetAddForm(); // Reset the form when the dialog is closed
    setIsAddDialogOpen(isOpen);
  }}
>
  <DialogTrigger asChild>
    <Button onClick={() => setIsAddDialogOpen(true)}>Add HP Code</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px] bg-white">
    <DialogHeader>
      <DialogTitle>Add HP Code</DialogTitle>
      <DialogDescription>
        Fill in the details for the new HP Code below.
      </DialogDescription>
    </DialogHeader>
    <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper for Add Form */}
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="hp_code">
            HP Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hp_code"
            name="hp_code"
            value={addFormData.hp_code}
            onChange={(e) => handleInputChange(e, "add")}
          />
          {formErrors.hp_code && (
            <p className="text-red-600 text-sm">{formErrors.hp_code}</p>
          )}
        </div>
        <div>
          <Label htmlFor="hp_type">
            Type <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hp_type"
            name="hp_type"
            value={addFormData.hp_type}
            onChange={(e) => handleInputChange(e, "add")}
          />
          {formErrors.hp_type && (
            <p className="text-red-600 text-sm">{formErrors.hp_type}</p>
          )}
        </div>
        <div>
          <Label htmlFor="hp_description">Description</Label>
          <textarea
            id="hp_description"
            name="hp_description"
            value={addFormData.hp_description}
            onChange={(e) => handleInputChange(e, "add")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formErrors.hp_description && (
            <p className="text-red-600 text-sm">{formErrors.hp_description}</p>
          )}
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          resetAddForm(); // Reset the form when "Cancel" is clicked
          setIsAddDialogOpen(false);
        }}
      >
        Cancel
      </Button>
      <Button onClick={handleAddSubmit}>Create HP Code</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
              </div>
            </header>
            <Separator className="my-4" />
            <DataTable columns={columnsWithActions} data={filteredData} />
          </section>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="sm:max-w-[425px] bg-white">
    <DialogHeader>
      <DialogTitle>Edit HP Code</DialogTitle>
      <DialogDescription>
        Update the details for the HP Code below.
      </DialogDescription>
    </DialogHeader>
    <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper for Edit Form */}
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="hp_code_edit">
            HP Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hp_code_edit"
            name="hp_code"
            value={editFormData.hp_code}
            onChange={(e) => handleInputChange(e, "edit")}
          />
          {formErrors.hp_code && (
            <p className="text-red-600 text-sm">{formErrors.hp_code}</p>
          )}
        </div>
        <div>
          <Label htmlFor="hp_type_edit">
            Type <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hp_type_edit"
            name="hp_type"
            value={editFormData.hp_type}
            onChange={(e) => handleInputChange(e, "edit")}
          />
          {formErrors.hp_type && (
            <p className="text-red-600 text-sm">{formErrors.hp_type}</p>
          )}
        </div>
        <div>
          <Label htmlFor="hp_description_edit">Description</Label>
          <textarea
            id="hp_description_edit"
            name="hp_description"
            value={editFormData.hp_description}
            onChange={(e) => handleInputChange(e, "edit")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formErrors.hp_description && (
            <p className="text-red-600 text-sm">{formErrors.hp_description}</p>
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
