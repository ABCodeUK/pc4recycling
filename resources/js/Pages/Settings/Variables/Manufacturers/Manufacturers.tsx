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
import { Manufacturer } from "./columns";
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

const DEFAULT_LOGO_PLACEHOLDER = "/placeholder-logo.png";

export default function Manufacturers({ manufacturers }: { manufacturers: Manufacturer[] }) {
  const [data, setData] = useState<Manufacturer[]>(manufacturers);
  const [addFormData, setAddFormData] = useState({
    manufacturer_name: "",
    manufacturer_logo: null as File | null,
    manufacturer_url: "",
  });
  const [editFormData, setEditFormData] = useState({
    manufacturer_name: "",
    manufacturer_logo: null as File | null,
    manufacturer_url: "",
    existing_logo: "",
  });
  const [formErrors, setFormErrors] = useState({
    manufacturer_name: "",
    manufacturer_logo: "",
    manufacturer_url: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const resetFormErrors = () => {
    setFormErrors({ manufacturer_name: "", manufacturer_logo: "", manufacturer_url: "" });
  };

  const resetAddForm = () => {
    setAddFormData({
      manufacturer_name: "",
      manufacturer_logo: null,
      manufacturer_url: "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "add" | "edit") => {
    const file = e.target.files?.[0] || null;
    if (type === "add") {
      setAddFormData((prev) => ({ ...prev, manufacturer_logo: file }));
    } else {
      setEditFormData((prev) => ({ ...prev, manufacturer_logo: file }));
    }
    setFormErrors((prev) => ({ ...prev, manufacturer_logo: "" }));
  };

  const handleRemoveLogo = () => {
    setEditFormData((prev) => ({ ...prev, manufacturer_logo: null, existing_logo: "" }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddSubmit = async () => {
    resetFormErrors();
    const formData = new FormData();
    formData.append("manufacturer_name", addFormData.manufacturer_name);
    if (addFormData.manufacturer_logo) {
      formData.append("manufacturer_logo", addFormData.manufacturer_logo);
    }
    formData.append("manufacturer_url", addFormData.manufacturer_url);

    try {
      setIsSubmitting(true);
      const response = await axios.post("/settings/variables/manufacturers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        const newManufacturer = response.data;
        setData((prev) => [...prev, newManufacturer]);
        resetAddForm();
        setIsAddDialogOpen(false);
        toast.success("Manufacturer successfully created!");
      } else {
        toast.error("Failed to create Manufacturer. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error creating Manufacturer. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingId) return;

    resetFormErrors();
    const formData = new FormData();
    formData.append("manufacturer_name", editFormData.manufacturer_name);

    if (editFormData.manufacturer_logo) {
      formData.append("manufacturer_logo", editFormData.manufacturer_logo);
    }
    if (!editFormData.existing_logo && !editFormData.manufacturer_logo) {
      formData.append("remove_logo", "true");
    }

    formData.append("manufacturer_url", editFormData.manufacturer_url || "");

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `/settings/variables/manufacturers/${editingId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        const updatedManufacturer = response.data;
        setData((prev) =>
          prev.map((item) =>
            item.id === editingId ? updatedManufacturer : item
          )
        );
        setEditingId(null);
        setIsEditDialogOpen(false);
        toast.success("Manufacturer successfully updated!");
      } else {
        toast.error("Failed to update Manufacturer. Please try again.");
      }
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("Error updating Manufacturer. Please check the logs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/variables/manufacturers/${id}`);

      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Manufacturer successfully deleted!");
      } else {
        toast.error("Failed to delete Manufacturer. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting Manufacturer. Please check the logs.");
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.manufacturer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns.filter((col) => col.id !== "manufacturer_url"),
    {
      id: "manufacturer_url",
      header: "Website",
      accessorKey: "manufacturer_url",
      cell: ({ row }: { row: any }) => (
        <a
          href={row.original.manufacturer_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={row.original.manufacturer_url ? "text-blue-500 underline" : "text-gray-500"}
        >
          {row.original.manufacturer_url || ""}
        </a>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }: { row: any }) => {
        const manufacturer = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditFormData({
                  manufacturer_name: manufacturer.manufacturer_name,
                  manufacturer_logo: null,
                  manufacturer_url: manufacturer.manufacturer_url || "",
                  existing_logo: manufacturer.manufacturer_logo || DEFAULT_LOGO_PLACEHOLDER,
                });
                setEditingId(manufacturer.id);
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
                    Are you sure you want to delete Manufacturer{" "}
                    <b>{manufacturer.manufacturer_name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(manufacturer.id)}>
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
                <BreadcrumbLink href="/settings/variables/manufacturers" >
                  Manufacturers
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Settings: Variables</div>
          <VariablesNavigation currentTab="manufacturers" />
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Manufacturers
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete manufacturers.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Manufacturers..."
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
                    <Button onClick={() => setIsAddDialogOpen(true)}>Add Manufacturer</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Add Manufacturer</DialogTitle>
                      <DialogDescription>
                        Recommended logo size: 100x100 pixels.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="manufacturer_name">
                          Name<span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="manufacturer_name"
                          name="manufacturer_name"
                          value={addFormData.manufacturer_name}
                          onChange={(e) => handleInputChange(e, "add")}
                        />
                        {formErrors.manufacturer_name && (
                          <p className="text-red-600 text-sm">{formErrors.manufacturer_name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="manufacturer_logo">Logo</Label>
                        <Input
                          type="file"
                          id="manufacturer_logo"
                          name="manufacturer_logo"
                          onChange={(e) => handleFileChange(e, "add")}
                        />
                        {formErrors.manufacturer_logo && (
                          <p className="text-red-600 text-sm">{formErrors.manufacturer_logo}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="manufacturer_url">Website</Label>
                        <Input
                          id="manufacturer_url"
                          name="manufacturer_url"
                          value={addFormData.manufacturer_url}
                          onChange={(e) => handleInputChange(e, "add")}
                        />
                        {formErrors.manufacturer_url && (
                          <p className="text-red-600 text-sm">{formErrors.manufacturer_url}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubmit}>Create Manufacturer</Button>
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
                <DialogTitle>Edit Manufacturer</DialogTitle>
                <DialogDescription>
                  Recommended logo size: 100x100 pixels.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="manufacturer_name_edit">
                    Name<span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="manufacturer_name_edit"
                    name="manufacturer_name"
                    value={editFormData.manufacturer_name}
                    onChange={(e) => handleInputChange(e, "edit")}
                  />
                  {formErrors.manufacturer_name && (
                    <p className="text-red-600 text-sm">{formErrors.manufacturer_name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="manufacturer_logo_edit">Logo</Label>
                  {editFormData.existing_logo && (
                    <div className="flex items-center gap-4">
                      <img
                        src={editFormData.existing_logo}
                        alt="Current logo"
                        className="w-16 h-16 object-contain border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveLogo}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {!editFormData.existing_logo && (
                    <Input
                      type="file"
                      id="manufacturer_logo_edit"
                      name="manufacturer_logo"
                      onChange={(e) => handleFileChange(e, "edit")}
                    />
                  )}
                  {formErrors.manufacturer_logo && (
                    <p className="text-red-600 text-sm">{formErrors.manufacturer_logo}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="manufacturer_url_edit">Website</Label>
                  <Input
                    id="manufacturer_url_edit"
                    name="manufacturer_url"
                    value={editFormData.manufacturer_url}
                    onChange={(e) => handleInputChange(e, "edit")}
                  />
                  {formErrors.manufacturer_url && (
                    <p className="text-red-600 text-sm">{formErrors.manufacturer_url}</p>
                  )}
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