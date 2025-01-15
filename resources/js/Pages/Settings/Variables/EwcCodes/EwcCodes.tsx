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
import { EwcCode } from "./columns";
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

export default function EwcCodes({ ewcCodes }: { ewcCodes: EwcCode[] }) {
  const [data, setData] = useState<EwcCode[]>(ewcCodes);
  const [addFormData, setAddFormData] = useState({
    ewc_code: "",
    ea_description: "",
  });
  const [editFormData, setEditFormData] = useState({
    ewc_code: "",
    ea_description: "",
  });
  const [formErrors, setFormErrors] = useState({
    ewc_code: "",
    ea_description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => {
    setFormErrors({ ewc_code: "", ea_description: "" });
  };

  const resetAddForm = () => {
    setAddFormData({ ewc_code: "", ea_description: "" });
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
    try {
      setIsSubmitting(true);
      const response = await axios.post("/settings/variables/ewc-codes", addFormData);

      if (response.status === 200) {
        const newCode = response.data;
        setData((prev) => [...prev, newCode]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("EWC Code successfully created!");
      } else {
        toast.error("Failed to create EWC Code. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error creating EWC Code. Please check the logs.");
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
      const response = await axios.put(`/settings/variables/ewc-codes/${editingId}`, editFormData);

      if (response.status === 200) {
        const updatedCode = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedCode : item))
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("EWC Code successfully updated!");
      } else {
        toast.error("Failed to update EWC Code. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error updating EWC Code. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/ewc-codes/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("EWC Code successfully deleted!");
      } else {
        toast.error("Failed to delete EWC Code. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting EWC Code. Please check the logs.");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.ewc_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ea_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const ewcCode = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({
                  ewc_code: ewcCode.ewc_code,
                  ea_description: ewcCode.ea_description,
                });
                resetFormErrors();
                setEditingId(ewcCode.id);
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
                    Are you sure you want to delete EWC Code <b>{ewcCode.ewc_code}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(ewcCode.id)}>
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
                <BreadcrumbLink href="/settings/variables/ewc-codes" >
                  EWC Codes
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="ewc-codes" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage EWC Codes
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete EWC codes used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search EWC Codes..."
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
                    <Button>Add EWC Code</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add EWC Code</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new EWC Code below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-white border rounded-lg p-6">
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="ewc_code">EWC Code</Label>
                          <Input
                            id="ewc_code"
                            name="ewc_code"
                            value={addFormData.ewc_code}
                            onChange={(e) => handleInputChange(e, "add")}
                          />
                          {formErrors.ewc_code && (
                            <p className="text-red-600 text-sm">{formErrors.ewc_code}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="ea_description">EA Description</Label>
                          <textarea
                            id="ea_description"
                            name="ea_description"
                            value={addFormData.ea_description}
                            onChange={(e) => handleInputChange(e, "add")}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {formErrors.ea_description && (
                            <p className="text-red-600 text-sm">{formErrors.ea_description}</p>
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
                      <Button onClick={handleAddSubmit}>Create EWC Code</Button>
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
                <DialogTitle>Edit EWC Code</DialogTitle>
                <DialogDescription>
                  Update the details for the EWC Code below.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-white border rounded-lg p-6">
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="ewc_code_edit">EWC Code</Label>
                    <Input
                      id="ewc_code_edit"
                      name="ewc_code"
                      value={editFormData.ewc_code}
                      onChange={(e) => handleInputChange(e, "edit")}
                    />
                    {formErrors.ewc_code && (
                      <p className="text-red-600 text-sm">{formErrors.ewc_code}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ea_description_edit">EA Description</Label>
                    <textarea
                      id="ea_description_edit"
                      name="ea_description"
                      value={editFormData.ea_description}
                      onChange={(e) => handleInputChange(e, "edit")}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {formErrors.ea_description && (
                      <p className="text-red-600 text-sm">{formErrors.ea_description}</p>
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