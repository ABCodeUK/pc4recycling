import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Separator } from "@/Components/ui/separator";

export default function JobItems() {
  return (
    <section className="bg-white border shadow rounded-lg mt-6">
      <header className="p-6">
        <h2 className="text-lg font-semibold">Collection Items</h2>
      </header>
      <Separator />
      <div className="p-6">
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="processing" disabled>Processing</TabsTrigger>
            <TabsTrigger value="completed" disabled>Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="collection" className="mt-6">
            {/* Collection content will go here */}
            <p>Collection items management</p>
          </TabsContent>
          <TabsContent value="processing">
            <p>Items in processing</p>
          </TabsContent>
          <TabsContent value="completed">
            <p>Completed items</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}