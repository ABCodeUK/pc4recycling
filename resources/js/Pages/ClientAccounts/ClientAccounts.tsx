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
import { Client } from "./columns";
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
import { Menu, Eye, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function ClientAccounts({
  clients,
  currentUserId,
}: {
  clients: Client[];
  currentUserId: number;
}) {
  const [data, setData] = useState<Client[]>(clients);
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
      const response = await axios.post("/customers/store", addFormData);
      if (response.status === 200) {
        const newClient = response.data;
        setData((prev) => [...prev, newClient]);
        toast.success("Client successfully added!");
        setIsAddDialogOpen(false);

        if (newClient.id) {
          window.location.href = `/customers/${newClient.id}/edit`;
        } else {
          console.error("New client ID is missing");
        }
      } else {
        toast.error("Failed to add client. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error adding client. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/customers/delete/${id}`);
      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Client successfully deleted!");
      } else {
        toast.error("Failed to delete client. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting client. Please check the logs.");
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
                (window.location.href = `/customers/${user.id}/edit`)
              }
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                (window.location.href = `/customers/${user.id}`)
              }
            >
              <Menu className="h-4 w-4" />
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