import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';

export default function IceCatConnection() {
  const [connectionDetails, setConnectionDetails] = useState({
    apiKey: '',
    username: '',
  });
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch connection details on load
  useEffect(() => {
const fetchConnection = async () => {
  try {
    const response = await axios.get('/settings/connections/icecat');
    if (response.data.connected) {
      setConnected(true);
      setConnectionDetails({
        apiKey: response.data.apiKey,
        username: response.data.username,
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
    setIsProcessing(true);
    try {
      const response = await axios.post('/settings/connections/icecat/test', {
        apiKey: connectionDetails.apiKey,
        username: connectionDetails.username,
      });
      if (response.status === 200) {
        toast.success('IceCat connection is working!');
      }
    } catch (error) {
      toast.error('Failed to test IceCat connection. Please check the credentials and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Save Connection
  const handleSaveConnection = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post('/settings/connections/icecat/save', {
        apiKey: connectionDetails.apiKey,
        username: connectionDetails.username,
      });
      if (response.status === 200) {
        setConnected(true);
        toast.success('IceCat connection saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save IceCat connection. Please ensure the credentials are valid and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.delete('/settings/connections/icecat');
      if (response.status === 200) {
        setConnected(false);
        setConnectionDetails({ apiKey: '', username: '' });
        toast.success('Disconnected from IceCat.');
      }
    } catch {
      toast.error('Failed to disconnect from IceCat.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Determine badge variant
  const badgeVariant = isLoading
    ? 'success'
    : connected
    ? 'default'
    : 'success';

  return (
    <div className="bg-white border shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">IceCat API</h2>
        <Badge variant={badgeVariant}>
          {isLoading ? 'Loading...' : connected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>
      {!isLoading && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {connected
              ? 'Your IceCat API connection is active.'
              : 'Enter your IceCat credentials to connect.'}
          </p>
                    {/* Separator */}
          <hr className="my-4" />
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="API Key"
              value={connectionDetails.apiKey}
              onChange={(e) => setConnectionDetails({ ...connectionDetails, apiKey: e.target.value })}
              disabled={isProcessing || connected}
            />
            <Input
              type="text"
              placeholder="Username"
              value={connectionDetails.username}
              onChange={(e) => setConnectionDetails({ ...connectionDetails, username: e.target.value })}
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