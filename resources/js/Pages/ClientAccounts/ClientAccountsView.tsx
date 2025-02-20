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
import UserAddresses from "@/Pages/ClientAccounts/Address/ClientAddresses";
import ClientJobs from "@/Pages/ClientAccounts/Jobs/ClientJobs";
import ClientSubClients from "@/Pages/ClientAccounts/SubClients/ClientSubClients";
import { ArrowLeft, Pencil } from "lucide-react";

export default function ClientAccountsView({
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
    address_2?: string | null;
    town_city?: string | null;
    county?: string | null;
    postcode?: string | null;
    contact_name?: string | null;
    contact_position?: string | null; // Add this line
    sic_code?: string | null;
    customer_notes?: string | null;
    lead_source_id?: string | null;
  };
  customer_types: { id: number; ct_name: string }[];
  industries: { id: number; in_name: string }[];
  lead_sources: { id: number; ls_name: string }[];
}) {
  if (!user_edit || !client_details || !customer_types || !industries) {
    return <div>Loading...</div>;
  }

  // Helper function to get industry name
  const getIndustryName = (id: number | null) => {
    if (!id) return "Not specified";
    const industry = industries.find((i) => i.id === id);
    return industry ? industry.in_name : "Not specified";
  };

  const getCustomerTypeName = (id: number | null) => {
    if (!id) return "Not specified";
    const type = customer_types.find((t) => t.id === id);
    return type ? type.ct_name : "Not specified";
  };

  // Helper function to get lead source name
  const getLeadSourceName = (id: number | null) => {
    if (!id) return "Not specified";
    const source = lead_sources.find((s) => s.id === id);
    return source ? source.ls_name : "Not specified";
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="py-2 grid grid-cols-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 text-left">{value || "Not specified"}</dd>
    </div>
  );

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
                <BreadcrumbLink href="#">View Customer</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">
                Customer: {user_edit.name}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/customers")}
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                Back to Customers
              </Button>
              <Button
                onClick={() => (window.location.href = `/customers/${user_edit.id}/edit`)}
              >
                <Pencil className="h-5 w-5 mr-2" />
                Edit Customer
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
                    <span className={`text-sm px-4 py-1 rounded-sm ${user_edit.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-medium`}>
                      {user_edit.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </h2>
                <Separator className="my-3" />
                <dl className="grid gap-1">
                  <DetailRow label="Company Name" value={user_edit.name} />
                  <Separator />
                  <DetailRow label="Address Line 1" value={client_details.address || ""} />
                  <DetailRow label="Address Line 2" value={client_details.address_2 || ""} />
                  <DetailRow label="Town/City" value={client_details.town_city || ""} />
                  <DetailRow label="County" value={client_details.county || ""} />
                  <DetailRow label="Postcode" value={client_details.postcode || ""} />
                  <Separator />
                  <DetailRow
                    label="Contact Name"
                    value={client_details.contact_name || ""}
                  />
                  <DetailRow 
                    label="Position" 
                    value={client_details.contact_position || ""} 
                  />
                  <Separator />
                  <DetailRow label="Landline" value={user_edit.landline || ""} />
                  <DetailRow label="Mobile" value={user_edit.mobile || ""} />
                  <DetailRow label="Email" value={user_edit.email} />
                </dl>
              </section>

              {/* Right Card: More Details */}
              <section className="bg-white border shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold leading-7 text-gray-900">
                  More Details
                </h2>
                <Separator className="my-3" />
                <dl className="grid gap-1">
                  <DetailRow
                    label="Lead Source"
                    value={getLeadSourceName(Number(client_details.lead_source_id))}
                  />
                  <DetailRow
                    label="Customer Type"
                    value={getCustomerTypeName(Number(client_details.customer_type_id))}
                  />
                  <DetailRow
                    label="Industry"
                    value={getIndustryName(Number(client_details.industry_id))}
                  />
                  <Separator />
                  <DetailRow label="SIC Code" value={client_details.sic_code || ""} />
                  <Separator />
                  <DetailRow
                    label="Customer Notes"
                    value={client_details.customer_notes || ""}
                  />
                </dl>
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}