import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { FinancialModel } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSpreadsheet, Download, Eye, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function ModelsPage() {
  const [, setLocation] = useLocation();
  
  const { data: models, isLoading } = useQuery<FinancialModel[]>({
    queryKey: ['/api/models'],
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };
    
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-2">
              Saved Financial Models
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage all your generated financial models
            </p>
          </div>
          <Link href="/">
            <Button data-testid="button-create-new">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Create New Model
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !models || models.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
                No models yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                Get started by creating your first financial model
              </p>
              <Link href="/">
                <Button data-testid="button-create-first">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Create First Model
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => {
              const generatedData = model.generatedModel as any;
              const hasResults = model.status === "completed" && generatedData;
              
              return (
                <Card key={model.id} className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-model-${model.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {model.name || model.businessIdea.substring(0, 60) + (model.businessIdea.length > 60 ? '...' : '')}
                      </CardTitle>
                      {getStatusBadge(model.status)}
                    </div>
                    <CardDescription className="flex items-center text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(model.createdAt!), 'MMM dd, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {model.businessIdea}
                    </div>
                    
                    {model.selectedSector && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-medium">Sector:</span> {model.selectedSector}
                      </div>
                    )}

                    {hasResults && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs">
                          <div className="text-gray-500 dark:text-gray-500">ROI</div>
                          <div className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {generatedData.keyMetrics?.roi ? `${Math.round(generatedData.keyMetrics.roi)}%` : 'N/A'}
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="text-gray-500 dark:text-gray-500">Break-Even</div>
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            {generatedData.keyMetrics?.breakEvenMonth ? `Month ${generatedData.keyMetrics.breakEvenMonth}` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {model.status === "failed" && (
                      <div className="flex items-center text-xs text-red-600 dark:text-red-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Model generation failed
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {hasResults && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setLocation(`/models/${model.id}`)}
                            data-testid={`button-view-${model.id}`}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {model.excelFilePath && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/api/download/${model.id}`;
                              }}
                              data-testid={`button-download-${model.id}`}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Excel
                            </Button>
                          )}
                        </>
                      )}
                      {model.status === "processing" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setLocation(`/models/${model.id}`)}
                          data-testid={`button-view-processing-${model.id}`}
                        >
                          View Progress
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
