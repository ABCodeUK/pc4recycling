import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";

export default function VariablesNavigation({
  currentTab,
}: {
  currentTab: string;
}) {
  return (
    <Tabs defaultValue={currentTab} className="w-full">
      <TabsList className="border bg-white p-6">
        <TabsTrigger value="ewc-codes" asChild>
          <a href="/settings/variables/ewc-codes">EWC Codes</a>
        </TabsTrigger>
        <TabsTrigger value="hp-codes" asChild>
          <a href="/settings/variables/hp-codes">HP Codes</a>
        </TabsTrigger>
        <TabsTrigger value="manufacturers" asChild>
          <a href="/settings/variables/manufacturers">Manufacturers</a>
        </TabsTrigger>
        <TabsTrigger value="spec-fields" asChild>
          <a href="/settings/variables/spec-fields">Spec Fields</a>
        </TabsTrigger>
        <TabsTrigger value="customer-types" asChild>
          <a href="/settings/variables/customer-types">Customer Types</a>
        </TabsTrigger>
        <TabsTrigger value="lead-sources" asChild>
          <a href="/settings/variables/lead-sources">Lead Sources</a>
        </TabsTrigger>
        <TabsTrigger value="industries" asChild>
          <a href="/settings/variables/industries">Industries</a>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
