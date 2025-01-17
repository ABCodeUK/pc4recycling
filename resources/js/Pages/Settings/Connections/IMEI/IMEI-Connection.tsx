import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function IMEIConnection() {
  const [apiKey, setApiKey] = useState("");
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch connection details on load
  useEffect(() => {
    const fetchConnection = async () => {
      try {
        const response = await axios.get("/settings/connections/imei");
        if (response.data.connected) {
          setConnected(true);
          setApiKey(response.data.api_key || "");
        } else {
          setConnected(false);
          setApiKey("");
        }
      } catch {
        setConnected(false);
        setApiKey("");
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
      const response = await axios.post("/settings/connections/imei/connect", {
        api_key: apiKey,
      });
      if (response.status === 200) {
        setConnected(true);
        toast.success("Successfully connected to IMEI!");
      } else {
        setConnected(false);
        toast.error(response.data.message || "Failed to connect to IMEI.");
      }
    } catch (error: any) {
      setConnected(false);
      toast.error(
        error.response?.data?.message || "An error occurred while connecting."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.post("/settings/connections/imei/test", {
        api_key: apiKey,
      });
      if (response.status === 200) {
        toast.success("IMEI connection is working!");
      } else {
        toast.error(response.data.message || "Failed to test IMEI connection.");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while testing the connection."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      const response = await axios.delete("/settings/connections/imei");
      if (response.status === 200) {
        setConnected(false);
        setApiKey("");
        toast.success("Successfully disconnected from IMEI.");
      } else {
        toast.error(response.data.message || "Failed to disconnect.");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "An error occurred while disconnecting."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const badgeVariant = isLoading
    ? "default"
    : connected
    ? "success"
    : "destructive";

  return (
    <div className="bg-white border shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold leading-7 text-gray-900">
          IMEI API
        </h2>
        <Badge variant={badgeVariant}>
          {isLoading ? "Loading..." : connected ? "Connected" : "Not Connected"}
        </Badge>
      </div>
      {!isLoading && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {connected
              ? "Your IMEI API connection is active."
              : "Enter your IMEI API Key to connect and test the connection."}
          </p>

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
                  {isProcessing ? "Processing..." : "Connect"}
                </Button>
              )}
              {connected && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isProcessing}
                  >
                    Test Connection
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    disabled={isProcessing}
                  >
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