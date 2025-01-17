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
import { Role } from "./columns";
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
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function StaffRoles({ roles }: { roles: Role[] }) {
  const [data, setData] = useState<Role[]>(roles);
  const [addFormData, setAddFormData] = useState({ name: "" });
  const [editFormData, setEditFormData] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => setFormErrors({ name: "" });

  const resetAddForm = () => {
    setAddFormData({ name: "" });
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
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleAddSubmit = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
      const response = await axios.post("/settings/staff/roles", addFormData);

      if (response.status === 200) {
        const newRole = response.data;
        setData((prev) => [...prev, newRole]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("Role successfully created!");
      } else {
        toast.error("Failed to create role. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error creating role. Please check the logs.");
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
      const response = await axios.put(`/settings/staff/roles/${editingId}`, editFormData);

      if (response.status === 200) {
        const updatedRole = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedRole : item))
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("Role successfully updated!");
      } else {
        toast.error("Failed to update role. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error updating role. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/staff/roles/${id}`);
  
      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Role successfully deleted!");
      } else {
        toast.error(response.data.message || "Failed to delete role. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        // Display backend validation error message
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting role. Please check the logs.");
      }
    }
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const role = row.original;
  
        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({ name: role.name });
                resetFormErrors();
                setEditingId(role.id);
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
                  disabled={role.userCount > 0} // Disable if users are assigned
                  title={
                    role.userCount > 0
                      ? "Cannot delete a role with assigned users"
                      : undefined
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              {!role.userCount && (
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete role <b>{role.name}</b>? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(role.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              )}
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
                <BreadcrumbLink href="/settings/staff">Staff Accounts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/staff/roles">
                  Staff Roles
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">
                Settings: Staff Roles
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/settings/staff/")}
            >
                              <ArrowLeft className="h-6 w-6" />
              Staff Accounts
            </Button>
          </div>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
                           <div className="space-y-1">
                <h2 className="text-xl font-semibold">Manage Roles</h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete roles used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Roles..."
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
                    <Button onClick={() => setIsAddDialogOpen(true)}>Add New Role</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add New Role</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new role below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-white border rounded-lg p-6">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="name">Role Name</Label>
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
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetAddForm();
                          setIsAddDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubmit}>Create Role</Button>
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
                <DialogTitle>Edit Role</DialogTitle>
                <DialogDescription>
                  Update the details for the role below.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-white border rounded-lg p-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name_edit">Role Name</Label>
                    <Input
                      id="name_edit"
                      name="name"
                      value={editFormData.name}
                      onChange={(e) => handleInputChange(e, "edit")}
                    />
                    {formErrors.name && (
                      <p className="text-red-600 text-sm">{formErrors.name}</p>
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