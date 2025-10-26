import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { BusinessIdeaForm } from "@/components/business-idea-form";
import { SectorSelection } from "@/components/sector-selection";
import { FinancialAssumptionsForm } from "@/components/financial-assumptions-form";
import { AgentProcessing } from "@/components/agent-processing";
import { ResultsDashboard } from "@/components/results-dashboard";
import type { BusinessIdeaInput, FinancialAssumptions } from "@shared/schema";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormData {
  businessIdea?: BusinessIdeaInput;
  financialAssumptions?: FinancialAssumptions;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({});
  const [modelId, setModelId] = useState<string | null>(null);

  const steps = [
    { number: 1, title: "Business Idea", description: "Describe your vision" },
    { number: 2, title: "Sector Match", description: "Select your industry" },
    { number: 3, title: "Assumptions", description: "Financial inputs" },
    { number: 4, title: "AI Processing", description: "Model generation" },
    { number: 5, title: "Results", description: "Download model" },
  ];

  const handleBusinessIdeaSubmit = (data: BusinessIdeaInput) => {
    setFormData(prev => ({ ...prev, businessIdea: data }));
    setCurrentStep(2);
  };

  const handleSectorSelect = (sectorName: string) => {
    setFormData(prev => ({
      ...prev,
      businessIdea: { ...prev.businessIdea!, selectedSector: sectorName }
    }));
    setCurrentStep(3);
  };

  const handleAssumptionsSubmit = (data: FinancialAssumptions) => {
    setFormData(prev => ({ ...prev, financialAssumptions: data }));
    setCurrentStep(4);
  };

  const handleProcessingComplete = (id: string) => {
    setModelId(id);
    setCurrentStep(5);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setFormData({});
    setModelId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header showModelsButton={true} />

      {/* Progress Stepper */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-3 flex-1">
                  {/* Circle */}
                  <div className="relative">
                    {currentStep > step.number ? (
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center" data-testid={`step-${step.number}-complete`}>
                        <CheckCircle className="h-7 w-7 text-primary-foreground" />
                      </div>
                    ) : currentStep === step.number ? (
                      <div className="h-12 w-12 rounded-full border-2 border-primary bg-background flex items-center justify-center" data-testid={`step-${step.number}-active`}>
                        <span className="text-lg font-semibold text-primary">{step.number}</span>
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full border-2 border-muted bg-muted/30 flex items-center justify-center" data-testid={`step-${step.number}-inactive`}>
                        <span className="text-lg font-medium text-muted-foreground">{step.number}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Labels */}
                  <div className="text-center">
                    <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-border mx-4 mb-8">
                    <div 
                      className={`h-full transition-all duration-500 ${currentStep > step.number ? 'bg-primary' : 'bg-transparent'}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {currentStep === 1 && (
          <BusinessIdeaForm onSubmit={handleBusinessIdeaSubmit} />
        )}

        {currentStep === 2 && (
          <SectorSelection 
            businessIdea={formData.businessIdea?.businessIdea || ""}
            onSelect={handleSectorSelect}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <FinancialAssumptionsForm
            selectedSector={formData.businessIdea?.selectedSector}
            onSubmit={handleAssumptionsSubmit}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <AgentProcessing
            formData={{
              ...formData.businessIdea!,
              ...formData.financialAssumptions!,
            }}
            onComplete={handleProcessingComplete}
          />
        )}

        {currentStep === 5 && modelId && (
          <ResultsDashboard
            modelId={modelId}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Powered by Google Gemini AI • Financial models are for planning purposes only
          </p>
        </div>
      </footer>
    </div>
  );
}
