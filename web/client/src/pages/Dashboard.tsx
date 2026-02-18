import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, CheckCircle2, Clock, Zap, Search as SearchIcon, Globe, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: anomalies, isLoading: anomaliesLoading, refetch: refetchAnomalies } = trpc.anomalies.list.useQuery();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.anomalies.stats.useQuery();
  const { data: blockchainStatus } = trpc.blockchain.status.useQuery();
  const detectMutation = trpc.anomalies.detect.useMutation();
  
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      await detectMutation.mutateAsync();
      toast.success("Anomaly detection triggered successfully");
      await refetchAnomalies();
      await refetchStats();
    } catch (error) {
      toast.error("Failed to trigger anomaly detection");
    } finally {
      setIsDetecting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-500';
      case 'investigating': return 'text-yellow-500';
      case 'detected': return 'text-red-500';
      case 'ignored': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold neon-glow-pink mb-2">MISSION CONTROL</h1>
            <p className="text-muted-foreground">Real-time Anomaly Detection & Monitoring System</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/search">
              <Button variant="outline" size="sm">
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Button>
            </Link>
            <Link href="/blockchain">
              <Button variant="outline" size="sm">
                <Globe className="mr-2 h-4 w-4" />
                Blockchain
              </Button>
            </Link>
            <Link href="/mission">
              <Button variant="outline" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Mission
              </Button>
            </Link>
            <Button 
              onClick={handleDetect}
              disabled={isDetecting}
              className="neon-border-cyan"
              size="sm"
            >
              {isDetecting ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Trigger Detection
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/30 neon-border-pink">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Anomalies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-glow-pink">
                {statsLoading ? "..." : stats?.total_anomalies || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/30 neon-border-cyan">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold neon-glow-cyan">
                {statsLoading ? "..." : stats?.pending_anomalies || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {statsLoading ? "..." : stats?.resolved_anomalies || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blockchain Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-accent">
                {blockchainStatus?.sync_status || "Unknown"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Block #{blockchainStatus?.current_block || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Severity Distribution */}
        {stats && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="neon-glow-cyan">Severity Distribution</CardTitle>
              <CardDescription>Anomalies grouped by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.by_severity || {}).map(([severity, count]) => (
                  <div key={severity} className="text-center p-4 border border-border rounded-lg">
                    <div className={`text-2xl font-bold ${getSeverityColor(severity)}`}>
                      {count as number}
                    </div>
                    <div className="text-sm text-muted-foreground uppercase mt-1">
                      {severity}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Anomalies */}
        <Card className="border-secondary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="neon-glow-pink">Recent Anomalies</CardTitle>
                <CardDescription>Latest detected anomalies in the system</CardDescription>
              </div>
              <Link href="/anomalies">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {anomaliesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading anomalies...</div>
            ) : anomalies && anomalies.length > 0 ? (
              <div className="space-y-3">
                {anomalies.slice(0, 5).map((anomaly) => (
                  <Link key={anomaly.id} href={`/anomalies/${anomaly.id}`}>
                    <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-4 w-4 ${getSeverityColor(anomaly.severity)}`} />
                            <span className="font-medium">{anomaly.type.replace(/_/g, ' ').toUpperCase()}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(anomaly.status)}`}>
                              {anomaly.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(anomaly.detectedAt).toLocaleString()}
                            </span>
                            <span>{anomaly.source}</span>
                          </div>
                        </div>
                        {anomaly.status === 'resolved' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 ml-4" />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No anomalies detected yet. Click "Trigger Detection" to start monitoring.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
