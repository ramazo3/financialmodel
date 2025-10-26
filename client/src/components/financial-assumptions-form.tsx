import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { financialAssumptionsSchema, type FinancialAssumptions, type BusinessSector } from "@shared/schema";
import { ArrowLeft, ArrowRight, DollarSign, TrendingUp, PieChart, Calculator } from "lucide-react";
import { useEffect } from "react";

interface FinancialAssumptionsFormProps {
  selectedSector?: string;
  onSubmit: (data: FinancialAssumptions) => void;
  onBack: () => void;
}

export function FinancialAssumptionsForm({ selectedSector, onSubmit, onBack }: FinancialAssumptionsFormProps) {
  const { data: sectors } = useQuery<BusinessSector[]>({
    queryKey: ["/api/sectors"],
  });

  const sectorData = sectors?.find(s => s.sectorName === selectedSector);

  const form = useForm<FinancialAssumptions>({
    resolver: zodResolver(financialAssumptionsSchema),
    defaultValues: {
      startupCost: sectorData ? Number(sectorData.totalStartupCost) : 10000,
      monthlyRevenue: sectorData ? Number(sectorData.year1Revenue) / 12 : 5000,
      grossMargin: sectorData ? Number(sectorData.grossMarginTarget) : 50,
      operatingExpenses: 3000,
    },
  });

  // Update form when sector data loads
  useEffect(() => {
    if (sectorData) {
      form.setValue("startupCost", Number(sectorData.totalStartupCost));
      form.setValue("monthlyRevenue", Number(sectorData.year1Revenue) / 12);
      form.setValue("grossMargin", Number(sectorData.grossMarginTarget));
    }
  }, [sectorData, form]);

  const watchedValues = form.watch();
  const estimatedMonthlyProfit = 
    (watchedValues.monthlyRevenue * (watchedValues.grossMargin / 100)) - watchedValues.operatingExpenses;
  const breakEvenMonths = watchedValues.startupCost / Math.max(estimatedMonthlyProfit, 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Financial Assumptions</CardTitle>
          <CardDescription className="text-base">
            Customize your financial projections. We've pre-filled these based on the {selectedSector} sector, but feel free to adjust them.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Startup Cost */}
                  <FormField
                    control={form.control}
                    name="startupCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Total Startup Cost
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10000"
                            className="text-base font-mono"
                            data-testid="input-startup-cost"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Initial capital required to start your business (equipment, licenses, inventory, etc.)
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
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Expected Monthly Revenue (Year 1)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5000"
                            className="text-base font-mono"
                            data-testid="input-monthly-revenue"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Average monthly revenue you expect to generate in the first year
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
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          <PieChart className="h-4 w-4 text-primary" />
                          Gross Margin Target (%)
                        </FormLabel>
                        <div className="space-y-4">
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              className="py-4"
                              data-testid="slider-gross-margin"
                            />
                          </FormControl>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Current value:</span>
                            <span className="text-2xl font-bold font-mono text-primary">{field.value}%</span>
                          </div>
                        </div>
                        <FormDescription>
                          Percentage of revenue remaining after direct costs (COGS)
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
                        <FormLabel className="text-base font-medium flex items-center gap-2">
                          <Calculator className="h-4 w-4 text-primary" />
                          Monthly Operating Expenses
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="3000"
                            className="text-base font-mono"
                            data-testid="input-operating-expenses"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Fixed monthly costs (rent, salaries, utilities, marketing, etc.)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" size="lg" onClick={onBack} type="button" data-testid="button-back">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                    <Button type="submit" size="lg" className="min-w-[200px]" data-testid="button-generate-model">
                      Generate Model
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Metrics Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Revenue</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${watchedValues.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gross Profit</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${(watchedValues.monthlyRevenue * (watchedValues.grossMargin / 100)).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Operating Expenses</span>
                  <span className="font-mono font-semibold text-foreground">
                    ${watchedValues.operatingExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-sm font-medium">Net Profit/Month</span>
                  <span className={`font-mono font-bold text-lg ${estimatedMonthlyProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                    ${estimatedMonthlyProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Estimated Break-Even</p>
                <p className="text-4xl font-bold font-mono text-primary">
                  {breakEvenMonths > 0 && breakEvenMonths < 100 
                    ? Math.ceil(breakEvenMonths) 
                    : "--"}
                </p>
                <p className="text-sm text-muted-foreground">months</p>
              </div>
            </CardContent>
          </Card>

          {sectorData && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Sector Benchmark</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. Startup Cost</span>
                  <span className="font-mono">${Number(sectorData.totalStartupCost).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. Year 1 ROI</span>
                  <span className="font-mono">~{sectorData.year1ROI}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gross Margin</span>
                  <span className="font-mono">{sectorData.grossMarginTarget}%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
