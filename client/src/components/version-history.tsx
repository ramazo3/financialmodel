import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, RotateCcw, FileText, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import type { ModelVersion } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VersionHistoryProps {
  modelId: string;
}

export function VersionHistory({ modelId }: VersionHistoryProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ModelVersion | null>(null);
  const [changeDescription, setChangeDescription] = useState("");
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: versions, isLoading } = useQuery<ModelVersion[]>({
    queryKey: ['/api/models', modelId, 'versions'],
    queryFn: async () => {
      const response = await fetch(`/api/models/${modelId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json();
    },
  });

  const saveVersionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/models/${modelId}/versions`, {
        changeDescription,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models', modelId, 'versions'] });
      setSaveDialogOpen(false);
      setChangeDescription("");
      toast({
        title: "Version Saved",
        description: "A new version of this model has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save version",
        variant: "destructive",
      });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return apiRequest('POST', `/api/models/${modelId}/versions/${versionId}/restore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/models', modelId] });
      queryClient.invalidateQueries({ queryKey: ['/api/models', modelId, 'versions'] });
      setRestoreDialogOpen(false);
      setSelectedVersion(null);
      toast({
        title: "Version Restored",
        description: "The model has been restored to the selected version.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to restore version",
        variant: "destructive",
      });
    },
  });

  const toggleVersionExpand = (versionId: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.add(versionId);
      }
      return next;
    });
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasVersions = versions && versions.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Version History
            </CardTitle>
            <Button
              onClick={() => setSaveDialogOpen(true)}
              size="sm"
              data-testid="button-save-version"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save Current as Version
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasVersions ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No versions saved yet</p>
              <p className="text-xs mt-1">Save a version to track changes over time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => {
                const isExpanded = expandedVersions.has(version.id);
                return (
                  <div
                    key={version.id}
                    className="border rounded-lg p-4 space-y-3"
                    data-testid={`version-${version.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" data-testid={`badge-version-${version.versionNumber}`}>
                            Version {version.versionNumber}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(version.createdAt!), 'MMM dd, yyyy • h:mm a')}
                          </span>
                        </div>
                        {version.changeDescription && (
                          <p className="text-sm text-foreground mt-2">
                            {version.changeDescription}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleVersionExpand(version.id)}
                          data-testid={`button-toggle-${version.id}`}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVersion(version);
                            setRestoreDialogOpen(true);
                          }}
                          data-testid={`button-restore-${version.id}`}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Startup Cost</p>
                          <p className="font-mono font-semibold">
                            {formatCurrency(version.startupCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Monthly Revenue</p>
                          <p className="font-mono font-semibold">
                            {formatCurrency(version.monthlyRevenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Gross Margin</p>
                          <p className="font-mono font-semibold">
                            {version.grossMargin ? `${version.grossMargin}%` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Operating Expenses</p>
                          <p className="font-mono font-semibold">
                            {formatCurrency(version.operatingExpenses)}
                          </p>
                        </div>
                        {version.selectedSector && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground text-xs">Sector</p>
                            <p className="font-semibold">{version.selectedSector}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Version Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent data-testid="dialog-save-version">
          <DialogHeader>
            <DialogTitle>Save New Version</DialogTitle>
            <DialogDescription>
              Create a snapshot of the current model state. You can restore this version later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="change-description">Change Description (Optional)</Label>
              <Textarea
                id="change-description"
                placeholder="Describe what changed in this version..."
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                rows={3}
                data-testid="textarea-change-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false);
                setChangeDescription("");
              }}
              data-testid="button-cancel-save"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveVersionMutation.mutate()}
              disabled={saveVersionMutation.isPending}
              data-testid="button-confirm-save"
            >
              {saveVersionMutation.isPending ? "Saving..." : "Save Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Version Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent data-testid="dialog-restore-version">
          <DialogHeader>
            <DialogTitle>Restore Version {selectedVersion?.versionNumber}</DialogTitle>
            <DialogDescription>
              This will replace the current model data with the selected version. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {selectedVersion && format(new Date(selectedVersion.createdAt!), 'MMM dd, yyyy • h:mm a')}
                </span>
              </div>
              {selectedVersion?.changeDescription && (
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1 text-foreground">{selectedVersion.changeDescription}</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreDialogOpen(false);
                setSelectedVersion(null);
              }}
              data-testid="button-cancel-restore"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedVersion) {
                  restoreVersionMutation.mutate(selectedVersion.id);
                }
              }}
              disabled={restoreVersionMutation.isPending}
              data-testid="button-confirm-restore"
            >
              {restoreVersionMutation.isPending ? "Restoring..." : "Restore Version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
