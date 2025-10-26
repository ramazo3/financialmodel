import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Brain, Calculator, Shield, FileSpreadsheet, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { FinancialModel } from "@shared/schema";

interface AgentProcessingProps {
  formData: {
    businessIdea: string;
    selectedSector?: string;
    startupCost: number;
    monthlyRevenue: number;
    grossMargin: number;
    operatingExpenses: number;
  };
  onComplete: (modelId: string) => void;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: typeof Brain;
}

const agents: Agent[] = [
  {
    id: "data_analyst",
    name: "Data Analyst Agent",
    description: "Analyzing your business idea and sector benchmarks",
    icon: Brain,
  },
  {
    id: "financial_modeler",
    name: "Financial Modeler Agent",
    description: "Building revenue projections and cash flow models",
    icon: Calculator,
  },
  {
    id: "validator",
    name: "Validator Agent",
    description: "Validating assumptions and identifying risks",
    icon: Shield,
  },
  {
    id: "excel_generator",
    name: "Excel Generator Agent",
    description: "Creating your comprehensive Excel financial model",
    icon: FileSpreadsheet,
  },
];

export function AgentProcessing({ formData, onComplete }: AgentProcessingProps) {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("Initializing AI agents...");
  const [modelId, setModelId] = useState<string | null>(null);
  const [agentIntervalId, setAgentIntervalId] = useState<NodeJS.Timeout | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-model", formData);
      return await response.json() as { id: string; status: string };
    },
    onSuccess: (data) => {
      setModelId(data.id);
    },
    onError: (error) => {
      console.error("Error generating model:", error);
      setStatusMessage("Error: Failed to start model generation. Please try again.");
    },
  });

  // Poll for model status
  const { data: model, error: queryError } = useQuery<FinancialModel>({
    queryKey: ["/api/models", modelId],
    enabled: !!modelId,
    queryFn: async () => {
      const response = await fetch(`/api/models/${modelId}`);
      if (!response.ok) throw new Error('Failed to fetch model status');
      return response.json();
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling once completed or failed
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Handle network/query errors
  useEffect(() => {
    if (queryError) {
      setStatusMessage("Error: Network error while checking status. Please refresh the page.");
    }
  }, [queryError]);

  useEffect(() => {
    // Start the generation process
    generateMutation.mutate();

    // Simulate agent progress UI (cosmetic only)
    const agentInterval = setInterval(() => {
      setCurrentAgentIndex(prev => {
        if (prev < agents.length - 1) {
          setCompletedAgents(completed => [...completed, agents[prev].id]);
          setStatusMessage(agents[prev + 1].description);
          console.log(`Cosmetic progress: Agent ${prev + 1} of ${agents.length}`);
          return prev + 1;
        }
        return prev; // Don't increment past the last agent
      });
    }, 6000); // Each agent takes ~6 seconds (total 24s for 4 agents)

    setAgentIntervalId(agentInterval);

    return () => {
      if (agentInterval) clearInterval(agentInterval);
    };
  }, []);

  // Check if processing is complete or failed
  useEffect(() => {
    console.log('Model status check:', { status: model?.status, hasGeneratedModel: !!model?.generatedModel, modelId: model?.id });
    
    if (model?.status === "completed" && model.generatedModel) {
      console.log('Model completed! Clearing interval and updating UI');
      // Clear cosmetic progress interval
      if (agentIntervalId) {
        clearInterval(agentIntervalId);
        setAgentIntervalId(null);
      }
      setCurrentAgentIndex(agents.length - 1);
      setCompletedAgents(agents.map(a => a.id));
      setStatusMessage("Model generation complete!");
      onComplete(model.id);
    } else if (model?.status === "failed") {
      console.log('Model failed!');
      // Clear cosmetic progress interval
      if (agentIntervalId) {
        clearInterval(agentIntervalId);
        setAgentIntervalId(null);
      }
      setStatusMessage("Error: Model generation failed. Please try again.");
      setCurrentAgentIndex(0);
      setCompletedAgents([]);
    }
  }, [model, onComplete, agentIntervalId]);

  const progress = ((completedAgents.length) / agents.length) * 100;
  const currentAgent = agents[currentAgentIndex];
  const hasError = model?.status === "failed" || generateMutation.isError;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className={`border-2 ${hasError ? 'bg-gradient-to-br from-destructive/5 to-transparent border-destructive/50' : 'bg-gradient-to-br from-primary/5 to-transparent'}`}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {hasError ? (
              <>
                <AlertCircle className="h-6 w-6 text-destructive" />
                Processing Error
              </>
            ) : (
              "AI Agents at Work"
            )}
          </CardTitle>
          <CardDescription className="text-base">
            {hasError 
              ? "An error occurred during model generation. Please check your inputs and try again."
              : "Our 4-agent system is analyzing your business and creating a comprehensive financial model. This typically takes 20-30 seconds."
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="font-mono font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-lg border ${hasError ? 'bg-destructive/10 border-destructive/50' : 'bg-muted/50'}`}>
            {hasError ? (
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
            )}
            <p className={`text-sm ${hasError ? 'text-destructive' : 'text-muted-foreground'}`}>{statusMessage}</p>
          </div>
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, index) => {
          const isCompleted = completedAgents.includes(agent.id);
          const isActive = currentAgentIndex === index;
          const AgentIcon = agent.icon;

          return (
            <Card
              key={agent.id}
              className={`transition-all ${
                isActive
                  ? "border-2 border-primary bg-primary/5 shadow-lg"
                  : isCompleted
                  ? "border-primary/50 bg-primary/5"
                  : "border-muted bg-muted/10"
              }`}
              data-testid={`agent-card-${agent.id}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isActive ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <AgentIcon className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight mb-2">
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {agent.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <Badge variant="default" className="bg-primary">
                        Complete
                      </Badge>
                    ) : isActive ? (
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        Running
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">What's happening behind the scenes?</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Analyzing your business model against 35+ sector benchmarks</li>
                <li>• Building 12-month revenue and cash flow projections</li>
                <li>• Identifying key risks and mitigation strategies</li>
                <li>• Generating a complete Excel financial model with multiple tabs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
