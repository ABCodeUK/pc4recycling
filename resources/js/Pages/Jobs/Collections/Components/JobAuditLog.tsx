import React, { useState, useEffect } from 'react';
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Separator } from "@/Components/ui/separator";
import { toast } from "sonner";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react"; // Add icons import
import { Badge } from "@/Components/ui/badge";  // Add this import
import { usePage } from '@inertiajs/react';  // Add this import

interface AuditEntry {
    id: number;
    content: string;
    is_system: 'true' | 'false';
    staff: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;  // Add this field
}

// Add auth prop to receive the current user
interface Props {
    jobId: number;
}

export default function JobAuditLog({ jobId }: Props) {
    const { auth } = usePage().props;  // Get auth from Inertia page props
    
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // Add ref for the scroll container
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Add function to scroll to bottom
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    // Update fetchAuditLog to scroll after setting entries
    const fetchAuditLog = async () => {
        try {
            const response = await axios.get(`/api/jobs/${jobId}/audit`);
            setEntries(response.data.sort((a: AuditEntry, b: AuditEntry) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ));
            // Add setTimeout to ensure DOM is updated before scrolling
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error fetching audit log:', error);
            toast.error('Failed to load audit log');
        }
    };

    // Update handleAddNote to scroll after adding new note
    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsLoading(true);
        try {
            if (editingId) {
                // Update existing note
                await axios.put(`/api/jobs/${jobId}/audit/${editingId}`, {
                    content: newNote
                });
                toast.success('Note updated successfully');
            } else {
                // Add new note
                await axios.post(`/api/jobs/${jobId}/audit`, {
                    content: newNote
                });
                toast.success('Note added successfully');
            }
            setNewNote('');
            setEditingId(null);
            await fetchAuditLog();
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Failed to save note');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (entry: AuditEntry) => {
        setNewNote(entry.content);
        setEditingId(entry.id);
    };

    const handleDelete = async (entryId: number) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await axios.delete(`/api/jobs/${jobId}/audit/${entryId}`);
            await fetchAuditLog();
            toast.success('Note deleted successfully');
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note');
        }
    };

    useEffect(() => {
        fetchAuditLog();
    }, [jobId]);

    return (
        <section className="bg-white border shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold leading-7 text-gray-900">
                Job Audit Log
            </h2>
            <Separator className="my-4" />
            
            <div ref={scrollContainerRef} className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                {entries.map((entry) => (
                    <div key={entry.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-900">{entry.content}</div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(entry.created_at).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    }).replace(' pm', 'PM').replace(' am', 'AM')} by {entry.staff.name}
                                    {entry.updated_at !== entry.created_at && (
                                        <span className="ml-2 text-gray-400">
                                            (edited {new Date(entry.updated_at).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            }).replace(' pm', 'PM').replace(' am', 'AM')})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                {entry.is_system === 'true' ? (
                                    <Badge variant="secondary">System</Badge>
                                ) : (
                                    entry.staff.id === auth?.user?.id && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(entry)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(entry.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <Textarea 
                    placeholder="Enter your update..."
                    className="min-h-[60px]"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                />
                <Button 
                    className="w-full" 
                    onClick={handleAddNote}
                    disabled={isLoading || !newNote.trim()}
                >
                    {editingId ? 'Save Changes' : 'Add Note'}
                </Button>
                {editingId && (
                    <Button 
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                            setEditingId(null);
                            setNewNote('');
                        }}
                    >
                        Cancel Edit
                    </Button>
                )}
            </div>
        </section>
    );
}