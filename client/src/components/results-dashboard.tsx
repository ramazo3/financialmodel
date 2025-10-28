import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import type { FinancialModel, GeneratedModel } from "@shared/schema";
import { FinancialCharts } from "@/components/financial-charts";

interface ResultsDashboardProps {
  modelId: string;
  onStartOver: () => void;
}

export function ResultsDashboard({ modelId, onStartOver }: ResultsDashboardProps) {
  const { data: model, isLoading } = useQuery<FinancialModel>({
    queryKey: ["/api/models", modelId],
  });

  const generatedModel = model?.generatedModel as GeneratedModel | undefined;

  const handleDownload = async () => {
    if (!model?.excelFilePath) return;
    
    // Trigger download
    const link = document.createElement("a");
    link.href = `/api/download/${modelId}`;
    link.download = `financial-model-${modelId}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDocx = async () => {
    if (!model?.pdfFilePath) return;
    
    // Trigger download
    const link = document.createElement("a");
    link.href = `/api/download-docx/${modelId}`;
    link.download = `business-report-${modelId}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || !model || !generatedModel) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">Your Financial Model is Ready!</CardTitle>
              <CardDescription className="text-base">
                We've created a comprehensive financial model based on your inputs. Download the Excel file below to explore detailed projections, cash flow analysis, and strategic recommendations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Download Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Financial Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Excel workbook with projections & analysis
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleDownload}
                className="min-w-[140px]"
                data-testid="button-download-excel"
              >
                <Download className="mr-2 h-5 w-5" />
                Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Research Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Business report with market analysis
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleDownloadDocx}
                className="min-w-[140px]"
                data-testid="button-download-docx"
              >
                <Download className="mr-2 h-5 w-5" />
                DOCX
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Year 1 Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-foreground">
              ${generatedModel.keyMetrics.year1TotalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Year 1 Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold font-mono ${generatedModel.keyMetrics.year1NetProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              ${generatedModel.keyMetrics.year1NetProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-primary">
              {generatedModel.keyMetrics.roi.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Break-Even</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono text-foreground">
              Month {generatedModel.keyMetrics.breakEvenMonth}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            {generatedModel.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Financial Charts & Visualizations */}
      <FinancialCharts generatedModel={generatedModel} />

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            Risk Analysis
          </CardTitle>
          <CardDescription>
            Key risks identified and recommended mitigation strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedModel.riskAnalysis.map((risk, index) => {
              const impactLevel = risk.impact.toLowerCase();
              const isHigh = impactLevel.includes('high');
              const isMedium = impactLevel.includes('medium');
              const isLow = impactLevel.includes('low');
              
              const severityColors = isHigh 
                ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
                : isMedium 
                ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
              
              const badgeVariant = isHigh ? 'destructive' : isMedium ? 'default' : 'secondary';
              
              return (
                <div
                  key={index}
                  className={`p-5 rounded-lg border-l-4 ${severityColors} border border-border/50`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-semibold text-base text-foreground flex-1 leading-snug">
                        {risk.risk}
                      </h4>
                      <Badge variant={badgeVariant} className="flex-shrink-0">
                        {risk.impact}
                      </Badge>
                    </div>
                    <div className="pl-4 border-l-2 border-muted">
                      <p className="text-sm text-muted-foreground mb-1 font-medium">
                        Mitigation Strategy:
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {risk.mitigation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Strategic Recommendations</CardTitle>
          <CardDescription>
            AI-generated insights to optimize your business model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {generatedModel.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{rec}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="lg" onClick={onStartOver} data-testid="button-start-over">
          <RefreshCw className="mr-2 h-4 w-4" />
          Create Another Model
        </Button>

        <Button
          size="lg"
          onClick={handleDownload}
          className="min-w-[200px]"
          data-testid="button-download-excel-bottom"
        >
          <Download className="mr-2 h-5 w-5" />
          Download Excel
        </Button>
      </div>
    </div>
  );
}
