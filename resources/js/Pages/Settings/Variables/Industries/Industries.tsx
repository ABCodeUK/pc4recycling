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
import { Industry } from "./columns";
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

export default function Industries({ industries }: { industries: Industry[] }) {
  const [data, setData] = useState<Industry[]>(industries);
  const [addFormData, setAddFormData] = useState({ in_name: "" });
  const [editFormData, setEditFormData] = useState({ in_name: "" });
  const [formErrors, setFormErrors] = useState({ in_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => setFormErrors({ in_name: "" });

  const resetAddForm = () => {
    setAddFormData({ in_name: "" });
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
      const response = await axios.post("/settings/variables/industries", addFormData);

      if (response.status === 200) {
        const newIndustry = response.data;
        setData((prev) => [...prev, newIndustry]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("Industry successfully created!");
      } else {
        toast.error("Failed to create Industry. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error creating Industry. Please check the logs.");
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
        `/settings/variables/industries/${editingId}`,
        editFormData
      );

      if (response.status === 200) {
        const updatedIndustry = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedIndustry : item))
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("Industry successfully updated!");
      } else {
        toast.error("Failed to update Industry. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error updating Industry. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/industries/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Industry successfully deleted!");
      } else {
        toast.error("Failed to delete Industry. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting Industry. Please check the logs.");
    }
  };

  const filteredData = data.filter((item) =>
    item.in_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const industry = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({ in_name: industry.in_name });
                resetFormErrors();
                setEditingId(industry.id);
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
                    Are you sure you want to delete Industry{" "}
                    <b>{industry.in_name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(industry.id)}>
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
                <BreadcrumbLink href="/settings/variables/industries" >
                  Industrys
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="industries" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Industrys
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete Industrys used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Industrys..."
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
    <Button onClick={() => setIsAddDialogOpen(true)}>Add Industry</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px] bg-white">
    <DialogHeader>
      <DialogTitle>Add Industry</DialogTitle>
      <DialogDescription>
        Fill in the details for the new Industry below.
      </DialogDescription>
    </DialogHeader>
    <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper for Add Form */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="in_name">
            Industry Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="in_name"
            name="in_name"
            value={addFormData.in_name}
            onChange={(e) => handleInputChange(e, "add")}
          />
          {formErrors.in_name && (
            <p className="text-red-600 text-sm">{formErrors.in_name}</p>
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
      <Button onClick={handleAddSubmit}>Create Industry</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
              </div>
            </header>
            <Separator className="my-4" />
            <DataTable columns={columnsWithActions} data={filteredData} />
          </section>

{/* Edit Form Dialog */}
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="sm:max-w-[425px] bg-white">
    <DialogHeader>
      <DialogTitle>Edit Industry</DialogTitle>
      <DialogDescription>
        Update the details for the Industry below.
      </DialogDescription>
    </DialogHeader>
    <div className="bg-white border rounded-lg p-6"> {/* Card Wrapper for Edit Form */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="in_name_edit">
            Industry Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="in_name_edit"
            name="in_name"
            value={editFormData.in_name}
            onChange={(e) => handleInputChange(e, "edit")}
          />
          {formErrors.in_name && (
            <p className="text-red-600 text-sm">{formErrors.in_name}</p>
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