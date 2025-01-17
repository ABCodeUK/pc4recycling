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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import MultipleSelector from "@/components/ui/multiple-select";
import SubCategories from "@/Pages/Settings/Categories/SubCategories/SubCategories";
import axios from "axios";
import { toast } from "sonner";
import { Save, Trash2, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function EditCategory({ category, ewcCodes, hpCodes, specFields }) {
  if (!category || !ewcCodes || !hpCodes || !specFields) {
    return <div>Loading...</div>;
  }

  const [formData, setFormData] = useState({
    name: category.name || "",
    default_weight: category.default_weight || "",
    ewc_code_id: category.ewc_code?.id || "",
    physical_form: category.physical_form || "",
    concentration: category.concentration || "",
    chemical_component: category.chemical_component || "",
    container_type: category.container_type || "",
    hp_codes: category.hp_codes?.map((hp) => hp.id) || [],
    spec_fields: category.spec_fields?.map((sf) => sf.id) || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name, values) => {
    setFormData((prev) => ({ ...prev, [name]: values }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(`/settings/categories/${category.id}`, formData);
      if (response.status === 200) {
        toast.success("Category successfully updated!");
      } else {
        toast.error("Failed to update category. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`/settings/categories/${category.id}`);
      if (response.status === 200) {
        toast.success("Category successfully deleted!");
        window.location.href = "/settings/categories"; // Redirect to Categories page
      } else {
        toast.error("Failed to delete category. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the category.");
    } finally {
      setIsDeleting(false);
    }
  };

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
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/categories">Categories</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" >
                  Edit Category
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-semibold text-gray-800">Settings: Edit Category</div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/settings/categories")}
              >
                <ArrowLeft className="h-6 w-6" />
                Done Editing
              </Button>
              <Button
                className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                <Save className="h-6 w-6" />
                Save Changes
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-6 w-6" />
                    Delete Category
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this category? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCategory}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <section className="grid grid-cols-2 gap-6 items-start">
 {/* Left Card */}
<div className="bg-white border shadow rounded-lg p-6">
  <div className="flex flex-col gap-4">
    <div>
      <Label htmlFor="name">Category Name*</Label>
      <Input
        id="name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
      />
    </div>
    <div>
      <Label htmlFor="default_weight">Default Weight*</Label>
      <div className="relative">
        <Input
          id="default_weight"
          name="default_weight"
          type="number"
          value={formData.default_weight}
          onChange={handleInputChange}
          required
          className="pr-12"
        />
        <span className="absolute inset-y-0 right-4 flex items-center text-gray-500">kg</span>
      </div>
    </div>
    <div>
      <Label htmlFor="ewc_code_id">EWC Code*</Label>
      <Select
        value={formData.ewc_code_id}
        onValueChange={(value) => handleSelectChange("ewc_code_id", value)}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Select EWC Code" />
        </SelectTrigger>
        <SelectContent>
          {ewcCodes.map((ewc) => (
            <SelectItem key={ewc.id} value={ewc.id}>
              {ewc.ewc_code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <Label htmlFor="physical_form">Physical Form</Label>
      <Select
        value={formData.physical_form}
        onValueChange={(value) => handleSelectChange("physical_form", value)}
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
            <div className="bg-white border shadow rounded-lg p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="concentration">Concentration</Label>
                  <Input
                    id="concentration"
                    name="concentration"
                    value={formData.concentration}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="chemical_component">Chemical Component</Label>
                  <Input
                    id="chemical_component"
                    name="chemical_component"
                    value={formData.chemical_component}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="container_type">Container Type</Label>
                  <Input
                    id="container_type"
                    name="container_type"
                    value={formData.container_type}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="hp_codes">HP Codes</Label>
                  <MultipleSelector
                    value={formData.hp_codes.map((id) => {
                      const hp = hpCodes.find((hp) => hp.id === id);
                      return hp
                        ? { value: hp.id, label: `${hp.hp_code} - ${hp.hp_type}` }
                        : null;
                    })}
                    options={hpCodes.map((hp) => ({
                      value: hp.id,
                      label: `${hp.hp_code} - ${hp.hp_type}`,
                    }))}
                    onChange={(values) =>
                      handleMultiSelectChange(
                        "hp_codes",
                        values.map((item) => item.value)
                      )
                    }
                    placeholder="Select HP Codes"
                  />
                </div>
                <div>
                  <Label htmlFor="spec_fields">Spec Fields</Label>
                  <MultipleSelector
                    value={formData.spec_fields.map((id) => {
                      const spec = specFields.find((sf) => sf.id === id);
                      return spec ? { value: spec.id, label: spec.spec_name } : null;
                    })}
                    options={specFields.map((sf) => ({
                      value: sf.id,
                      label: sf.spec_name,
                    }))}
                    onChange={(values) =>
                      handleMultiSelectChange(
                        "spec_fields",
                        values.map((item) => item.value)
                      )
                    }
                    placeholder="Select Spec

Fields"
                  />
                </div>
              </div>
            </div>
          </section>
          <section>
            <SubCategories parentId={category.id} />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}