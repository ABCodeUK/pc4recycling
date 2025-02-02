import { useState, useEffect } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
} from "@/Components/ui/select";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Staff } from "./columns";
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
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function StaffAccounts({
  staff,
  currentUserId,
}: {
  staff: Staff[];
  currentUserId: number;
}) {
  const [data, setData] = useState<Staff[]>(staff);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    role_id: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    role_id: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("/settings/staff/roles");
        if (Array.isArray(response.data)) {
          setRoles(response.data);
        } else {
          console.error("Roles API did not return an array.");
          toast.error("Failed to fetch roles. Please contact support.");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to fetch roles. Please try again.");
      }
    };

    fetchRoles();
  }, []);

  const resetFormErrors = () =>
    setFormErrors({ name: "", email: "", role_id: "" });

  const resetAddForm = () => {
    setAddFormData({
      name: "",
      email: "",
      role_id: "",
    });
    resetFormErrors();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddSubmit = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
      const response = await axios.post("/settings/staff/store", addFormData);
      if (response.status === 200) {
        const newStaff = response.data;
        setData((prev) => [...prev, newStaff]);
        toast.success("Staff member successfully added!");
        setIsAddDialogOpen(false);
      } else {
        toast.error("Failed to add staff member. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error adding staff member. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/staff/delete/${id}`);
      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Staff member successfully deleted!");
      } else {
        toast.error("Failed to delete staff member. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting staff member. Please check the logs.");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const user = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                (window.location.href =
                  user.id === currentUserId
                    ? "/my-account/"
                    : `/settings/staff/${user.id}/edit`)
              }
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={user.id === currentUserId}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <b>{user.name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(user.id)}>
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
                <BreadcrumbLink href="/settings/staff">
                  Staff Accounts
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">
                Settings: Staff Accounts
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/settings/staff/roles/")}
            >
              Manage Staff Roles
            </Button>
          </div>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Manage Staff Accounts</h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete staff accounts used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Staff..."
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
                    <Button>Add Staff Account</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add Staff Account</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new staff member below.
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
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
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
                            value={addFormData.email}
                            onChange={(e) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                          />
                          {formErrors.email && (
                            <p className="text-red-600 text-sm">{formErrors.email}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="role_id">Role</Label>
                          <Select
                            onValueChange={(value) =>
                              setAddFormData((prev) => ({
                                ...prev,
                                role_id: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.role_id && (
                            <p className="text-red-600 text-sm">
                              {formErrors.role_id}
                            </p>
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
                      <Button onClick={handleAddSubmit}>Create Staff</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </header>
            <Separator className="my-4" />
            <DataTable columns={columnsWithActions} data={filteredData} />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}