import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { DataTable } from "./data-table";
import { jobItemColumns } from "./columns";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Category, JobItem } from "./types";
import { ColumnDef } from "@tanstack/react-table";
import { processingColumns } from "./processing-columns";

// Remove the Category interface since it's now imported from types


// Update the component props to include jobStatus
export default function JobItems({ jobId, jobStatus }: { jobId: string; jobStatus: string }) {
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('processing'); // Move this to top
  const [items, setItems] = useState<JobItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedItemNumbers, setUsedItemNumbers] = useState<string[]>([]);
  const [originalItems, setOriginalItems] = useState<JobItem[]>([]);

  // Modify fetchData to store original state
  const fetchData = async () => {
    if (!jobId) return;
  
    setIsLoading(true);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get(`/api/jobs/${jobId}/items`)
      ]);
  
      setCategories(categoriesRes.data);
      const activeItems = itemsRes.data.items.filter((item: JobItem) => !item.deleted_at);
      setItems(activeItems);
      setOriginalItems(JSON.parse(JSON.stringify(activeItems))); // Store deep copy of original state
      setUsedItemNumbers(itemsRes.data.existingItemNumbers);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { data: any } };
        console.error('Server error:', axiosError.response.data);
      }
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to check for actual changes
  const hasActualChanges = () => {
    // First, filter out any new items (those with id === 0) that were added and then removed
    const currentPersistentItems = items.filter(item => item.id !== 0);
    const originalPersistentItems = originalItems.filter(item => item.id !== 0);
  
    // Check if the number of persistent items has changed
    if (currentPersistentItems.length !== originalPersistentItems.length) return true;
  
    // Sort both arrays for consistent comparison
    const sortedCurrent = [...currentPersistentItems].sort((a, b) => 
      a.item_number.localeCompare(b.item_number)
    );
    const sortedOriginal = [...originalPersistentItems].sort((a, b) => 
      a.item_number.localeCompare(b.item_number)
    );
  
    // Check if any new items remain (these would need saving)
    const hasNewItems = items.some(item => item.id === 0);
  
    // Compare persistent items for changes
    const persistentItemsChanged = JSON.stringify(sortedCurrent) !== JSON.stringify(sortedOriginal);
  
    return persistentItemsChanged || hasNewItems;
  };

  // Modify handleItemsChange
  const handleItemsChange = (updatedItems: JobItem[]) => {
    setItems(updatedItems);
    // Call hasActualChanges after the state update
    setTimeout(() => {
      const hasChanges = hasActualChanges();
      setHasUnsavedChanges(hasChanges);
    }, 0);
  };

  // Also update handleExpandItem to trigger change detection
  const handleExpandItem = (item: JobItem) => {
    const newItems = [];
    const qty = item.quantity;

    // Set the original item's quantity to 1
    const updatedOriginalItem = {
        ...item,
        quantity: 1,
    };

    // Add the updated original item to the new items list
    newItems.push(updatedOriginalItem);

    // Add additional items to match the original quantity
    for (let i = 1; i < qty; i++) {
        const newItemNumber = generateUniqueItemNumber();
        const newItem = {
            ...item,
            id: 0,
            item_number: newItemNumber,
            quantity: 1,
            added: activeTab === 'processing' ? 'Processing' : 'Collection',
            original_item_number: item.item_number // Track the original item
        };
        newItems.push(newItem);
        usedItemNumbers.push(newItemNumber);
    }

    const updatedItems = [...items.filter(i => i.item_number !== item.item_number), ...newItems];
    setItems(updatedItems);
    setUsedItemNumbers([...usedItemNumbers]);
    setHasUnsavedChanges(true); // Explicitly set unsaved changes when expanding
  };


  // Keep the handleAddItem function as is
  const handleAddItem = () => {
    const newItemNumber = generateUniqueItemNumber();
    const newItem: JobItem = {
      id: 0,
      job_id: 0,
      item_number: newItemNumber,
      quantity: 1,
      category_id: null,
      sub_category_id: null,
      make: null,
      model: null,
      erasure_required: null,
      specification: null,
      image_path: null,
      processing_make: null,
      processing_model: null,
      processing_specification: null,
      processing_erasure_required: null,
      added: activeTab === 'processing' ? 'Processing' : 'Collection'  // Capitalize 'Processing'
    };
  
    setItems([...items, newItem]);
    setUsedItemNumbers([...usedItemNumbers, newItemNumber]);
    setHasUnsavedChanges(true);
  };
  
  // Modify handleSaveChanges to preserve 'Collection' items
  const handleSaveChanges = async () => {
    try {
      const itemNumbers = items.map(item => item.item_number);
      const uniqueItemNumbers = new Set(itemNumbers);
  
      if (uniqueItemNumbers.size !== itemNumbers.length) {
        toast.error("Duplicate item numbers found. Please ensure all item numbers are unique.");
        return;
      }
  
      // In handleSaveChanges
      const itemsToSave = items.map(item => ({
        ...item,
        job_id: jobId,
        // Capitalize 'Processing' when saving
        added: item.id === 0 ? (activeTab === 'processing' ? 'Processing' : 'Collection') : item.added || 'Collection',
        make: item.make || null,
        model: item.model || null,
        erasure_required: item.erasure_required || null
      }));
  
      await axios.post(`/api/jobs/${jobId}/items`, { items: itemsToSave });
      toast.success("Items saved successfully");
      setHasUnsavedChanges(false);
      setOriginalItems(JSON.parse(JSON.stringify(items)));
      await fetchData();
    } catch (error) {
      console.error('Error saving items:', error);
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { data: any } };
        console.error('Server error:', axiosError.response.data);
      }
      toast.error("Failed to save items");
    }
  };

  const generateUniqueItemNumber = () => {
    let counter = 1; // Start counter from 1
    let newItemNumber;
    do {
      newItemNumber = `${jobId}-${counter.toString().padStart(2, '0')}`;
      counter++;
    } while (usedItemNumbers.includes(newItemNumber));
    return newItemNumber;
  };
  // Memoize categories to prevent loss during re-renders
  const memoizedCategories = React.useMemo(() => categories, [categories]);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId]); // Only depend on jobId

  const handleMarkJobCollected = async (customerSignature: string, customerName: string, driverSignature: string, driverName: string) => {
    try {
      const data = {
        customer_signature: customerSignature,
        customer_name: customerName,
        driver_signature: driverSignature,
        driver_name: driverName
      };

      await axios.post(`/api/jobs/${jobId}/mark-collected`, data);
      toast.success("Job marked as collected successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error marking job as collected:', error);
      toast.error("Failed to mark job as collected");
    } finally {
      setIsSignatureDialogOpen(false);
    }
  };

  // Add a function to check if editing is allowed
  const isEditingAllowed = () => {
    const editableStatuses = ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed'];
    return editableStatuses.includes(jobStatus);
  };

  return (
    <section className="bg-white border shadow rounded-lg">
      <header className="p-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Processing Items</h2>
        {jobStatus === 'Scheduled' && (
          <Button 
            onClick={() => setIsSignatureDialogOpen(true)}
            disabled={hasUnsavedChanges}
            title={hasUnsavedChanges ? "Please save your changes first" : ""}
          >
            Mark Job Collected
          </Button>
        )}
      </header>

      <Separator />
      <div className="p-6">
        <Tabs 
          value={activeTab}
          defaultValue="processing" 
          className="w-full" 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed" disabled>Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="collection" className="mt-6">
            <DataTable 
              columns={jobItemColumns as ColumnDef<JobItem>[]} 
              data={items.filter(item => 
                item.added === 'Collection' && !item.original_item_number
              )} 
              meta={{
                categories: memoizedCategories,
                setItems: handleItemsChange,
                onExpandItem: handleExpandItem,
                isEditable: isEditingAllowed()
              }}
            />
            {isEditingAllowed() && (
              <div className="flex justify-between mt-4">
                <Button onClick={handleAddItem}>Add Item</Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges}
                  title={!hasUnsavedChanges ? "No changes to save" : ""}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="processing" className="mt-6">
            <DataTable 
              columns={processingColumns as ColumnDef<JobItem>[]} 
              data={items.filter(item => 
                ['Collection', 'Processing'].includes(item.added || '') || 
                (item.id === 0 && activeTab === 'processing')
              )} 
              meta={{
                categories: memoizedCategories,
                setItems: handleItemsChange,
                onExpandItem: handleExpandItem,
                isEditable: ['Collected', 'Processing'].includes(jobStatus)
              }}
            />
            {['Collected', 'Processing'].includes(jobStatus) && (
              <div className="flex justify-between mt-4">
                <Button onClick={handleAddItem}>Add Item</Button>
                <Button 
                  onClick={handleSaveChanges}
                  disabled={!hasUnsavedChanges}
                  title={!hasUnsavedChanges ? "No changes to save" : ""}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <p>Completed items</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}