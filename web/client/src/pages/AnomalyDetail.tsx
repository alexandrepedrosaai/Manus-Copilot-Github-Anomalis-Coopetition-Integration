import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Database } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AnomalyDetail({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const anomalyId = parseInt(params.id);
  const [resolution, setResolution] = useState("");
  
  const { data: anomaly, isLoading, refetch } = trpc.anomalies.getById.useQuery({ id: anomalyId });
  const resolveMutation = trpc.anomalies.resolve.useMutation();

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error("Please provide a resolution description");
      return;
    }

    try {
      await resolveMutation.mutateAsync({
        id: anomalyId,
        resolution: resolution.trim(),
      });
      toast.success("Anomaly marked as resolved");
      await refetch();
      setResolution("");
    } catch (error) {
      toast.error("Failed to resolve anomaly");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'low': return 'bg-blue-500/20 text-blue-500 border-blue-500';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-500 border-green-500';
      case 'investigating': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'detected': return 'bg-red-500/20 text-red-500 border-red-500';
      case 'ignored': return 'bg-gray-500/20 text-gray-500 border-gray-500';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl neon-glow-cyan">Loading anomaly details...</div>
        </div>
      </div>
    );
  }

  if (!anomaly) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Anomaly Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The requested anomaly could not be found.</p>
            <Button onClick={() => setLocation("/anomalies")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Anomalies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/anomalies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold neon-glow-pink">ANOMALY DETAILS</h1>
            <p className="text-muted-foreground">ID: {anomaly.externalId}</p>
          </div>
        </div>

        {/* Main Info */}
        <Card className="border-primary/30 neon-border-pink">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">
                    {anomaly.type.replace(/_/g, ' ').toUpperCase()}
                  </CardTitle>
                  <CardDescription className="mt-1">{anomaly.description}</CardDescription>
                </div>
              </div>
              {anomaly.status === 'resolved' && (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Severity</p>
                <span className={`inline-block px-3 py-1 rounded border text-sm font-medium ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded border text-sm font-medium ${getStatusColor(anomaly.status)}`}>
                  {anomaly.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Source</p>
                <p className="font-medium">{anomaly.source}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Detected At</p>
                <p className="font-medium text-sm">
                  {new Date(anomaly.detectedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        {anomaly.metadata && Object.keys(anomaly.metadata).length > 0 && (
          <Card className="border-secondary/30">
            <CardHeader>
              <CardTitle className="neon-glow-cyan flex items-center gap-2">
                <Database className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-card/50 p-4 rounded border border-border">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(anomaly.metadata, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resolution */}
        {anomaly.status === 'resolved' ? (
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-500 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolved At</p>
                <p className="font-medium">
                  {anomaly.resolvedAt ? new Date(anomaly.resolvedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Resolution Details</p>
                <p className="text-foreground/90">{anomaly.resolution || 'No details provided'}</p>
              </div>
              {anomaly.blockchainTxHash && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Blockchain Transaction</p>
                  <code className="text-xs bg-card/50 px-2 py-1 rounded border border-border">
                    {anomaly.blockchainTxHash}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="neon-glow-pink">Resolve Anomaly</CardTitle>
              <CardDescription>Provide resolution details and mark this anomaly as resolved</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe how this anomaly was resolved..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button 
                onClick={handleResolve}
                disabled={resolveMutation.isPending || !resolution.trim()}
                className="w-full"
              >
                {resolveMutation.isPending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-2 bg-primary rounded-full"></div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">Anomaly Detected</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(anomaly.detectedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {anomaly.resolvedAt && (
                <div className="flex gap-4">
                  <div className="w-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-green-500">Anomaly Resolved</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(anomaly.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
