import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Filter, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Anomalies() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: anomalies, isLoading } = trpc.anomalies.filter.useQuery({
    type: typeFilter || undefined,
    severity: severityFilter || undefined,
    status: statusFilter || undefined,
  });

  const clearFilters = () => {
    setTypeFilter("");
    setSeverityFilter("");
    setStatusFilter("");
  };

  const hasFilters = typeFilter || severityFilter || statusFilter;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'investigating': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'detected': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'ignored': return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold neon-glow-pink mb-2">ANOMALIES</h1>
            <p className="text-muted-foreground">Browse and filter all detected anomalies</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle>Filters</CardTitle>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="ledger_divergence">Ledger Divergence</SelectItem>
                    <SelectItem value="dao_vote_failure">DAO Vote Failure</SelectItem>
                    <SelectItem value="commit_anomaly">Commit Anomaly</SelectItem>
                    <SelectItem value="node_desync">Node Desync</SelectItem>
                    <SelectItem value="network_latency">Network Latency</SelectItem>
                    <SelectItem value="data_corruption">Data Corruption</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Severity</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="detected">Detected</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anomalies List */}
        <Card className="border-secondary/20">
          <CardHeader>
            <CardTitle className="neon-glow-cyan">
              {isLoading ? "Loading..." : `${anomalies?.length || 0} Anomalies Found`}
            </CardTitle>
            <CardDescription>
              {hasFilters ? "Filtered results" : "Showing all anomalies"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="animate-pulse">Loading anomalies...</div>
              </div>
            ) : anomalies && anomalies.length > 0 ? (
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <Link key={anomaly.id} href={`/anomalies/${anomaly.id}`}>
                    <div className="p-4 border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            <span className="font-bold text-lg group-hover:neon-glow-pink transition-all">
                              {anomaly.type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded border ${getSeverityColor(anomaly.severity)}`}>
                              {anomaly.severity.toUpperCase()}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded border ${getStatusColor(anomaly.status)}`}>
                              {anomaly.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 mb-3">{anomaly.description}</p>
                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                            <span>
                              <strong>Source:</strong> {anomaly.source}
                            </span>
                            <span>
                              <strong>Detected:</strong> {new Date(anomaly.detectedAt).toLocaleString()}
                            </span>
                            {anomaly.resolvedAt && (
                              <span className="text-green-500">
                                <strong>Resolved:</strong> {new Date(anomaly.resolvedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No anomalies found matching your filters.</p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
