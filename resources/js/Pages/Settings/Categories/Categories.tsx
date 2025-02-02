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
import type { Option } from "@/Components/ui/multiple-select";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Category } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import MultipleSelector from "@/Components/ui/multiple-select";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
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

export default function Categories({ categories, ewcCodes, hpCodes, specFields }: { 
  categories: Category[];
  ewcCodes: { id: number; ewc_code: string }[];
  hpCodes: { id: number; hp_code: string; hp_type: string }[];
  specFields: { id: number; spec_name: string }[];
}) {
  const [data, setData] = useState<Category[]>(categories);
  const [addFormData, setAddFormData] = useState({
    name: "",
    default_weight: "",
    ewc_code_id: "",
    physical_form: "",
    concentration: "",
    chemical_component: "",
    container_type: "",
    hp_codes: [],
    spec_fields: [],
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    default_weight: "",
    ewc_code_id: "",
    physical_form: "",
    concentration: "",
    chemical_component: "",
    container_type: "",
    hp_codes: [],
    spec_fields: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetFormErrors = () => setFormErrors({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type = "add") => {
    const { name, value } = e.target;
    if (type === "add") {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string | number, type = "add") => {
    if (type === "add") {
      setAddFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelectChange = (name: string, values: number[], type = "add") => {
    if (type === "add") {
      setAddFormData((prev) => ({ ...prev, [name]: values }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: values }));
    }
  };

  const handleAddSubmit = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
      const response = await axios.post("/settings/categories", addFormData);
      if (response.status === 200) {
        setData((prev) => [...prev, response.data]);
        toast.success("Category successfully created!");
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      if ((error as any).response?.data?.errors) {
        setFormErrors((error as any).response.data.errors);
      } else {
        toast.error("Failed to create category. Please try again.");
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
      const response = await axios.put(`/settings/categories/${editingId}`, editFormData);
      if (response.status === 200) {
        const updatedCategory = response.data;
        setData((prev) =>
          prev.map((item) => (item.id === editingId ? updatedCategory : item))
        );
        toast.success("Category successfully updated!");
        setEditingId(null);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      if ((error as any).response?.data?.errors) {
        setFormErrors((error as any).response.data.errors);
      } else {
        toast.error("Failed to update category. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/settings/categories/${id}`);
      if (response.status === 200) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success("Category successfully deleted!");
      } else {
        toast.error("Failed to delete category. Please try again.");
      }
    } catch (error) {
      toast.error("Error deleting category. Please check the logs.");
    }
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        const category = row.original;
        return (
          <div className="flex justify-end space-x-2">
<Button
  variant="outline"
  size="sm"
  onClick={() => (window.location.href = `/settings/categories/${category.id}/edit`)}
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
                    Are you sure you want to delete category <b>{category.name}</b>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(category.id)}>
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
                <BreadcrumbLink href="/settings/categories" >
                  Categories
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Settings: Categories</div>
          <section className="bg-white border shadow rounded-lg p-6">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  Manage Categories
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or delete categories used in the system.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search Categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
<Dialog
  open={isAddDialogOpen}
  onOpenChange={(isOpen) => setIsAddDialogOpen(isOpen)}
>
  <DialogTrigger asChild>
    <Button>Add Category</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[800px] bg-white">
    <DialogHeader>
      <DialogTitle>Add Category</DialogTitle>
      <DialogDescription>
        Fill in the required details for the new category.
      </DialogDescription>
    </DialogHeader>
    <div className="grid grid-cols-2 gap-4 py-0">
      {/* Left Card */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Category Name*</Label>
            <Input
              id="name"
              name="name"
              value={addFormData.name}
              onChange={(e) => handleInputChange(e, "add")}
              required
            />
            {(formErrors as { name?: string }).name && (
              <p className="text-red-600 text-sm">{(formErrors as { name?: string }).name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="default_weight">Default Weight*</Label>
            <div className="relative flex items-center">
              <Input
                id="default_weight"
                name="default_weight"
                type="number"
                value={addFormData.default_weight}
                onChange={(e) => handleInputChange(e, "add")}
                required
                className="pr-10"
              />
              <span className="absolute right-3 text-sm text-gray-500">kg</span>
            </div>
            {(formErrors as { default_weight?: string }).default_weight && (
              <p className="text-red-600 text-sm">{(formErrors as { default_weight?: string }).default_weight}</p>
            )}
          </div>
          <div>
            <Label htmlFor="ewc_code_id">EWC Code*</Label>
            <Select
              value={addFormData.ewc_code_id}
              onValueChange={(value) =>
                handleSelectChange("ewc_code_id", value, "add")
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select EWC Code" />
              </SelectTrigger>
              <SelectContent>
                {ewcCodes.map((ewc) => (
                  <SelectItem key={ewc.id} value={ewc.id.toString()}>
                    {ewc.ewc_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(formErrors as { ewc_code_id?: string }).ewc_code_id && (
              <p className="text-red-600 text-sm">{(formErrors as { ewc_code_id?: string }).ewc_code_id}</p>
            )}
          </div>
          <div>
            <Label htmlFor="physical_form">Physical Form</Label>
            <Select
              value={addFormData.physical_form}
              onValueChange={(value) =>
                handleSelectChange("physical_form", value, "add")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Physical Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solid">Solid</SelectItem>
                <SelectItem value="Liquid">Liquid</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Sludge">Sludge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Right Card */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="concentration">Concentration</Label>
            <Input
              id="concentration"
              name="concentration"
              value={addFormData.concentration}
              onChange={(e) => handleInputChange(e, "add")}
            />
          </div>
          <div>
            <Label htmlFor="chemical_component">Chemical Component</Label>
            <Input
              id="chemical_component"
              name="chemical_component"
              value={addFormData.chemical_component}
              onChange={(e) => handleInputChange(e, "add")}
            />
          </div>
          <div>
            <Label htmlFor="container_type">Container Type</Label>
            <Input
              id="container_type"
              name="container_type"
              value={addFormData.container_type}
              onChange={(e) => handleInputChange(e, "add")}
            />
          </div>
          
          <MultipleSelector
            value={addFormData.hp_codes
              .map(id => {
                const hp = hpCodes.find(hp => hp.id === id);
                return hp ? { value: String(hp.id), label: `${hp.hp_code} - ${hp.hp_type}` } : null;
              })
              .filter((item): item is Option => item !== null)}
            options={hpCodes.map(hp => ({
              value: String(hp.id),
              label: `${hp.hp_code} - ${hp.hp_type}`
            }))}
            onChange={(values) =>
              handleMultiSelectChange(
                "hp_codes",
                values.map(item => Number(item.value)),
                "add"
              )
            }
            placeholder="Select HP Codes"
          />
          <div>
            <Label htmlFor="spec_fields">Spec Fields</Label>
            <MultipleSelector
              value={addFormData.spec_fields
                .map((id) => {
                const spec = specFields.find((sf) => sf.id === id);
                return spec ? { value: String(spec.id), label: spec.spec_name } : null;
              }).filter((item): item is Option => item !== null)}
              options={specFields.map((sf) => ({
                value: String(sf.id),
                label: sf.spec_name,
              }))}
              onChange={(values) =>
                handleMultiSelectChange(
                  "spec_fields",
                  values.map((item) => Number(item.value)),
                  "add"
                )
              }
              placeholder="Select Spec Fields"
            />
          </div>
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleAddSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Create Category"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
              </div>
            </header>
            <Separator className="my-4" />
            <DataTable columns={columnsWithActions} data={filteredData} />
          </section>
          {/* Edit dialog starts */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>
                  Update the required details for the category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange(e, "edit")}
                    required
                  />
                  {(formErrors as { name?: string }).name && (
<p className="text-red-600 text-sm">{(formErrors as { name?: string }).name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ewc_code_id">EWC Code*</Label>
                  <Select
                    value={editFormData.ewc_code_id}
                    onValueChange={(value) =>
                      handleSelectChange("ewc_code_id", value, "edit")
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select EWC Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {ewcCodes.map((ewc) => (
                        <SelectItem key={ewc.id} value={ewc.id.toString()}>
                          {ewc.ewc_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(formErrors as { ewc_code_id?: string }).ewc_code_id && (
<p className="text-red-600 text-sm">{(formErrors as { ewc_code_id?: string }).ewc_code_id}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="default_weight">Default Weight*</Label>
                  <Input
                    id="default_weight"
                    name="default_weight"
                    type="number"
                    value={editFormData.default_weight}
                    onChange={(e) => handleInputChange(e, "edit")}
                    required
                  />
                  {(formErrors as { default_weight?: string }).default_weight && (
                    <p className="text-red-600 text-sm">{(formErrors as { default_weight?: string }).default_weight}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="physical_form">Physical Form</Label>
                  <Select
                    value={editFormData.physical_form}
                    onValueChange={(value) =>
                      handleSelectChange("physical_form", value, "edit")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Physical Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solid">Solid</SelectItem>
                      <SelectItem value="Liquid">Liquid</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Sludge">Sludge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="concentration">Concentration</Label>
                  <Input
                    id="concentration"
                    name="concentration"
                    value={editFormData.concentration}
                    onChange={(e) => handleInputChange(e, "edit")}
                  />
                </div>
                <div>
                  <Label htmlFor="chemical_component">Chemical Component</Label>
                  <Input
                    id="chemical_component"
                    name="chemical_component"
                    value={editFormData.chemical_component}
                    onChange={(e) => handleInputChange(e, "edit")}
                  />
                </div>
                <div>
                  <Label htmlFor="container_type">Container Type</Label>
                  <Input
                    id="container_type"
                    name="container_type"
                    value={editFormData.container_type}
                    onChange={(e) => handleInputChange(e, "edit")}
                  />
                </div>
                <div>
                  <Label htmlFor="hp_codes">HP Codes</Label>
                  <MultipleSelector
                    value={editFormData.hp_codes.map((id) => {
                      const hp = hpCodes.find((hp) => hp.id === id);
                      return hp ? { value: String(hp.id), label: `${hp.hp_code} - ${hp.hp_type}` } : null;
                    }).filter((item): item is { value: string; label: string } => item !== null)}
                    options={hpCodes.map((hp) => ({
                      value: String(hp.id),
                      label: `${hp.hp_code} - ${hp.hp_type}`
                    }))}
                    onChange={(values) =>
                      handleMultiSelectChange(
                        "hp_codes",
                        values.map(item => Number(item.value)),
                        "edit"
                      )
                    }
                    placeholder="Select HP Codes"
                  />
                </div>
                <div>
                  <Label htmlFor="spec_fields">Spec Fields</Label>
                  <MultipleSelector
                    value={editFormData.spec_fields
                      .map((id) => {
                      const spec = specFields.find((sf) => sf.id === id);
                      return spec ? { value: String(spec.id), label: spec.spec_name } : null;
                    }).filter((item): item is Option => item !== null)}
                    options={specFields.map((sf) => ({
                      value: String(sf.id),
                      label: sf.spec_name,
                    }))}
                    onChange={(values) =>
                      handleMultiSelectChange(
                        "spec_fields",
                        values.map((item) => Number(item.value)),
                        "edit"
                      )
                    }
                    placeholder="Select Spec Fields"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setIsEditDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}