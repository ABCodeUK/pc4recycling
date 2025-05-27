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
import ReceivedSignatureDialog from '../Components/ReceivedSignatureDialog';
import CollectionSignatureDialog from '../Components/CollectionSignatureDialog';

// Update the component props to include jobStatus
export default function JobItems({ jobId, jobStatus, job }: { jobId: string; jobStatus: string; job: any }) {
  // Add state for signature dialog
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [isReceivedDialogOpen, setIsReceivedDialogOpen] = useState(false);
  // Add a new state to track changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [items, setItems] = useState<JobItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedItemNumbers, setUsedItemNumbers] = useState<string[]>([]);

  // Add new state for original items
  const [originalItems, setOriginalItems] = useState<JobItem[]>([]);

  // Modify fetchData to store original state
  // Modify fetchData to handle filtering
  const fetchData = async () => {
    if (!jobId) return;
  
    setIsLoading(true);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get(`/api/jobs/${jobId}/items`)
      ]);
  
      setCategories(categoriesRes.data);
      const activeItems = itemsRes.data.items
        .filter((item: JobItem) => !item.deleted_at)
        .filter((item: JobItem) => item.added === 'Collection' || !item.added); // Filter for Collection items
      setItems(activeItems);
      setOriginalItems(JSON.parse(JSON.stringify(activeItems)));
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
    for (let i = 1; i < qty; i++) { // Start from 1 since the original item is already added
        const newItemNumber = generateUniqueItemNumber(); // Generate a unique item number for each new item
        const newItem = {
            ...item,
            id: 0, // Reset ID for new items
            item_number: newItemNumber,
            quantity: 1, // Set quantity to 1 for each new item
        };
        newItems.push(newItem);
        usedItemNumbers.push(newItemNumber); // Update usedItemNumbers immediately
    }

    // Update the items state with the new items
    const updatedItems = [...items.filter(i => i.item_number !== item.item_number), ...newItems];
    setItems(updatedItems);
    setUsedItemNumbers([...usedItemNumbers]);
    
    // Call hasActualChanges after the state update
    setTimeout(() => {
      const hasChanges = hasActualChanges();
      setHasUnsavedChanges(hasChanges);
    }, 0);
  };

  // Modify handleAddItem
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
      serial_number: null,
      weight: null,
      asset_tag: null,
      erasure_required: null,
      specification: null,
      image_path: null,
      processing_make: null,
      processing_model: null,
      processing_serial_number: null,
      processing_asset_tag: null,
      processing_weight: null,
      processing_specification: null,
      processing_erasure_required: null,
      added: 'Collection',
    };
  
    setItems([...items, newItem]);
    setUsedItemNumbers([...usedItemNumbers, newItemNumber]);
    setHasUnsavedChanges(true);
  };

  // After successful save, update original items
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
        make: item.make || null,
        model: item.model || null,
        erasure_required: item.erasure_required || null  // Fix this line
      }));
  
      console.log('Items being sent to server:', itemsToSave);
      
      await axios.post(`/api/jobs/${jobId}/items`, { items: itemsToSave });
      toast.success("Items saved successfully");
      setHasUnsavedChanges(false);
      setOriginalItems(JSON.parse(JSON.stringify(items))); // Update original state
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

  const handleMarkJobCollected = async (
      customerSignature: string, 
      customerName: string, 
      driverSignature: string, 
      driverName: string,
      vehicle: string
  ) => {
      try {
          const data = {
              customer_signature: customerSignature,
              customer_name: customerName,
              driver_signature: driverSignature,
              driver_name: driverName,
              vehicle: vehicle
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


  // Add handler for marking job as received
  const handleMarkJobReceived = async (staffSignature: string, staffName: string, receivedDate: string) => {
    try {
      const data = {
        staffSignature: staffSignature,
        staffName: staffName,
        receivedDate: receivedDate
      };

      await axios.post(`/api/jobs/${jobId}/mark-received`, data);
      toast.success("Job marked as received successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error marking job as received:', error);
      toast.error("Failed to mark job as received");
    } finally {
      setIsReceivedDialogOpen(false);
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
        <h2 className="text-lg font-semibold">Collection Items</h2>
        {jobStatus === 'Scheduled' && (
          <Button 
            onClick={() => setIsSignatureDialogOpen(true)}
            disabled={hasUnsavedChanges}
            title={hasUnsavedChanges ? "Please save your changes first" : ""}
          >
            Mark Job as Collected
          </Button>
        )}
                {jobStatus === 'Collected' && (
          <Button 
            onClick={() => setIsReceivedDialogOpen(true)}
            disabled={hasUnsavedChanges}
            title={hasUnsavedChanges ? "Please save your changes first" : ""}
          >
            Mark Job as Received
          </Button>
        )}
      </header>

      <CollectionSignatureDialog
          isOpen={isSignatureDialogOpen}
          onClose={() => setIsSignatureDialogOpen(false)}
          onComplete={handleMarkJobCollected}
          defaultVehicle={job.vehicle}
          defaultCustomerName={job.onsite_contact}  // Add this line to pass the onsite_contact
      />
      <ReceivedSignatureDialog
        isOpen={isReceivedDialogOpen}
        onClose={() => setIsReceivedDialogOpen(false)}
        onComplete={handleMarkJobReceived}
      />
      <Separator />
      <div className="p-6">
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="processing" disabled>Processing</TabsTrigger>
            <TabsTrigger value="completed" disabled>Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="collection" className="mt-6">
            <DataTable 
              columns={jobItemColumns as ColumnDef<JobItem>[]} 
              data={items} 
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