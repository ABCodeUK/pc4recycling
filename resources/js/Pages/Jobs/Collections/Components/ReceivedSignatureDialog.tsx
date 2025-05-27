import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Checkbox } from "@/Components/ui/checkbox";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (staffSignature: string, staffName: string, receivedDate: string) => void;
}

export default function ReceivedSignatureDialog({ isOpen, onClose, onComplete }: Props) {
    const [staffName, setStaffName] = useState("");
    // Update the state to include time
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('.')[0].slice(0, 16));
    const [itemsConfirmed, setItemsConfirmed] = useState(false);
    const staffSignatureRef = useRef<SignatureCanvas>(null);

    const handleComplete = () => {
        if (!itemsConfirmed) {
            alert("Please confirm receipt of all items");
            return;
        }
        if (staffSignatureRef.current?.isEmpty()) {
            alert("Please provide a signature");
            return;
        }
        if (!staffName.trim()) {
            alert("Please provide your name");
            return;
        }
        
        const canvas = staffSignatureRef.current?.getCanvas();
        if (canvas) {
            onComplete(canvas.toDataURL(), staffName, receivedDate); // We're passing the date here
        }
    };

    const clearSignature = () => {
        staffSignatureRef.current?.clear();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Facility Receipt Confirmation</DialogTitle>
                    <DialogDescription>
                        Please confirm receipt of all items at the facility.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                        <SignatureCanvas
                            ref={staffSignatureRef}
                            canvasProps={{
                                className: "signature-canvas w-full h-[200px] border rounded-lg bg-white",
                                style: { touchAction: 'none' }
                            }}
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="staffName">Staff Name</Label>
                            <Input
                                id="staffName"
                                value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="receivedDate">Date & Time Received</Label>
                            <Input
                                id="receivedDate"
                                type="datetime-local"
                                value={receivedDate}
                                onChange={(e) => setReceivedDate(e.target.value)}
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
                            I confirm that all items listed have been received at the facility.
                        </Label>
                    </div>
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={clearSignature}
                        >
                            Clear
                        </Button>
                        <Button onClick={handleComplete}>
                            Mark Job Received
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}