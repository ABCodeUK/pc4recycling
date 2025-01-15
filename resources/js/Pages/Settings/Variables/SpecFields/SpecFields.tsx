import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { SpecField } from "./columns";
import VariablesNavigation from "@/Pages/Settings/Variables/variablesnavigation";
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

export default function SpecFields({ specFields }: { specFields: SpecField[] }) {
  const [data, setData] = useState<SpecField[]>(() => {
    return [...specFields].sort((a, b) =>
      b.spec_default - a.spec_default || a.spec_order - b.spec_order
    );
  });

  const [addFormData, setAddFormData] = useState({
    spec_name: "",
    spec_order: "",
    spec_default: false,
  });
  const [editFormData, setEditFormData] = useState({
    spec_name: "",
    spec_order: "",
    spec_default: false,
  });
  const [formErrors, setFormErrors] = useState({
    spec_name: "",
    spec_order: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => {
    setFormErrors({ spec_name: "", spec_order: "" });
  };

  const resetAddForm = () => {
    setAddFormData({
      spec_name: "",
      spec_order: "",
      spec_default: false,
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
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddSubmit = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
      const response = await axios.post("/settings/variables/spec-fields", addFormData);

      if (response.status === 200) {
        const newField = response.data;
        setData((prev) => [...prev, newField].sort(sortData));
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("Spec Field successfully created!");
      } else {
        toast.error("Failed to create Spec Field. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error creating Spec Field. Please check the logs.");
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
      const response = await axios.put(
        `/settings/variables/spec-fields/${editingId}`,
        editFormData
      );

      if (response.status === 200) {
        const updatedField = response.data;
        setData((prev) =>
          [...prev.map((item) => (item.id === editingId ? updatedField : item))].sort(sortData)
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("Spec Field successfully updated!");
      } else {
        toast.error("Failed to update Spec Field. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error updating Spec Field. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/spec-fields/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id).sort(sortData));
        toast.success("Spec Field successfully deleted!");
      } else {
        toast.error("Failed to delete Spec Field. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting Spec Field. Please check the logs.");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.spec_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.spec_order.toString().includes(searchTerm.toLowerCase())
  );

  const sortData = (a: SpecField, b: SpecField) =>
    b.spec_default - a.spec_default || a.spec_order - b.spec_order;

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        const specField = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={specField.spec_default}
              className={specField.spec_default ? "opacity-50 cursor-not-allowed" : ""}
              onClick={() => {
                setEditFormData({
                  spec_name: specField.spec_name,
                  spec_order: specField.spec_order,
                  spec_default: specField.spec_default,
                });
                resetFormErrors();
                setEditingId(specField.id);
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
                  disabled={specField.spec_default}
                  className={specField.spec_default ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete Spec Field{" "}
                    <b>{specField.spec_name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(specField.id)}>
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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/variables">
                  Variables
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/variables/spec-fields" >
                  Spec Fields
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="spec-fields" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Spec Fields
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete Spec Fields used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Spec Fields..."
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
                    <Button onClick={() => setIsAddDialogOpen(true)}>Add Spec Field</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add Spec Field</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new Spec Field below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper */}
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="spec_name">
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="spec_name"
                            name="spec_name"
                            value={addFormData.spec_name}
                            onChange={(e) => handleInputChange(e, "add")}
                          />
                          {formErrors.spec_name && (
                            <p className="text-red-600 text-sm">{formErrors.spec_name}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="spec_order">
                            Order <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="spec_order"
                            name="spec_order"
                            value={addFormData.spec_order}
                            onChange={(e) => handleInputChange(e, "add")}
                          />
                          {formErrors.spec_order && (
                            <p className="text-red-600 text-sm">{formErrors.spec_order}</p>
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
                      <Button onClick={handleAddSubmit}>Create Spec Field</Button>
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
                <DialogTitle>Edit Spec Field</DialogTitle>
                <DialogDescription>
                  Update the details for the Spec Field below.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper */}
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="spec_name_edit">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="spec_name_edit"
                      name="spec_name"
                      value={editFormData.spec_name}
                      onChange={(e) => handleInputChange(e, "edit")}
                    />
                    {formErrors.spec_name && (
                      <p className="text-red-600 text-sm">{formErrors.spec_name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="spec_order_edit">
                      Order <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="spec_order_edit"
                      name="spec_order"
                      value={editFormData.spec_order}
                      onChange={(e) => handleInputChange(e, "edit")}
                    />
                    {formErrors.spec_order && (
                      <p className="text-red-600 text-sm">{formErrors.spec_order}</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                  }}
                >
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