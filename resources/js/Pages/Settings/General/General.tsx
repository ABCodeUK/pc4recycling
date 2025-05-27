import { router } from "@inertiajs/react";
import { useState } from "react";
import { AppSidebar } from "@/Components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Plus, Trash2, Edit2, FileText } from "lucide-react"; // Add FileText icon
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";

interface CompanyDocument {
  id: number;
  document_name: string;
  document_description: string;
  date_from: string;
  date_to: string;
  document_url: string | null;
  uuid: string;
  file_path: string;
  original_filename: string;
}

interface GeneralProps {
  documents: CompanyDocument[];
}

interface CompanyDocument {
  id: number;
  document_name: string;
  document_description: string;
  date_from: string;
  date_to: string;
  document_url: string | null;
  uuid: string;
  file_path: string;
  original_filename: string;
}

export default function General({ documents }: GeneralProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CompanyDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDocument, setNewDocument] = useState({
    name: '',
    date_from: '',
    date_to: '',
    file: null as File | null,
    description: '' // Add this line
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 128 * 1024 * 1024; // 128MB in bytes
      if (file.size > maxSize) {
        toast.error('File size must be less than 128MB');
        e.target.value = ''; // Reset input
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveCurrentFile = () => {
    if (editingDocument) {
      setEditingDocument(prev => prev ? { ...prev, document_url: null } : null);
      setSelectedFile(null);
      // Reset the file input if needed
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.name || !newDocument.date_from) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('document_name', newDocument.name);  // Changed from name to document_name
    formData.append('date_from', newDocument.date_from);
    formData.append('document_description', newDocument.description); // Add this line
    if (newDocument.date_to) {
      formData.append('date_to', newDocument.date_to);
    }
    if (newDocument.file) {
      formData.append('document', newDocument.file);
    }

    try {
      const response = await axios.post('/settings/documents/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Document added successfully');
        setIsAddDialogOpen(false);
        setNewDocument({
          name: '',
          description: '',
          date_from: '',
          date_to: '',
          file: null
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
    }
  };

  const handleEdit = async () => {
    if (!editingDocument || !editingDocument.document_name || !editingDocument.date_from) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('document_name', editingDocument.document_name);
    formData.append('date_from', editingDocument.date_from);
    formData.append('document_description', editingDocument.document_description);
    if (editingDocument.date_to) {
      formData.append('date_to', editingDocument.date_to);
    }
    
    // Handle file removal or update
    if (selectedFile) {
      formData.append('document', selectedFile);
    } else if (!editingDocument.document_url) {
      formData.append('remove_document', 'true');
    }
    
    formData.append('_method', 'PUT');

    try {
      const response = await axios.post(`/settings/documents/documents/${editingDocument.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.data.success) {
        toast.success('Document updated successfully');
        setIsEditDialogOpen(false);
        setEditingDocument(null);
        setSelectedFile(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  const openEditDialog = (doc: CompanyDocument) => {
    const formattedDoc = {
      ...doc,
      date_from: new Date(doc.date_from).toISOString().split('T')[0],
      date_to: doc.date_to ? new Date(doc.date_to).toISOString().split('T')[0] : ''
    };
    setEditingDocument(formattedDoc);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
      try {
        const response = await axios.delete(`/settings/documents/documents/${id}`);
        if (response.data.success) {
          toast.success('Document deleted successfully');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4 bg-white border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/documents">Documents</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold text-gray-800">Company Documents</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                  <DialogDescription>
                    Enter details for the new document.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Document Name</Label>
                    <Input
                      value={newDocument.name}
                      onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                      placeholder="Enter document name"
                    />
                  </div>
                  <div className="grid gap-2">
      <Label>Document Description</Label>
      <Input
        value={newDocument.description}
        onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
        placeholder="Enter document description"
      />
    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Valid From</Label>
                      <Input
                        type="date"
                        value={newDocument.date_from}
                        onChange={(e) => setNewDocument({ ...newDocument, date_from: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Valid To (Optional)</Label>
                      <Input
                        type="date"
                        value={newDocument.date_to}
                        onChange={(e) => setNewDocument({ ...newDocument, date_to: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Document File (PDF) (Optional)</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const maxSize = 128 * 1024 * 1024;
                          if (file.size > maxSize) {
                            toast.error('File size must be less than 128MB');
                            e.target.value = '';
                            return;
                          }
                          setNewDocument({ ...newDocument, file: file });
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDocument}>
                    Add Document
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(documents) && 
              [...documents]
                .sort((a, b) => a.document_name.localeCompare(b.document_name))
                .map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{doc.document_name}</h3>
                    <p className="text-sm text-gray-600">{doc.document_description}</p>
                    <div className="text-sm text-gray-500">
                      Valid: {new Date(doc.date_from).toLocaleDateString()} - {doc.date_to ? new Date(doc.date_to).toLocaleDateString() : 'Permanent'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doc.document_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/storage/${doc.document_url}`, '_blank')}
                        title="View PDF"
                      >
                        <FileText className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(doc)}
                    >
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingDocument ? 'Edit Document' : 'Add New Document'}</DialogTitle>
                <DialogDescription>
                  {editingDocument ? 'Update document details.' : 'Enter details for the new document.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Document Name</Label>
                  <Input
                    value={editingDocument?.document_name || ''}
                    onChange={(e) => setEditingDocument(prev => prev ? { ...prev, document_name: e.target.value } : null)}
                    placeholder="Enter document name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Document Description</Label>
                  <Input
                    value={editingDocument?.document_description || ''}
                    onChange={(e) => setEditingDocument(prev => prev ? { ...prev, document_description: e.target.value } : null)}
                    placeholder="Enter document description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valid From</Label>
                    <Input
                      type="date"
                      value={editingDocument?.date_from || ''}
                      onChange={(e) => setEditingDocument(prev => prev ? { ...prev, date_from: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Valid To (Optional)</Label>
                    <Input
                      type="date"
                      value={editingDocument?.date_to || ''}
                      onChange={(e) => setEditingDocument(prev => prev ? { ...prev, date_to: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Document File (PDF) (Optional)</Label>
                  {editingDocument?.document_url ? (
                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <a 
                        href={`/storage/${editingDocument.document_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/90 flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        {`${editingDocument.document_name}.pdf`}
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveCurrentFile}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                    />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}