import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

interface QuoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    initialData?: {
        job_quote?: string;
        collection_date?: string;
        quote_information?: string;
    };
}

export default function QuoteDialog({ isOpen, onClose, jobId, initialData }: QuoteDialogProps) {
    const [quoteData, setQuoteData] = useState({
        job_quote: '',
        collection_date: '',
        quote_information: ''
    });

    useEffect(() => {
        if (initialData) {
            setQuoteData({
                job_quote: initialData.job_quote || '',
                collection_date: initialData.collection_date?.split('T')[0] || '',
                quote_information: initialData.quote_information || ''
            });
        }
    }, [initialData]);

    const handleSubmit = async () => {
        try {
            // Validate required fields
            if (!quoteData.job_quote) {
                toast.error("Quote amount is required");
                return;
            }
            if (!quoteData.collection_date) {
                toast.error("Collection date is required");
                return;
            }

            // Prepare the data, allowing empty string for quote_information
            const submitData = {
                ...quoteData,
                quote_information: quoteData.quote_information || "" // Changed from null to empty string
            };

            const response = await axios.post(`/api/jobs/${jobId}/provide-quote`, submitData);
            toast.success("Quote provided successfully");
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Error providing quote:', error);
            toast.error("Failed to provide quote");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Provide Quote</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="job_quote">Quote Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5">£</span>
                            <Input
                                id="job_quote"
                                className="pl-7"
                                value={quoteData.job_quote}
                                onChange={(e) => setQuoteData({ ...quoteData, job_quote: e.target.value })}
                                placeholder="Enter quote amount"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="collection_date">Suggested Collection Date</Label>
                        <Input
                            id="collection_date"
                            type="date"
                            value={quoteData.collection_date}
                            onChange={(e) => setQuoteData({ ...quoteData, collection_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quote_information">Quote Information</Label>
                        <Textarea
                            id="quote_information"
                            value={quoteData.quote_information}
                            onChange={(e) => setQuoteData({ ...quoteData, quote_information: e.target.value })}
                            placeholder="Enter quote details"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit Quote</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}