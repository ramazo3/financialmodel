import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { financialAssumptionsSchema, type FinancialAssumptions, type FinancialModel } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Percent, Calculator, Edit2, Loader2 } from "lucide-react";

interface EditableAssumptionsProps {
  model: FinancialModel;
}

export function EditableAssumptions({ model }: EditableAssumptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FinancialAssumptions>({
    resolver: zodResolver(financialAssumptionsSchema),
    defaultValues: {
      startupCost: Number(model.startupCost) || 0,
      monthlyRevenue: Number(model.monthlyRevenue) || 0,
      grossMargin: Number(model.grossMargin) || 0,
      operatingExpenses: Number(model.operatingExpenses) || 0,
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async (data: FinancialAssumptions) => {
      const response = await fetch(`/api/models/${model.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to regenerate model");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models", model.id] });
      setIsOpen(false);
      toast({
        title: "Model Regeneration Started",
        description: "Your financial model is being regenerated with the new assumptions. This may take 30-60 seconds.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate model",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FinancialAssumptions) => {
    regenerateMutation.mutate(data);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Current Assumptions</CardTitle>
              <CardDescription>
                The financial inputs used to generate this model
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsOpen(true)}
              data-testid="button-edit-assumptions"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit & Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Startup Cost
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                ${Number(model.startupCost || 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                ${Number(model.monthlyRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Percent className="h-3 w-3" />
                Gross Margin
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                {model.grossMargin}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calculator className="h-3 w-3" />
                Operating Expenses
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                ${Number(model.operatingExpenses || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Financial Assumptions</DialogTitle>
            <DialogDescription>
              Modify your assumptions below and regenerate the model with updated projections.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Startup Cost */}
              <FormField
                control={form.control}
                name="startupCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Total Startup Cost
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000"
                        className="font-mono"
                        data-testid="input-edit-startup-cost"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Initial capital required to start your business
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monthly Revenue */}
              <FormField
                control={form.control}
                name="monthlyRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Expected Monthly Revenue
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        className="font-mono"
                        data-testid="input-edit-monthly-revenue"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Average revenue per month once operational
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gross Margin */}
              <FormField
                control={form.control}
                name="grossMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      Gross Margin (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        className="font-mono"
                        data-testid="input-edit-gross-margin"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Percentage of revenue remaining after direct costs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Operating Expenses */}
              <FormField
                control={form.control}
                name="operatingExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      Monthly Operating Expenses
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3000"
                        className="font-mono"
                        data-testid="input-edit-operating-expenses"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Fixed monthly costs (rent, salaries, utilities, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={regenerateMutation.isPending}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={regenerateMutation.isPending}
                  data-testid="button-submit-regenerate"
                >
                  {regenerateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Regenerate Model
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
