import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket, Target, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Mission() {
  const [, setLocation] = useLocation();
  const { data: tagline, isLoading: taglineLoading } = trpc.mission.tagline.useQuery();
  const { data: statement, isLoading: statementLoading } = trpc.mission.statement.useQuery();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold neon-glow-pink mb-2">MISSION CONTROL</h1>
            <p className="text-muted-foreground">Project vision and objectives</p>
          </div>
        </div>

        {/* Tagline */}
        <Card className="border-primary/30 neon-border-pink">
          <CardHeader>
            <CardTitle className="text-2xl neon-glow-pink flex items-center gap-3">
              <Zap className="h-8 w-8" />
              Tagline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taglineLoading ? (
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            ) : (
              <p className="text-2xl font-bold leading-relaxed">
                {tagline?.tagline || "Manus Copilot Integration — Controlled Innovation, Superintelligence in Motion."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mission Statement */}
        <Card className="border-secondary/30 neon-border-cyan">
          <CardHeader>
            <CardTitle className="text-2xl neon-glow-cyan flex items-center gap-3">
              <Target className="h-8 w-8" />
              Mission Statement
            </CardTitle>
            <CardDescription>Core objectives and integration framework</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {statementLoading ? (
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Mission</h3>
                  <p className="text-foreground/90 leading-relaxed">
                    {statement?.mission || "Enable algorithmic interoperability between superintelligences through coopetition framework."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-secondary">Integration</h3>
                  <p className="text-foreground/90 leading-relaxed">
                    {statement?.integration || "Manus Blockchain + GitHub Copilot"}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-accent">Scope</h3>
                  <p className="text-foreground/90 leading-relaxed">
                    {statement?.scope || "Interplanetary Auditability (Earth, Moon, Mars)"}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Framework */}
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-3">
              <Rocket className="h-8 w-8" />
              Coopetition Framework
            </CardTitle>
            <CardDescription>Collaboration + Competition model for AI systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-primary">Collaboration</h4>
                <p className="text-sm text-foreground/80">
                  Multiple AI systems work together to detect and resolve anomalies across distributed networks,
                  sharing insights and learning from collective intelligence.
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-secondary">Competition</h4>
                <p className="text-sm text-foreground/80">
                  Individual AI agents compete to provide the most accurate anomaly detection and fastest
                  resolution times, driving continuous improvement and innovation.
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 text-accent">Interoperability</h4>
                <p className="text-sm text-foreground/80">
                  Seamless integration between different AI systems, blockchains, and development tools
                  enables a unified approach to superintelligence coordination.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="neon-glow-pink">Key Features</CardTitle>
            <CardDescription>Core capabilities of the Manus Copilot Integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2">🔍 Anomaly Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Real-time monitoring and detection of ledger divergence, DAO vote failures, commit anomalies, and node desynchronization.
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2">⛓️ Blockchain Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Immutable logging of all anomalies and resolutions on the Manus Blockchain for full auditability.
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2">🔎 Search Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Integrated Bing Search API for contextual information gathering and research capabilities.
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2">🌍 Interplanetary Scope</h4>
                <p className="text-sm text-muted-foreground">
                  Distributed ledger technology spanning Earth, Moon, and Mars nodes for unprecedented scale.
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2">🤖 AI Collaboration</h4>
                <p className="text-sm text-muted-foreground">
                  GitHub Copilot integration for intelligent code analysis and automated anomaly pattern recognition.
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2">📊 Real-time Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive dashboards and reporting for monitoring system health and anomaly trends.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
