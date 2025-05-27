import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { RefreshCw } from "lucide-react"; // Add this import
import { DataTable } from "./data-table";
import { jobItemColumns } from "./columns";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Category, JobItem } from "./types";
import { ColumnDef } from "@tanstack/react-table";
import { processingColumns } from "./processing-columns";

// Update the component props to include jobStatus
export default function JobItems({ jobId, jobStatus }: { jobId: string; jobStatus: string }) {

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


  const handleAddItem = () => {
    const newItemNumber = generateUniqueItemNumber();
    const newItem: JobItem = {
      id: 0, // Use 0 for new items
      job_id: parseInt(jobId as string),
      item_number: newItemNumber,
      quantity: 1,
      category_id: null,
      sub_category_id: null,
      make: null,
      model: null,
      serial_number: null,
      weight: null,
      asset_tag: null,
      image_path: null,
      erasure_required: null,
      specification: null,
      processing_make: null,
      processing_model: null,
      processing_serial_number: null,
      processing_asset_tag: null,
      processing_weight: null,
      processing_specification: null,
      processing_erasure_required: null,
      processing_data_status: null,
      item_status: null,
      added: activeTab === 'processing' ? 'Processing' : 'Collection'
    };

    setItems([...items, newItem]);
    setUsedItemNumbers([...usedItemNumbers, newItemNumber]);
    setHasUnsavedChanges(true);
  };

  const generateUniqueItemNumber = () => {
    let counter = items.length + 1;
    let newItemNumber;
    do {
      newItemNumber = `${jobId}-${counter.toString().padStart(2, '0')}`;
      counter++;
    } while (usedItemNumbers.includes(newItemNumber));
    return newItemNumber;
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
  
      const itemsToSave = items.map(item => ({
        ...item,
        job_id: jobId,
        added: item.added || (activeTab === 'processing' ? 'Processing' : 'Collection'),
        // Ensure these fields are included in the save
        processing_data_status: item.processing_data_status || null,
        item_status: item.item_status || null,
        // Other fields
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
      toast.error("Failed to save items");
    }
  };

  // Memoize categories to prevent loss during re-renders
  const memoizedCategories = React.useMemo(() => categories, [categories]);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId]); // Only depend on jobId

  // Add a function to check if editing is allowed
  const isEditingAllowed = () => {
    const editableStatuses = ['Needs Scheduling', 'Request Pending', 'Scheduled', 'Postponed'];
    return editableStatuses.includes(jobStatus);
  };

  // Add new handler for marking job as processing
  const handleMarkJobProcessing = async () => {
    try {
      await axios.post(`/api/jobs/${jobId}/mark-processing`);
      toast.success("Job marked as processing successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error marking job as processing:', error);
      toast.error("Failed to mark job as processing");
    }
  };

  const handleMarkJobCompleted = async () => {
    try {
        const response = await axios.post(`/api/jobs/${jobId}/mark-completed`);
        
        // Check if the certificate was generated
        if (response.data.document) {
            toast.success("Job marked as completed and Data Destruction Certificate generated");
            // Update the documents state in ProcessingView
            window.location.reload();
        } else {
            toast.success("Job marked as completed successfully");
            window.location.reload();
        }
    } catch (error) {
        console.error('Error marking job as completed:', error);
        toast.error("Failed to mark job as completed");
    }
};

  // Add handler for Aitken sync (placeholder for now)
  const handleAitkenSync = async () => {
    toast.info("Aitken sync functionality coming soon");
  };

  return (
    <section className="bg-white border shadow rounded-lg">
      <header className="p-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Processing Items</h2>
        {jobStatus === 'Processing' && (
          <div className="flex gap-2">
            <Button 
              onClick={handleAitkenSync}
              variant="outline"
              disabled={hasUnsavedChanges}
              title={hasUnsavedChanges ? "Please save your changes first" : ""}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Aitken
            </Button>
            <Button 
              onClick={handleMarkJobCompleted}
              disabled={hasUnsavedChanges}
              title={hasUnsavedChanges ? "Please save your changes first" : ""}
            >
              Mark Job as Complete
            </Button>
          </div>
        )}
        {jobStatus === 'Received at Facility' && (
          <Button 
            onClick={handleMarkJobProcessing}
            disabled={hasUnsavedChanges}
            title={hasUnsavedChanges ? "Please save your changes first" : ""}
          >
            Start Processing Job
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
                  Save Items
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
                isEditable: ['Collected', 'Processing'].includes(jobStatus),
                jobStatus: jobStatus
              }}
              columnVisibility={{
                processing_data_status: ['Processing', 'Completed'].includes(jobStatus)
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
                  Save Items
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