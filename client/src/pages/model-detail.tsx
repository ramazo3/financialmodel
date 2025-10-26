import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { FinancialModel } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft, FileSpreadsheet, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { VersionHistory } from "@/components/version-history";

export default function ModelDetailPage() {
  const [, params] = useRoute("/models/:id");
  const modelId = params?.id;

  const { data: model, isLoading } = useQuery<FinancialModel>({
    queryKey: ['/api/models', modelId],
    enabled: !!modelId,
    queryFn: async () => {
      const response = await fetch(`/api/models/${modelId}`);
      if (!response.ok) throw new Error('Failed to fetch model');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
                Model not found
              </h3>
              <Link href="/models">
                <Button data-testid="button-back-to-list">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Models
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const generatedData = model.generatedModel as any;
  const hasResults = model.status === "completed" && generatedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/models">
              <Button variant="outline" size="icon" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                {model.name || "Financial Model"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Created {format(new Date(model.createdAt!), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          {hasResults && model.excelFilePath && (
            <Button
              onClick={() => window.location.href = `/api/download/${model.id}`}
              data-testid="button-download-excel"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </Button>
          )}
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Idea</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{model.businessIdea}</p>
              {model.selectedSector && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sector: </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">{model.selectedSector}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Assumptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Startup Cost</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    ${Number(model.startupCost).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    ${Number(model.monthlyRevenue).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gross Margin</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    {model.grossMargin}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Operating Expenses</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                    ${Number(model.operatingExpenses).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {hasResults && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        {Math.round(generatedData.keyMetrics.roi)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Break-Even</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Month {generatedData.keyMetrics.breakEvenMonth}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Year 1 Revenue</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        ${Math.round(generatedData.keyMetrics.year1TotalRevenue).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Year 1 Profit</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                        ${Math.round(generatedData.keyMetrics.year1NetProfit).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {generatedData.executiveSummary}
                  </p>
                </CardContent>
              </Card>

              {generatedData.riskAnalysis && generatedData.riskAnalysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generatedData.riskAnalysis.map((risk: any, index: number) => (
                        <div key={index} className="border-l-4 border-red-400 pl-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-50">{risk.risk}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Impact:</span> {risk.impact}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Mitigation:</span> {risk.mitigation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedData.recommendations && generatedData.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedData.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <FileSpreadsheet className="w-4 h-4 mr-2 mt-1 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {model.status === "processing" && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
                  Processing Model
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your financial model is being generated by our AI agents...
                </p>
              </CardContent>
            </Card>
          )}

          {model.status === "failed" && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
                  Generation Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There was an error generating your financial model. Please try creating a new one.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Version History */}
          {modelId && <VersionHistory modelId={modelId} />}
        </div>
      </div>
    </div>
  );
}
