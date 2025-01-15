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
import axios from "axios";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";

export default function ClientAccountsEdit({
  user_edit,
}: {
  user_edit: {
    id: number;
    name: string;
    email: string;
    landline?: string;
    mobile?: string;
    position?: string;
    active?: boolean;
  };
}) {
  if (!user_edit) {
    return <div>Loading...</div>;
  }

  const [formData, setFormData] = useState({
    name: user_edit.name || "",
    email: user_edit.email || "",
    landline: user_edit.landline || "",
    mobile: user_edit.mobile || "",
    position: user_edit.position || "",
    active: user_edit.active || false,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormErrors = () => setFormErrors({ name: "", email: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    resetFormErrors();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveChanges = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
      const response = await axios.put(`/customers/update/${user_edit.id}`, formData);

      if (response.status === 200) {
        toast.success("Client successfully updated!");
      } else {
        toast.error("Failed to update client. Please try again.");
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("An error occurred while updating the client.");
      }
    } finally {
      setIsSubmitting(false);
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
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/customers">Clients</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">
                  Edit Customer
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">
            Customers : Edit Customer
          </div>
          <section className="bg-white border shadow rounded-lg p-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-600 text-sm">{formErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.email && (
                  <p className="text-red-600 text-sm">{formErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="landline">Landline</Label>
                <Input
                  id="landline"
                  name="landline"
                  value={formData.landline}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleCheckboxChange}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/customers")}
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to List
                </Button>
                <Button
                  className="bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                  onClick={handleSaveChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}