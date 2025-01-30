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
import UserAddresses from "@/Pages/ClientAccounts/Address/ClientAddresses";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import axios from "axios";
import { toast } from "sonner";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import ClientJobs from "@/Pages/ClientAccounts/Jobs/ClientJobs";
// Add this with other imports at the top
import ClientSubClients from "@/Pages/ClientAccounts/SubClients/ClientSubClients";

export default function ClientAccountsEdit({
  user_edit,
  client_details,
  customer_types,
  industries,
  lead_sources,
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
  client_details: {
    customer_type_id?: number | null;
    industry_id?: number | null;
    address?: string | null;
    town_city?: string | null;
    county?: string | null;
    postcode?: string | null;
    contact_name?: string | null;
    sic_code?: string | null;
    customer_notes?: string | null;
  };
  customer_types: { id: number; ct_name: string }[];
  industries: { id: number; in_name: string }[];
  lead_sources: { id: number; in_name: string }[];
}) {
  if (!user_edit || !client_details || !customer_types || !industries) {
    return <div>Loading...</div>;
  }

  const [formData, setFormData] = useState({
    name: user_edit.name || "",
    email: user_edit.email || "",
    position: user_edit.position || "",
    landline: user_edit.landline || "",
    mobile: user_edit.mobile || "",
    active: user_edit.active || false,
    address: client_details.address || "",
    town_city: client_details.town_city || "",
    county: client_details.county || "",
    postcode: client_details.postcode || "",
    contact_name: client_details.contact_name || "",
    sic_code: client_details.sic_code || "",
    customer_notes: client_details.customer_notes || "",
    customer_type_id: String(client_details.customer_type_id) || "",
    industry_id: String(client_details.industry_id) || "",
    lead_source_id: String(client_details.lead_source_id) || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormErrors = () =>
    setFormErrors({ name: "", email: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    resetFormErrors();
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };
  const handleSaveChanges = async () => {
    resetFormErrors();
    try {
      setIsSubmitting(true);
  
      // Prepare data for the backend
      const payload = {
        ...formData,
        customer_type_id: formData.customer_type_id || null, // Send null if not selected
        industry_id: formData.industry_id || null, // Send null if not selected
      };
  
      const response = await axios.put(`/customers/update/${user_edit.id}`, payload);
  
      if (response.status === 200) {
        toast.success("Client successfully updated!");
      } else {
        toast.error("Failed to update client. Please try again.");
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error("An error occurred while updating the client.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `/customers/delete/${user_edit.id}`
      );
      if (response.status === 200) {
        toast.success("Client account successfully deleted!");
        window.location.href = "/customers";
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the account.");
    }
  };

  const handleSendResetEmail = async () => {
    try {
      const response = await axios.post(`/customers/${user_edit.id}/send-reset-email`);

      if (response.status === 200) {
        toast.success("Password reset email sent successfully.");
      } else {
        toast.error("Failed to send password reset email.");
      }
    } catch (error) {
      toast.error("An error occurred while sending the password reset email.");
    }
  };

  const handleManualPasswordReset = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await axios.post(`/customers/${user_edit.id}/reset-password`, {
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
      });
      toast.success("Password reset successfully.");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err: any) => {
          toast.error(err[0]);
        });
      } else {
        toast.error("An error occurred while resetting the password.");
      }
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
                <BreadcrumbLink href="/customers">Customers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Edit Customer</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">
                Settings: Edit Customer Account
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = `/customers/${user_edit.id}`)}
              >
                <ArrowLeft className="h-6 w-6 mr-0" />
                Done Editing
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
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-6 p-0">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
    {/* Left Card: Customer Details */}
    <section className="bg-white border shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold leading-7 text-gray-900 flex justify-between items-center">
        Customer Details
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Account Status:</span>
          <span className={`text-sm px-4 py-1 rounded-sm ${formData.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-medium`}>
            {formData.active ? 'Active' : 'Disabled'}
          </span>
        </div>
      </h2>
      <Separator className="my-4" />
      <div className="grid gap-4 mt-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="name" className="text-left">Company Name*</Label>
          <div className="col-span-2">
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="address" className="text-left">Address</Label>
          <div className="col-span-2">
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="town_city" className="text-left">Town/City</Label>
          <div className="col-span-2">
            <Input
              id="town_city"
              name="town_city"
              value={formData.town_city}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="county" className="text-left">County</Label>
          <div className="col-span-2">
            <Input
              id="county"
              name="county"
              value={formData.county}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="postcode" className="text-left">Postcode</Label>
          <div className="col-span-2">
            <Input
              id="postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="contact_name" className="text-left">Contact Name</Label>
          <div className="col-span-2">
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="position" className="text-left">Position</Label>
          <div className="col-span-2">
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="landline" className="text-left">Landline</Label>
          <div className="col-span-2">
            <Input
              id="landline"
              name="landline"
              value={formData.landline}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="mobile" className="text-left">Mobile</Label>
          <div className="col-span-2">
            <Input
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="email" className="text-left">Email*</Label>
          <div className="col-span-2">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
          </div>
        </div>
      </div>
    </section>

    {/* Right Card: More Details */}
    <section className="bg-white border shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold leading-7 text-gray-900">More Details</h2>
      <Separator />
      <div className="grid gap-4 mt-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="lead_source_id" className="text-left">Lead Source</Label>
          <div className="col-span-2">
            <Select
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, lead_source_id: value }))
              }
              value={String(formData.lead_source_id || "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Lead Source">
                  {lead_sources.find((source) => String(source.id) === formData.lead_source_id)?.ls_name || "Select Lead Source"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {lead_sources.map((source) => (
                  <SelectItem key={source.id} value={String(source.id)}>
                    {source.ls_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="industry_id" className="text-left">Industry</Label>
          <div className="col-span-2">
            <Select
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, industry_id: value }))
              }
              value={String(formData.industry_id || "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Industry">
                  {industries.find((industry) => String(industry.id) === formData.industry_id)?.in_name || "Select Industry"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.id} value={String(industry.id)}>
                    {industry.in_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="sic_code" className="text-left">SIC Code</Label>
          <div className="col-span-2">
            <Input
              id="sic_code"
              name="sic_code"
              value={formData.sic_code}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="customer_notes" className="text-left">Customer Notes</Label>
          <div className="col-span-2">
            <Input
              id="customer_notes"
              name="customer_notes"
              value={formData.customer_notes}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </section>
  </div>
          <section>
            <ClientJobs parentId={user_edit.id} />
            <div className="mt-6">
              <UserAddresses parentId={user_edit.id} />
            </div>
            <div className="mt-6">
              <ClientSubClients parentId={user_edit.id} />
            </div>
          </section>
  {/* Full-Width Account Settings Card */}
  <section className="bg-white border shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold leading-7 text-gray-900">Account Settings</h2>
    <Separator className="mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Reset Password */}
      <div className="rounded-lg border p-4">
        <h3 className="text-base font-medium">Reset Password</h3>
        <p className="text-sm text-muted-foreground">Reset the client's password.</p>
        <div className="mt-4 space-y-2">
          <Button variant="outline" onClick={handleSendResetEmail}>
            Email Password Reset
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Manual Password Reset</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Manual Password Reset</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter the new password below to manually reset the client's password.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleManualPasswordReset}>
                  Save
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Disable Account */}
      <div className="rounded-lg border p-4">
        <h3 className="text-base font-medium">Disable Account</h3>
        <p className="text-sm text-muted-foreground">
          Disable this client account from being accessed.
        </p>
        <Switch
          className="mt-4"
          checked={!formData.active}
          onCheckedChange={(checked) => handleSwitchChange(!checked)}
        />
      </div>

      {/* Delete Account */}
      <div className="rounded-lg border p-4">
        <h3 className="text-base font-medium">Delete Account</h3>
        <p className="text-sm text-muted-foreground">
          Permanently remove this client account from the system.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this client account? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </section>
</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
