import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';



export default function MySQLConnection() {
  const [connectionDetails, setConnectionDetails] = useState({
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
  });
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch connection details on load
  useEffect(() => {
    const fetchConnection = async () => {
      try {
        const response = await axios.get('/settings/connections/mysql');
        if (response.data.connected) {
          setConnected(true);
          setConnectionDetails({
            host: response.data.host,
            port: response.data.port,
            database: response.data.database,
            username: response.data.username,
            password: '', // Keep password empty for security
          });
        } else {
          setConnected(false);
        }
      } catch {
        setConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnection();
  }, []);

  // Handle Test Connection
  const handleTestConnection = async () => {
    try {
      const response = await axios.post('/settings/connections/mysql/test', connectionDetails);
      if (response.status === 200) {
        toast.success('MySQL connection is working!');
      }
    } catch (error) {
      toast.error('Failed to test MySQL connection. Please check the details and try again.');
    }
  };

  // Handle Save Connection
  const handleSaveConnection = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post('/settings/connections/mysql/save', connectionDetails);
      if (response.status === 200) {
        setConnected(true);
        toast.success('MySQL connection saved successfully!');
      }
    } catch {
      toast.error('Failed to save MySQL connection. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.delete('/settings/connections/mysql');
      if (response.status === 200) {
        setConnected(false);
        setConnectionDetails({ host: '', port: '', database: '', username: '', password: '' });
        toast.success('Disconnected from MySQL.');
      }
    } catch {
      toast.error('Failed to disconnect from MySQL.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine badge variant
  const badgeVariant = isLoading
    ? 'success' // Grey for loading
    : connected
    ? 'default' // Green for connected
    : 'success'; // Grey for not connected

  return (
    <div className="bg-white border shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">Aitken MySQL</h2>
        <Badge variant={badgeVariant}>
          {isLoading ? 'Loading...' : connected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>
      {!isLoading && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {connected
              ? 'Your Aitken MySQL connection is active.'
              : 'Enter your Aitken MySQL database details to connect.'}
          </p>
           {/* Separator */}
          <hr className="my-4" />         
          <div className="space-y-4">
  <Input
              type="text"
              placeholder="Host"
              value={connectionDetails.host}
              onChange={(e) => setConnectionDetails({ ...connectionDetails, host: e.target.value })}
              disabled={isProcessing || connected}
            />
            <Input
              type="text"
              placeholder="Port"
              value={connectionDetails.port}
              onChange={(e) => setConnectionDetails({ ...connectionDetails, port: e.target.value })}
              disabled={isProcessing || connected}
            />
            <Input
              type="text"
              placeholder="Database"
              value={connectionDetails.database}
              onChange={(e) => setConnectionDetails({ ...connectionDetails, database: e.target.value })}
              disabled={isProcessing || connected}
            />
            <Input
              type="text"
              placeholder="Username"
              value={connectionDetails.username}
              onChange={(e) => setConnectionDetails({ ...connectionDetails, username: e.target.value })}
              disabled={isProcessing || connected}
            />
<Input
  type="password"
  placeholder={connected ? "Password hidden for security" : "Password"}
  value={connectionDetails.password}
  onChange={(e) => setConnectionDetails({ ...connectionDetails, password: e.target.value })}
  disabled={isProcessing || connected}
/>
            <div className="flex gap-4">
              {!connected && (
                <Button onClick={handleSaveConnection} disabled={isProcessing}>
                  {isProcessing ? 'Saving...' : 'Connect'}
                </Button>
              )}
              {connected && (
                <>
                  <Button variant="outline" onClick={handleTestConnection} disabled={isProcessing}>
                    Test Connection
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect} disabled={isProcessing}>
                    Disconnect
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}