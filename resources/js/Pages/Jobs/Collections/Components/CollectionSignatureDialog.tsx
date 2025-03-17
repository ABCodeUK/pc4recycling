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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (customerSignature: string, customerName: string, driverSignature: string) => void;
}

export default function CollectionSignatureDialog({ isOpen, onClose, onComplete }: Props) {
    const [activeTab, setActiveTab] = useState("customer");
    const [customerSignature, setCustomerSignature] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState("");
    const customerSignatureRef = useRef<SignatureCanvas>(null);
    const driverSignatureRef = useRef<SignatureCanvas>(null);

    const handleCustomerAgree = () => {
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
        if (driverSignatureRef.current?.isEmpty()) {
            alert("Please provide a signature");
            return;
        }
        if (!customerSignature) {
            alert("Customer signature is required");
            return;
        }
        
        const canvas = driverSignatureRef.current?.getCanvas();
        if (canvas) {
            onComplete(customerSignature, customerName, canvas.toDataURL());
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
                                    <Label htmlFor="customerName">Name</Label>
                                    <Input
                                        id="customerName"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                </div>
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