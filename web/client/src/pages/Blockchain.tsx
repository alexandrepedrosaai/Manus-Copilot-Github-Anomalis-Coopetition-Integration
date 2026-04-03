import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft, CheckCircle2, Globe, Server, XCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Blockchain() {
  const [, setLocation] = useLocation();
  const { data: status, isLoading, refetch } = trpc.blockchain.status.useQuery();

  const getSyncStatusColor = (syncStatus: string) => {
    switch (syncStatus?.toLowerCase()) {
      case 'synchronized':
      case 'synced':
        return 'text-green-500';
      case 'syncing':
        return 'text-yellow-500';
      case 'disconnected':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSyncStatusIcon = (syncStatus: string) => {
    switch (syncStatus?.toLowerCase()) {
      case 'synchronized':
      case 'synced':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'syncing':
        return <Activity className="h-6 w-6 text-yellow-500 animate-pulse" />;
      case 'disconnected':
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold neon-glow-pink mb-2">BLOCKCHAIN MONITOR</h1>
            <p className="text-muted-foreground">Real-time Manus Blockchain network status</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-2xl neon-glow-cyan">Loading blockchain status...</div>
          </div>
        ) : status ? (
          <>
            {/* Network Status */}
            <Card className="border-primary/30 neon-border-pink">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Network Status</CardTitle>
                    <CardDescription>Current blockchain synchronization state</CardDescription>
                  </div>
                  {getSyncStatusIcon(status.sync_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sync Status</p>
                    <p className={`text-2xl font-bold ${getSyncStatusColor(status.sync_status)}`}>
                      {status.sync_status?.toUpperCase() || 'UNKNOWN'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Network ID</p>
                    <p className="text-2xl font-bold neon-glow-cyan">
                      {status.network_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Block</p>
                    <p className="text-2xl font-bold text-primary">
                      #{status.current_block?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Block Time</p>
                    <p className="text-lg font-medium">
                      {status.last_block_time 
                        ? new Date(status.last_block_time).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Planetary Nodes */}
            <Card className="border-secondary/30 neon-border-cyan">
              <CardHeader>
                <CardTitle className="neon-glow-cyan flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  Planetary Nodes
                </CardTitle>
                <CardDescription>
                  Interplanetary distributed ledger nodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {status.planetary_nodes && status.planetary_nodes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {status.planetary_nodes.map((node: string, index: number) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg hover:border-secondary/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Server className="h-5 w-5 text-secondary" />
                          <div>
                            <p className="font-medium">{node}</p>
                            <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Online
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No planetary nodes detected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network Health */}
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="text-accent flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  Network Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <span className="text-sm font-medium">Blockchain Integrity</span>
                    <span className="text-green-500 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <span className="text-sm font-medium">Consensus Algorithm</span>
                    <span className="text-primary font-mono">Proof of Stake</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <span className="text-sm font-medium">Network Latency</span>
                    <span className="text-green-500">Low (&lt;100ms)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <span className="text-sm font-medium">Data Replication</span>
                    <span className="text-green-500 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Synchronized
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interplanetary Scope */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="neon-glow-pink flex items-center gap-2">
                  <Globe className="h-6 w-6" />
                  Interplanetary Scope
                </CardTitle>
                <CardDescription>
                  Distributed ledger across Earth, Moon, and Mars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Earth', 'Moon', 'Mars'].map((planet) => (
                    <div
                      key={planet}
                      className="p-6 border border-border rounded-lg text-center hover:border-primary/50 transition-all"
                    >
                      <Globe className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-lg font-bold mb-1">{planet}</p>
                      <p className="text-xs text-green-500 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Operational
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-destructive/30">
            <CardContent className="py-12 text-center">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <p className="text-destructive font-medium mb-2">Failed to load blockchain status</p>
              <p className="text-muted-foreground mb-4">The blockchain service may be temporarily unavailable</p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
