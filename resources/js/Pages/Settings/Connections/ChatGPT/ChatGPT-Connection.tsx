import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';

export default function ChatGPTConnection() {
  const [apiKey, setApiKey] = useState('');
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Handle loading state
  const [isProcessing, setIsProcessing] = useState(false); // Handle actions like connect/disconnect

  // Fetch connection details on load
  useEffect(() => {
    const fetchConnection = async () => {
      try {
        const response = await axios.get('/settings/connections/chatgpt');
        if (response.data.connected) {
          setConnected(true);
          setApiKey(response.data.api_key || '');
        } else {
          setConnected(false);
          setApiKey('');
        }
      } catch {
        setConnected(false);
        setApiKey('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnection();
  }, []);

  // Handle Connect
  const handleConnect = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post('/settings/connections/chatgpt/connect', { api_key: apiKey });
      if (response.status === 200) {
        setConnected(true);
        toast.success('Successfully connected to ChatGPT!');
      } else {
        setConnected(false);
        console.error('Connection failed:', response.data); // Log error details for debugging
        toast.error('Failed to connect to ChatGPT. Please try again.');
      }
    } catch (error: any) {
      setConnected(false);
      console.error('Connection error:', error.response || error); // Log error details for debugging
      toast.error('Failed to connect to ChatGPT. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    try {
      const response = await axios.post('/settings/connections/chatgpt/test', { api_key: apiKey });
      if (response.status === 200) {
        toast.success('ChatGPT connection is working!');
      } else {
        console.error('Test connection failed:', response.data); // Log error details for debugging
        toast.error('Failed to test ChatGPT connection. Please try again.');
      }
    } catch (error: any) {
      console.error('Test connection error:', error.response || error); // Log error details for debugging
      toast.error('Failed to test ChatGPT connection. Please try again.');
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.delete('/settings/connections/chatgpt');
      if (response.status === 200) {
        setConnected(false);
        setApiKey('');
        toast.success('Successfully disconnected from ChatGPT.');
      } else {
        console.error('Disconnect failed:', response.data); // Log error details for debugging
        toast.error('Failed to disconnect from ChatGPT. Please try again.');
      }
    } catch (error: any) {
      console.error('Disconnect error:', error.response || error); // Log error details for debugging
      toast.error('Failed to disconnect from ChatGPT. Please try again.');
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
        <h2 className="text-xl font-semibold leading-7 text-gray-900">ChatGPT API</h2>
        <Badge variant={badgeVariant}>
          {isLoading ? 'Loading...' : connected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>
      {!isLoading && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {connected
              ? 'Your ChatGPT API connection is active.'
              : 'Enter your ChatGPT API Key to connect and test the connection.'}
          </p>

          {/* Separator */}
          <hr className="my-4" />

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isProcessing || connected}
            />
            <div className="flex gap-4">
              {!connected && (
                <Button onClick={handleConnect} disabled={isProcessing || !apiKey}>
                  {isProcessing ? 'Processing...' : 'Connect'}
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