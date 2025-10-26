import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, AlertCircle, Calculator } from "lucide-react";
import type { Scenario } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScenarioPlanningProps {
  modelId: string;
  baselineAssumptions: {
    startupCost: string | null;
    monthlyRevenue: string | null;
    grossMargin: string | null;
    operatingExpenses: string | null;
  };
}

const scenarioFormSchema = z.object({
  name: z.string().min(1, "Scenario name is required"),
  description: z.string().optional(),
  startupCost: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  monthlyRevenue: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  grossMargin: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0).max(100).optional()
  ),
  operatingExpenses: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
});

type ScenarioFormValues = z.infer<typeof scenarioFormSchema>;

export function ScenarioPlanning({ modelId, baselineAssumptions }: ScenarioPlanningProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const { toast } = useToast();

  const form = useForm<ScenarioFormValues>({
    resolver: zodResolver(scenarioFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startupCost: Number(baselineAssumptions.startupCost) || undefined,
      monthlyRevenue: Number(baselineAssumptions.monthlyRevenue) || undefined,
      grossMargin: Number(baselineAssumptions.grossMargin) || undefined,
      operatingExpenses: Number(baselineAssumptions.operatingExpenses) || undefined,
    },
  });

  const { data: scenarios, isLoading } = useQuery<Scenario[]>({
    queryKey: ['/api/models', modelId, 'scenarios'],
    queryFn: async () => {
      const response = await fetch(`/api/models/${modelId}/scenarios`);
      if (!response.ok) throw new Error('Failed to fetch scenarios');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ScenarioFormValues) => {
      return apiRequest('POST', `/api/models/${modelId}/scenarios`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/models', modelId, 'scenarios'] });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Scenario Created",
        description: "New scenario has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create scenario",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ScenarioFormValues) => {
      return apiRequest('PUT', `/api/scenarios/${selectedScenario?.id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/models', modelId, 'scenarios'] });
      setEditDialogOpen(false);
      setSelectedScenario(null);
      form.reset();
      toast({
        title: "Scenario Updated",
        description: "Scenario has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update scenario",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      return apiRequest('DELETE', `/api/scenarios/${scenarioId}`, {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/models', modelId, 'scenarios'] });
      setDeleteDialogOpen(false);
      setSelectedScenario(null);
      toast({
        title: "Scenario Deleted",
        description: "Scenario has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete scenario",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    form.reset({
      name: "",
      description: "",
      startupCost: Number(baselineAssumptions.startupCost) || undefined,
      monthlyRevenue: Number(baselineAssumptions.monthlyRevenue) || undefined,
      grossMargin: Number(baselineAssumptions.grossMargin) || undefined,
      operatingExpenses: Number(baselineAssumptions.operatingExpenses) || undefined,
    });
    setCreateDialogOpen(true);
  };

  const handleEdit = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    form.reset({
      name: scenario.name,
      description: scenario.description || "",
      startupCost: scenario.startupCost ? Number(scenario.startupCost) : undefined,
      monthlyRevenue: scenario.monthlyRevenue ? Number(scenario.monthlyRevenue) : undefined,
      grossMargin: scenario.grossMargin ? Number(scenario.grossMargin) : undefined,
      operatingExpenses: scenario.operatingExpenses ? Number(scenario.operatingExpenses) : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setDeleteDialogOpen(true);
  };

  const onSubmit = (data: ScenarioFormValues) => {
    if (editDialogOpen) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const formatPercentage = (value: string | null | undefined) => {
    if (!value) return "N/A";
    return `${value}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Scenario Planning
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

  const hasScenarios = scenarios && scenarios.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Scenario Planning
            </CardTitle>
            <Button
              onClick={handleCreate}
              size="sm"
              data-testid="button-create-scenario"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasScenarios ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No scenarios created yet</p>
              <p className="text-xs mt-1">Create alternative scenarios to compare different financial assumptions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Metric</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                        Baseline
                        <Badge variant="outline" className="ml-2">Current</Badge>
                      </th>
                      {scenarios.map((scenario) => (
                        <th key={scenario.id} className="text-right py-3 px-4 text-sm font-medium text-foreground">
                          {scenario.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-sm text-muted-foreground">Startup Cost</td>
                      <td className="py-3 px-4 text-sm font-mono text-right">
                        {formatCurrency(baselineAssumptions.startupCost)}
                      </td>
                      {scenarios.map((scenario) => (
                        <td key={scenario.id} className="py-3 px-4 text-sm font-mono text-right">
                          {formatCurrency(scenario.startupCost)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-sm text-muted-foreground">Monthly Revenue</td>
                      <td className="py-3 px-4 text-sm font-mono text-right">
                        {formatCurrency(baselineAssumptions.monthlyRevenue)}
                      </td>
                      {scenarios.map((scenario) => (
                        <td key={scenario.id} className="py-3 px-4 text-sm font-mono text-right">
                          {formatCurrency(scenario.monthlyRevenue)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-sm text-muted-foreground">Gross Margin</td>
                      <td className="py-3 px-4 text-sm font-mono text-right">
                        {formatPercentage(baselineAssumptions.grossMargin)}
                      </td>
                      {scenarios.map((scenario) => (
                        <td key={scenario.id} className="py-3 px-4 text-sm font-mono text-right">
                          {formatPercentage(scenario.grossMargin)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 text-sm text-muted-foreground">Operating Expenses</td>
                      <td className="py-3 px-4 text-sm font-mono text-right">
                        {formatCurrency(baselineAssumptions.operatingExpenses)}
                      </td>
                      {scenarios.map((scenario) => (
                        <td key={scenario.id} className="py-3 px-4 text-sm font-mono text-right">
                          {formatCurrency(scenario.operatingExpenses)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-sm text-muted-foreground">Actions</td>
                      <td className="py-3 px-4"></td>
                      {scenarios.map((scenario) => (
                        <td key={scenario.id} className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(scenario)}
                              data-testid={`button-edit-${scenario.id}`}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(scenario)}
                              data-testid={`button-delete-${scenario.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Scenario Descriptions */}
              {scenarios.some(s => s.description) && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium text-foreground">Scenario Descriptions</h4>
                  {scenarios.filter(s => s.description).map((scenario) => (
                    <div key={scenario.id} className="text-sm">
                      <span className="font-medium text-foreground">{scenario.name}:</span>
                      <span className="text-muted-foreground ml-2">{scenario.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-2xl" data-testid="dialog-scenario-form">
          <DialogHeader>
            <DialogTitle>{editDialogOpen ? "Edit Scenario" : "Create New Scenario"}</DialogTitle>
            <DialogDescription>
              {editDialogOpen 
                ? "Modify the assumptions for this scenario"
                : "Create an alternative scenario with different financial assumptions"
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scenario Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Optimistic, Conservative, Best Case"
                        data-testid="input-scenario-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the key assumptions for this scenario..."
                        rows={2}
                        data-testid="textarea-scenario-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startupCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Cost ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          data-testid="input-startup-cost"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Revenue ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          data-testid="input-monthly-revenue"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grossMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Margin (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          data-testid="input-gross-margin"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="operatingExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Expenses ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          data-testid="input-operating-expenses"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditDialogOpen(false);
                    form.reset();
                  }}
                  data-testid="button-cancel-scenario"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-scenario"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editDialogOpen ? "Update Scenario" : "Create Scenario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-testid="dialog-delete-scenario">
          <DialogHeader>
            <DialogTitle>Delete Scenario</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedScenario?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedScenario(null);
              }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedScenario) {
                  deleteMutation.mutate(selectedScenario.id);
                }
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Scenario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
