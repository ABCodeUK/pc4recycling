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
import { Client } from "./columns";
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
import { Eye, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ClientAccounts({
  clients,
  currentUserId,
}: {
  clients: {
    // ... other fields ...
    jobs_count: number; // Add this field to match the backend data
  }[];
  currentUserId: number;
}) {
  const [data, setData] = useState<Client[]>(clients as Client[]);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    contact_name: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    contact_name: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const resetFormErrors = () => setFormErrors({ name: "", email: "", contact_name: "" });

  const resetAddForm = () => {
    setAddFormData({
      name: "",
      email: "",
      contact_name: "",
    });
    resetFormErrors();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddSubmit = async () => {
    resetFormErrors();
    try {
        setIsSubmitting(true);
        const generatedPassword = Math.random().toString(36).slice(-8);
        
        // Create the request data
        const formData = {
            name: addFormData.name,
            email: addFormData.email,
            contact_name: addFormData.contact_name,
            password: generatedPassword,
            password_confirmation: generatedPassword,
        };
        
        const response = await axios.post("/customers/store", formData);
        
        if (response.data) {
            toast.success("Client successfully added!");
            setIsAddDialogOpen(false);
            resetAddForm();
            
            // Redirect to edit page
            if (response.data.id) {
                window.location.href = `/customers/${response.data.id}/edit`;
            }
        }
    } catch (error: any) {
        if (error.response?.data?.errors) {
            setFormErrors(error.response.data.errors);
            Object.values(error.response.data.errors).forEach((error: any) => {
                toast.error(error[0]);
            });
        } else {
            toast.error("Failed to add client.");
        }
    } finally {
        setIsSubmitting(false);
    }
};

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/customers/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Client successfully deleted!");
    } catch (error: any) {
      if (error.response?.data?.hasJobs) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error deleting client.");
      }
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
                (window.location.href = `/customers/${user.id}`)
              }
            >
              <Eye className="h-4 w-4" />
            </Button>
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
                <BreadcrumbLink href="/customers">Customers</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <h1 className="text-3xl font-semibold">Customers</h1>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">All Customers</h2>
                <p className="text-sm text-muted-foreground">
                  Below is a list of all customers on the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Customers..."
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
                    <Button>Add New Customer</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add new customer</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new client below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-white border rounded-lg p-6">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="name">Company Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={addFormData.name}
                            onChange={handleInputChange}
                          />
                          {formErrors.name && (
                            <p className="text-red-600 text-sm">{formErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="contact_name">Contact Name</Label>
                          <Input
                            id="contact_name"
                            name="contact_name"
                            value={addFormData.contact_name}
                            onChange={handleInputChange}
                            required
                          />
                          {formErrors.contact_name && (
                            <p className="text-red-600 text-sm">
                              {formErrors.contact_name}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            value={addFormData.email}
                            onChange={handleInputChange}
                          />
                          {formErrors.email && (
                            <p className="text-red-600 text-sm">{formErrors.email}</p>
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
                      <Button onClick={handleAddSubmit}>Create Client</Button>
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