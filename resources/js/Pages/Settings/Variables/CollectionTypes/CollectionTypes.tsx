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
import { CollectionType } from "./columns";  // Change from collectionType to CollectionType
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

export default function CollectionTypes({ collectionTypes }: { collectionTypes: CollectionType[] }) {
  const [data, setData] = useState<CollectionType[]>(collectionTypes);
  const [addFormData, setAddFormData] = useState({ 
    colt_name: "",
    colt_description: "" 
  });
  const [editFormData, setEditFormData] = useState({ 
    colt_name: "",
    colt_description: "" 
  });
  const [formErrors, setFormErrors] = useState({ 
    colt_name: "",
    colt_description: "" 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => setFormErrors({ 
    colt_name: "",
    colt_description: "" 
  });

  const resetAddForm = () => {
    setAddFormData({ 
      colt_name: "",
      colt_description: "" 
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleAddSubmit = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
      console.log('Form data being submitted:', {
        name: addFormData.colt_name,
        description: addFormData.colt_description,
        fullData: addFormData
      });
      
      const response = await axios.post("/settings/variables/collection-types", addFormData);

      if (response.status === 200) {
        const newCollectionType = response.data;
        setData((prev) => [...prev, newCollectionType]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("Collection Type successfully created!");
      } else {
        toast.error("Failed to create Collection Type. Please try again.");
      }
    } catch (error: any) {
      console.error('Error response:', error.response?.data);  // Add this line
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error creating Collection Type. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;

    resetFormErrors();
    try {
      setIsSubmitting(true);
      console.log('Updating data:', editFormData); // Add this line
      const response = await axios.put(
        `/settings/variables/collection-types/${editingId}`,
        editFormData
      );

      if (response.status === 200) {
        const updatedCollectionType = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedCollectionType : item))
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("Collection Type successfully updated!");
      } else {
        toast.error("Failed to update Collection Type. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error updating Collection Type. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/collection-types/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Collection Type successfully deleted!");
      } else {
        toast.error("Failed to delete Collection Type. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting Collection Type. Please check the logs.");
    }
  };

  const filteredData = data.filter((item) =>
    (item?.colt_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item?.colt_description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const collectionType = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({ 
                  colt_name: collectionType.colt_name,
                  colt_description: collectionType.colt_description || "" 
                });
                resetFormErrors();
                setEditingId(collectionType.id);
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
                    Are you sure you want to delete Collection Type{" "}
                    <b>{collectionType.colt_name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(collectionType.id)}>
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
                <BreadcrumbLink href="/settings/variables/collection-types" >
                  Collection Types
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="collection-types" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Collection Types
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete Collection Types used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Collection Types..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) resetAddForm();
                    setIsAddDialogOpen(isOpen);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsAddDialogOpen(true)}>Add Collection Type</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add Collection Type</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new Collection Type below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-white border rounded-lg p-6">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="colt_name">
                            Collection Type Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="colt_name"
                            name="colt_name"
                            value={addFormData.colt_name}
                            onChange={(e) => handleInputChange(e, "add")}
                          />
                          {formErrors.colt_name && (
                            <p className="text-red-600 text-sm">{formErrors.colt_name}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="colt_description">
                            Description
                          </Label>
                          <Input
                            id="colt_description"
                            name="colt_description"
                            value={addFormData.colt_description}
                            onChange={(e) => handleInputChange(e, "add")}
                          />
                          {formErrors.colt_description && (
                            <p className="text-red-600 text-sm">{formErrors.colt_description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetAddForm(); // Clear form on Cancel
                          setIsAddDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubmit}>Create Collection Type</Button>
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
                <DialogTitle>Edit Collection Type</DialogTitle>
                <DialogDescription>
                  Update the details for the Collection Type below.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper for Edit Form */}
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="colt_name_edit">
                      Collection Type Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="colt_name_edit"
                      name="colt_name"
                      value={editFormData.colt_name}
                      onChange={(e) => handleInputChange(e, "edit")}
                    />
                    {formErrors.colt_name && (
                      <p className="text-red-600 text-sm">{formErrors.colt_name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="colt_description_edit">
                      Description
                    </Label>
                    <Input
                      id="colt_description_edit"
                      name="colt_description"
                      value={editFormData.colt_description}
                      onChange={(e) => handleInputChange(e, "edit")}
                    />
                    {formErrors.colt_description && (
                      <p className="text-red-600 text-sm">{formErrors.colt_description}</p>
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