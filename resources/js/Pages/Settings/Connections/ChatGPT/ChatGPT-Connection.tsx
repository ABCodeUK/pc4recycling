import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ChatGPTConnection() {
  const [apiKey, setApiKey] = useState('');
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Connect
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/settings/connections/chatgpt/connect', { apiKey });
      if (response.status === 200) {
        setConnected(true);
        toast.success('Connected to ChatGPT!');
      }
    } catch (error) {
      setConnected(false);
      toast.error('Failed to connect to ChatGPT. Please check the API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    try {
      const response = await axios.post('/settings/connections/chatgpt/test', { apiKey });
      if (response.status === 200) {
        toast.success('ChatGPT connection is working!');
      }
    } catch (error) {
      toast.error('Connection test failed. Please check the API key.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">ChatGPT</h2>
        <Badge variant={connected ? 'success' : 'default'}>
          {connected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Enter your ChatGPT API Key to connect and test the connection.
      </p>
      <div className="space-y-4">
        <Input
          type="password"
          placeholder="Enter API Key"
          value={connected ? '********' : apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={connected}
        />
        <div className="flex gap-4">
          <Button onClick={handleConnect} disabled={connected || isLoading}>
            {isLoading ? 'Connecting...' : connected ? 'Reconnect' : 'Connect'}
          </Button>
          {connected && (
            <Button variant="outline" onClick={handleTestConnection}>
              Test Connection
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
