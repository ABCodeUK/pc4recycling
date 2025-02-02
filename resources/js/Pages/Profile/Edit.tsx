import { AppSidebar } from '@/Components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/Components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,

} from '@/Components/ui/breadcrumb';
import { Separator } from '@/Components/ui/separator';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
  mustVerifyEmail,
  status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Head title="My Account" />
<header
  className="flex h-16 items-center gap-2 px-4 bg-white border-b"
  style={{
    borderBottomColor: "hsl(var(--breadcrumb-border))",
  }}
>
  <SidebarTrigger className="-ml-1" />
  <Separator orientation="vertical" className="h-4 mx-2" />
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="hidden md:block" />
      <BreadcrumbItem>
        <BreadcrumbLink href="/my-account" >
          My Account
        </BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
</header>
<div className="flex flex-1 flex-col gap-6 p-8">
  {/* Page Title */}
  <div className="text-3xl font-semibold text-gray-800">My Account</div>

  {/* Page Content Grid */}
  <div className="grid gap-6 md:grid-cols-2 items-start">
    {/* Left Column: Profile Information */}
    <div className="bg-white border shadow rounded-lg p-6">
      <UpdateProfileInformationForm
        mustVerifyEmail={mustVerifyEmail}
        status={status}
      />
    </div>

    {/* Right Column: Password Reset and Delete Account */}
    <div className="space-y-6">
      <div className="bg-white border shadow rounded-lg p-6">
        <UpdatePasswordForm />
      </div>
      <div className="bg-white border shadow rounded-lg p-6">
        <DeleteUserForm />
      </div>
    </div>
  </div>
</div>
</SidebarInset>
</SidebarProvider>

  );
}
