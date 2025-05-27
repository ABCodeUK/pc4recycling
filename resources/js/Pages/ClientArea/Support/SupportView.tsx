import { useState, useRef, useEffect } from "react";
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
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "sonner";
import { usePage } from '@inertiajs/react';

export default function SupportView() {
  const { auth } = usePage().props;
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dummy data for now
  const ticket = {
    id: 1,
    ticket_number: "TKT-001",
    subject: "Collection Query",
    last_response: "2024-01-15T10:30:00",
    status: "Open",
    created_at: "2024-01-15T10:00:00",
    messages: [
      {
        id: 1,
        sender: "Client",
        message: "I need help with scheduling a collection.",
        created_at: "2024-01-15T10:00:00",
      },
      {
        id: 2,
        sender: "Support",
        message: "I'll help you schedule that collection. What date works best for you?",
        created_at: "2024-01-15T10:30:00",
      },
    ],
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      // API call will go here later
      toast.success('Message sent successfully');
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

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
                <BreadcrumbLink href="/support">Support</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/support/view`}>
                  {ticket.ticket_number}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {ticket.subject}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{ticket.ticket_number}</span>
                <span>•</span>
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <Badge variant={
                  ticket.status === "Open" ? "success" :
                  ticket.status === "Closed" ? "secondary" :
                  ticket.status === "Awaiting Response" ? "warning" :
                  "default"
                }>
                  {ticket.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white border shadow rounded-lg p-6">
            <div ref={scrollContainerRef} className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
              {ticket.messages.map((message) => (
                <div key={message.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-900">{message.message}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(message.created_at).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }).replace(' pm', 'PM').replace(' am', 'AM')} by {message.sender}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Textarea 
                placeholder="Type your message..."
                className="min-h-[60px]"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={2}
              />
              <Button 
                className="w-full" 
                onClick={handleSendMessage}
                disabled={isLoading || !newMessage.trim()}
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}