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
import { LeadSource } from "./columns";
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

export default function LeadSources({ leadSources }: { leadSources: LeadSource[] }) {
  const [data, setData] = useState<LeadSource[]>(leadSources);
  const [addFormData, setAddFormData] = useState({ ls_name: "" });
  const [editFormData, setEditFormData] = useState({ ls_name: "" });
  const [formErrors, setFormErrors] = useState({ ls_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => setFormErrors({ ls_name: "" });

  const resetAddForm = () => {
    setAddFormData({ ls_name: "" });
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
      const response = await axios.post("/settings/variables/lead-sources", addFormData);

      if (response.status === 200) {
        const newLeadSource = response.data;
        setData((prev) => [...prev, newLeadSource]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("Lead Source successfully created!");
      } else {
        toast.error("Failed to create Lead Source. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error creating Lead Source. Please check the logs.");
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
        `/settings/variables/lead-sources/${editingId}`,
        editFormData
      );

      if (response.status === 200) {
        const updatedLeadSource = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedLeadSource : item))
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("Lead Source successfully updated!");
      } else {
        toast.error("Failed to update Lead Source. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error updating Lead Source. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/lead-sources/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Lead Source successfully deleted!");
      } else {
        toast.error("Failed to delete Lead Source. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting Lead Source. Please check the logs.");
    }
  };

  const filteredData = data.filter((item) =>
    (item?.ls_name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const leadSource = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({ ls_name: leadSource.ls_name });
                resetFormErrors();
                setEditingId(leadSource.id);
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
                    Are you sure you want to delete Lead Source{" "}
                    <b>{leadSource.ls_name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(leadSource.id)}>
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
                <BreadcrumbLink href="/settings/variables/lead-sources" >
                  Lead Sources
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="lead-sources" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Lead Sources
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete Lead Sources used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Lead Sources..."
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
                    <Button onClick={() => setIsAddDialogOpen(true)}>Add Lead Source</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add Lead Source</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new Lead Source below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper for Add Form */}
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="ls_name">
                            Lead Source Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="ls_name"
                            name="ls_name"
                            value={addFormData.ls_name}
                            onChange={(e) => handleInputChange(e, "add")}
                          />
                          {formErrors.ls_name && (
                            <p className="text-red-600 text-sm">{formErrors.ls_name}</p>
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
                      <Button onClick={handleAddSubmit}>Create Lead Source</Button>
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
                <DialogTitle>Edit Lead Source</DialogTitle>
                <DialogDescription>
                  Update the details for the Lead Source below.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper for Edit Form */}
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="ls_name_edit">
                      Lead Source Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ls_name_edit"
                      name="ls_name"
                      value={editFormData.ls_name}
                      onChange={(e) => handleInputChange(e, "edit")}
                    />
                    {formErrors.ls_name && (
                      <p className="text-red-600 text-sm">{formErrors.ls_name}</p>
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