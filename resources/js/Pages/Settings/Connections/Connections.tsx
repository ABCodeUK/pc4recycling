import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import ChatGPTConnection from './ChatGPT/ChatGPT-Connection'; // ChatGPT Connection Card

export default function Connections() {
  const [connections, setConnections] = useState({
    aitken: { host: '', port: '', username: '', password: '', database: '', connected: false },
    icecat: { api_key: '', connected: false },
  });

  const handleInputChange = (type: string, field: string, value: string) => {
    setConnections((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleConnect = async (type: string) => {
    try {
      const response = await axios.post(`/settings/connections/${type}/connect`, connections[type]);
      if (response.status === 200) {
        setConnections((prev) => ({
          ...prev,
          [type]: { ...prev[type], connected: true },
        }));
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} connected successfully!`);
      }
    } catch (error) {
      toast.error(`Failed to connect to ${type}. Please check your details.`);
    }
  };

  const handleTestConnection = async (type: string) => {
    try {
      const response = await axios.post(`/settings/connections/${type}/test`, connections[type]);
      if (response.status === 200) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} connection is valid!`);
      }
    } catch (error) {
      toast.error(`Failed to test ${type} connection.`);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Head title="Settings: Connections" />
        <header
          className="flex h-16 items-center gap-2 px-4 bg-white border-b"
          style={{
            borderBottomColor: 'hsl(var(--breadcrumb-border))',
          }}
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/settings/connections" isCurrent>
                  Connections
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <div className="text-3xl font-semibold text-gray-800">Settings: Connections</div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
            {/* Aitken Connection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Aitken (MySQL)</h2>
              <Input
                placeholder="Host"
                value={connections.aitken.host}
                onChange={(e) => handleInputChange('aitken', 'host', e.target.value)}
                disabled={connections.aitken.connected}
                className="mb-4"
              />
              <Input
                placeholder="Port"
                value={connections.aitken.port}
                onChange={(e) => handleInputChange('aitken', 'port', e.target.value)}
                disabled={connections.aitken.connected}
                className="mb-4"
              />
              <Input
                placeholder="Username"
                value={connections.aitken.username}
                onChange={(e) => handleInputChange('aitken', 'username', e.target.value)}
                disabled={connections.aitken.connected}
                className="mb-4"
              />
              <Input
                placeholder="Password"
                type="password"
                value={connections.aitken.password}
                onChange={(e) => handleInputChange('aitken', 'password', e.target.value)}
                disabled={connections.aitken.connected}
                className="mb-4"
              />
              <Input
                placeholder="Database"
                value={connections.aitken.database}
                onChange={(e) => handleInputChange('aitken', 'database', e.target.value)}
                disabled={connections.aitken.connected}
                className="mb-4"
              />
              {connections.aitken.connected ? (
                <Badge variant="success" className="mb-4">
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="mb-4">
                  Not Connected
                </Badge>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={() => handleConnect('aitken')}
                  disabled={connections.aitken.connected}
                >
                  {connections.aitken.connected ? 'Reconnect' : 'Connect'}
                </Button>
                {connections.aitken.connected && (
                  <Button variant="outline" onClick={() => handleTestConnection('aitken')}>
                    Test
                  </Button>
                )}
              </div>
            </div>

            {/* ChatGPT Connection */}
            <ChatGPTConnection />

            {/* IceCat Connection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">IceCat</h2>
              <Input
                placeholder="API Key"
                value={connections.icecat.api_key}
                onChange={(e) => handleInputChange('icecat', 'api_key', e.target.value)}
                disabled={connections.icecat.connected}
                className="mb-4"
              />
              {connections.icecat.connected ? (
                <Badge variant="success" className="mb-4">
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="mb-4">
                  Not Connected
                </Badge>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={() => handleConnect('icecat')}
                  disabled={connections.icecat.connected}
                >
                  {connections.icecat.connected ? 'Reconnect' : 'Connect'}
                </Button>
                {connections.icecat.connected && (
                  <Button variant="outline" onClick={() => handleTestConnection('icecat')}>
                    Test
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
