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

export default function StaffAccountsEdit({
  user_edit,
  roles,
}: {
  user_edit: {
    id: number;
    name: string;
    email: string;
    mobile?: string;
    position?: string;
    active?: boolean;
    role_id: string;
  };
  roles: { id: number; name: string }[];
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
    role_id: String(user_edit.role_id) || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    role_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormErrors = () =>
    setFormErrors({ name: "", email: "", role_id: "" });

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
      const response = await axios.put(
        `/settings/staff/update/${user_edit.id}`,
        formData
      );

      if (response.status === 200) {
        toast.success("Staff member successfully updated!");
      } else {
        toast.error("Failed to update staff member. Please try again.");
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors); // Validation errors
      } else {
        toast.error("An error occurred while updating the staff member.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(
        `/settings/staff/delete/${user_edit.id}`
      );
      if (response.status === 200) {
        toast.success("Staff account successfully deleted!");
        window.location.href = "/settings/staff";
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the account.");
    }
  };

  const handleSendResetEmail = async () => {
    try {
      const response = await axios.post(`/settings/staff/${user_edit.id}/send-reset-email`);
  
      if (response.status === 200) {
        toast.success("Password reset email sent successfully.");
      } else {
        toast.error("Failed to send password reset email.");
      }
    } catch (error) {
      toast.error("An error occurred while sending the password reset email.");
    }
  };

  // Handle Manual Password Reset
  const handleManualPasswordReset = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
  
    try {
      await axios.post(`/settings/staff/${user_edit.id}/reset-password`, {
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
      });
      toast.success("Password reset successfully.");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Parse Laravel validation errors
        const validationErrors = error.response.data.errors;
        Object.values(validationErrors).forEach((err: any) => {
          toast.error(err[0]); // Display each validation error
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
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/staff">
                  Staff Accounts
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Edit Staff Account</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="flex justify-between items-center">
  {/* Heading on the Left */}
  <div>
    <h2 className="text-3xl font-semibold text-gray-800">
      Settings: Edit Staff Account
    </h2>
  </div>

  {/* Buttons on the Right */}
  <div className="flex items-center gap-3">
    <Button
      variant="outline"
      onClick={() => (window.location.href = "/settings/staff/")}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Card: Staff Details */}
            <section className="bg-white border shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Staff Details</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Update the personal and professional details of the staff member.
              </p>
              <Separator />
              <div className="grid gap-4 mt-4">
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
                  <Label htmlFor="role_id">Role*</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        role_id: value,
                      }))
                    }
                    value={formData.role_id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Role">
                        {roles.find((role) => String(role.id) === formData.role_id)
                          ?.name || "Select a Role"}
                      </SelectValue>
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
                    <p className="text-red-600 text-sm">{formErrors.role_id}</p>
                  )}
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
              </div>
            </section>

            {/* Right Card: Account Settings */}
            <section className="bg-white border shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Account Settings</h2>
              <p className="text-sm text-muted-foreground mb-4">
              Manage account access, reset passwords, or delete the account.


              </p>
              <Separator className="mb-10" />
             <div className="space-y-6">
{/* Reset Password Card */}
<div className="flex flex-row items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
    <h3 className="text-base font-medium">Reset Password</h3>
    <p className="text-sm text-muted-foreground">
      Reset the user's password using one of the options below.
    </p>
  </div>
  <div className="flex flex-col gap-2">
  <Button
  variant="outline"
  onClick={handleSendResetEmail}
>
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
      Enter the new password below to manually reset the user's password.
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

              {/* Disable Account Card */}
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <h3 className="text-base font-medium">Disable Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Disable this account from being accessed.
                  </p>
                </div>
                <Switch
  checked={!formData.active} // Switch is checked when active is false (inactive)
  onCheckedChange={(checked) => handleSwitchChange(!checked)} // Invert the checked value
/>
              </div>

              {/* Delete Account Card */}
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <h3 className="text-base font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove this account from the system. This action
                    cannot be undone.
                  </p>
                </div>
                <div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-5 w-5 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this account? This
                          action cannot be undone.
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
              </div>
            </section>
          </div>
          <div className="flex justify-end gap-4 mt-6">
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}