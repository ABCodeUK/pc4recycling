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
import { CustomerType } from "./columns";
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

export default function CustomerTypes({ customerTypes }: { customerTypes: CustomerType[] }) {
  const [data, setData] = useState<CustomerType[]>(customerTypes);
  const [addFormData, setAddFormData] = useState({ ct_name: "" });
  const [editFormData, setEditFormData] = useState({ ct_name: "" });
  const [formErrors, setFormErrors] = useState({ ct_name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => setFormErrors({ ct_name: "" });

  const resetAddForm = () => {
    setAddFormData({ ct_name: "" });
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
      const response = await axios.post("/settings/variables/customer-types", addFormData);

      if (response.status === 200) {
        const newCustomerType = response.data;
        setData((prev) => [...prev, newCustomerType]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("Customer Type successfully created!");
      } else {
        toast.error("Failed to create Customer Type. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error creating Customer Type. Please check the logs.");
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
        `/settings/variables/customer-types/${editingId}`,
        editFormData
      );

      if (response.status === 200) {
        const updatedCustomerType = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedCustomerType : item))
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("Customer Type successfully updated!");
      } else {
        toast.error("Failed to update Customer Type. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("Error updating Customer Type. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/customer-types/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Customer Type successfully deleted!");
      } else {
        toast.error("Failed to delete Customer Type. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting Customer Type. Please check the logs.");
    }
  };

  const filteredData = data.filter((item) =>
    item.ct_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const customerType = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({ ct_name: customerType.ct_name });
                resetFormErrors();
                setEditingId(customerType.id);
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
                    Are you sure you want to delete Customer Type{" "}
                    <b>{customerType.ct_name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(customerType.id)}>
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
                <BreadcrumbLink href="/settings/variables/customer-types" >
                  Customer Types
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="customer-types" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Customer Types
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete Customer Types used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Customer Types..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="max-w-sm"
                />
<Dialog
  open={isAddDialogOpen}
  onOpenChange={(isOpen) => {
    if (!isOpen) resetAddForm(); // Reset form when the dialog is closed
    setIsAddDialogOpen(isOpen);
  }}
>
  <DialogTrigger asChild>
    <Button onClick={() => setIsAddDialogOpen(true)}>
      Add Customer Type
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px] bg-white">
    <DialogHeader>
      <DialogTitle>Add Customer Type</DialogTitle>
      <DialogDescription>
        Fill in the details for the new Customer Type below.
      </DialogDescription>
    </DialogHeader>
    <div className="bg-white border rounded-lg p-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="ct_name">
            Customer Type Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ct_name"
            name="ct_name"
            value={addFormData.ct_name}
            onChange={(e) => handleInputChange(e, "add")}
          />
          {formErrors.ct_name && (
            <p className="text-red-600 text-sm">{formErrors.ct_name}</p>
          )}
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          resetAddForm(); // Explicitly reset the form
          setIsAddDialogOpen(false);
        }}
      >
        Cancel
      </Button>
      <Button onClick={handleAddSubmit}>Create Customer Type</Button>
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
      <DialogTitle>Edit Customer Type</DialogTitle>
      <DialogDescription>
        Update the details for the Customer Type below.
      </DialogDescription>
    </DialogHeader>
    <div className="bg-white border rounded-lg p-6"> {/* Add Card Wrapper */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="ct_name_edit">
            Customer Type Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ct_name_edit"
            name="ct_name"
            value={editFormData.ct_name}
            onChange={(e) => handleInputChange(e, "edit")}
          />
          {formErrors.ct_name && (
            <p className="text-red-600 text-sm">{formErrors.ct_name}</p>
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