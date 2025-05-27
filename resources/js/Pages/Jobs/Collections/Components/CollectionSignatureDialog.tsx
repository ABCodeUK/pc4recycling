import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Checkbox } from "@/Components/ui/checkbox"; // Add this import

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (customerSignature: string, customerName: string, driverSignature: string, driverName: string, vehicle: string) => void;
    defaultVehicle?: string;
    defaultCustomerName?: string;
}

export default function CollectionSignatureDialog({ 
    isOpen, 
    onClose, 
    onComplete, 
    defaultVehicle,
    defaultCustomerName  // Add this parameter
}: Props) {
    const [activeTab, setActiveTab] = useState("customer");
    const [customerSignature, setCustomerSignature] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState(defaultCustomerName || "");  // Use the default value
    const [driverName, setDriverName] = useState("");
    const [vehicle, setVehicle] = useState(defaultVehicle || "");
    const [itemsConfirmed, setItemsConfirmed] = useState(false);
    const [driverConfirmed, setDriverConfirmed] = useState(false); // Add this state
    const customerSignatureRef = useRef<SignatureCanvas>(null);
    const driverSignatureRef = useRef<SignatureCanvas>(null);

    const handleCustomerAgree = () => {
        if (!itemsConfirmed) {
            alert("Please confirm the items list");
            return;
        }
        if (customerSignatureRef.current?.isEmpty()) {
            alert("Please provide a signature");
            return;
        }
        if (!customerName.trim()) {
            alert("Please provide your name");
            return;
        }
        
        const canvas = customerSignatureRef.current?.getCanvas();
        if (canvas) {
            setCustomerSignature(canvas.toDataURL());
            setActiveTab("driver");
        }
    };

    const handleComplete = () => {
        if (!driverConfirmed) {
            alert("Please confirm collection of all items");
            return;
        }
        if (driverSignatureRef.current?.isEmpty()) {
            alert("Please provide a signature");
            return;
        }
        if (!driverName.trim()) {
            alert("Please provide your name");
            return;
        }
        if (!vehicle.trim()) {
            alert("Please provide a vehicle registration");
            return;
        }
        if (!customerSignature) {
            alert("Customer signature is required");
            return;
        }
        
        const canvas = driverSignatureRef.current?.getCanvas();
        if (canvas) {
            onComplete(customerSignature, customerName, canvas.toDataURL(), driverName, vehicle);
        }
    };

    const clearSignature = (ref: React.RefObject<SignatureCanvas>) => {
        ref.current?.clear();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Collection Signatures</DialogTitle>
                    <DialogDescription>
                        Please collect signatures from both the customer and driver to mark this job as collected.
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="customer">Customer</TabsTrigger>
                        <TabsTrigger value="driver" disabled={!customerSignature}>Driver</TabsTrigger>
                    </TabsList>

                    <TabsContent value="customer">
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <SignatureCanvas
                                    ref={customerSignatureRef}
                                    canvasProps={{
                                        className: "signature-canvas w-full h-[200px] border rounded-lg bg-white",
                                        style: { touchAction: 'none' }
                                    }}
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="customerName">Customer Name</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="items-confirmed" 
                                    checked={itemsConfirmed}
                                    onCheckedChange={(checked) => setItemsConfirmed(checked as boolean)}
                                />
                                <Label htmlFor="items-confirmed" className="text-sm">
                                    I confirm that the items PC4Recycling are collecting are marked on the list.
                                </Label>
                            </div>
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => clearSignature(customerSignatureRef)}
                                >
                                    Clear
                                </Button>
                                <Button onClick={handleCustomerAgree}>
                                    I Agree
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="driver">
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <SignatureCanvas
                                    ref={driverSignatureRef}
                                    canvasProps={{
                                        className: "signature-canvas w-full h-[200px] border rounded-lg bg-white",
                                        style: { touchAction: 'none' }
                                    }}
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="driverName">Driver Name</Label>
                                        <Input
                                            id="driverName"
                                            value={driverName}
                                            onChange={(e) => setDriverName(e.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="Vehicle">Vehicle Reg</Label>
                                        <Input
                                            id="vehicle"
                                            value={vehicle}
                                            onChange={(e) => setVehicle(e.target.value)}
                                            placeholder="Enter your Vehicle Reg"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="driver-confirmed" 
                                    checked={driverConfirmed}
                                    onCheckedChange={(checked) => setDriverConfirmed(checked as boolean)}
                                />
                                <Label htmlFor="driver-confirmed" className="text-sm">
                                    I confirm that I have collected all items listed.
                                </Label>
                            </div>
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => clearSignature(driverSignatureRef)}
                                >
                                    Clear
                                </Button>
                                <Button onClick={handleComplete}>
                                    Mark Job Collected
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}