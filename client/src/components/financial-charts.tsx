import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { GeneratedModel } from "@shared/schema";
import { TrendingUp, DollarSign, Activity, PieChart } from "lucide-react";

interface FinancialChartsProps {
  generatedModel: GeneratedModel;
}

export function FinancialCharts({ generatedModel }: FinancialChartsProps) {
  // Prepare data for 5-year projection from AI-generated annual projections
  // Handle backward compatibility for legacy models without annualProjections
  const hasValidYear1Data = 
    typeof generatedModel.keyMetrics?.year1TotalRevenue === 'number' &&
    isFinite(generatedModel.keyMetrics.year1TotalRevenue) &&
    typeof generatedModel.keyMetrics?.year1NetProfit === 'number' &&
    isFinite(generatedModel.keyMetrics.year1NetProfit) &&
    generatedModel.keyMetrics.year1TotalRevenue >= generatedModel.keyMetrics.year1NetProfit;

  const yearlyData = generatedModel.annualProjections?.length === 5
    ? generatedModel.annualProjections.map((proj) => ({
        year: `Year ${proj.year}`,
        revenue: proj.revenue,
        expenses: proj.expenses,
        profit: proj.netProfit,
        grossProfit: proj.grossProfit,
      }))
    : hasValidYear1Data
    ? (() => {
        // Fallback for legacy models: generate from Year 1 data
        const year1Revenue = generatedModel.keyMetrics.year1TotalRevenue;
        const year1Expenses = year1Revenue - generatedModel.keyMetrics.year1NetProfit;
        return [
          {
            year: "Year 1",
            revenue: year1Revenue,
            expenses: year1Expenses,
            profit: generatedModel.keyMetrics.year1NetProfit,
            grossProfit: year1Revenue - year1Expenses,
          },
          {
            year: "Year 2",
            revenue: year1Revenue * 1.4,
            expenses: year1Expenses * 1.3,
            profit: (year1Revenue * 1.4) - (year1Expenses * 1.3),
            grossProfit: (year1Revenue * 1.4) - (year1Expenses * 1.3),
          },
          {
            year: "Year 3",
            revenue: year1Revenue * 1.9,
            expenses: year1Expenses * 1.6,
            profit: (year1Revenue * 1.9) - (year1Expenses * 1.6),
            grossProfit: (year1Revenue * 1.9) - (year1Expenses * 1.6),
          },
          {
            year: "Year 4",
            revenue: year1Revenue * 2.5,
            expenses: year1Expenses * 2.0,
            profit: (year1Revenue * 2.5) - (year1Expenses * 2.0),
            grossProfit: (year1Revenue * 2.5) - (year1Expenses * 2.0),
          },
          {
            year: "Year 5",
            revenue: year1Revenue * 3.2,
            expenses: year1Expenses * 2.5,
            profit: (year1Revenue * 3.2) - (year1Expenses * 2.5),
            grossProfit: (year1Revenue * 3.2) - (year1Expenses * 2.5),
          },
        ];
      })()
    : null; // No valid data available

  // If no valid data for yearly projections, show a placeholder
  if (!yearlyData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Charts Not Available
              </h3>
              <p className="text-sm text-muted-foreground">
                Financial projections data is incomplete for this model.
                Please regenerate the model to view interactive charts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Monthly data from revenue projections
  const monthlyRevenueData = generatedModel.revenueProjections.map((proj) => ({
    month: `M${proj.month}`,
    revenue: proj.revenue,
    costs: proj.costs,
    grossProfit: proj.grossProfit,
  }));

  // Monthly cash flow data
  const monthlyCashFlowData = generatedModel.cashFlow.map((cf) => ({
    month: `M${cf.month}`,
    inflow: cf.inflow,
    outflow: cf.outflow,
    netCashFlow: cf.netCashFlow,
    cumulativeCash: cf.cumulativeCash,
  }));

  // Break-even data
  const breakEvenData = generatedModel.cashFlow.map((cf, index) => ({
    month: `M${cf.month}`,
    cumulativeCash: cf.cumulativeCash,
    breakEven: 0,
    isBreakEven: index + 1 === generatedModel.keyMetrics.breakEvenMonth,
  }));

  // Profit margin trend
  const profitMarginData = generatedModel.revenueProjections.map((proj) => ({
    month: `M${proj.month}`,
    margin: proj.revenue > 0 ? ((proj.grossProfit / proj.revenue) * 100) : 0,
  }));

  // Custom tooltip formatter
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* 5-Year Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                5-Year Financial Forecast
              </CardTitle>
              <CardDescription>
                Projected revenue and expenses over 5 years
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Bar 
                dataKey="revenue" 
                fill="hsl(220, 70%, 60%)" 
                name="Revenue"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="hsl(160, 60%, 50%)" 
                name="Expenses"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Revenue Breakdown (Year 1) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            Monthly Revenue Breakdown (Year 1)
          </CardTitle>
          <CardDescription>
            Monthly revenue, costs, and gross profit for the first 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1"
                stroke="hsl(220, 70%, 60%)" 
                fill="hsl(220, 70%, 60%)" 
                name="Revenue"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="costs" 
                stackId="2"
                stroke="hsl(0, 70%, 60%)" 
                fill="hsl(0, 70%, 60%)" 
                name="Costs"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="grossProfit" 
                stackId="3"
                stroke="hsl(160, 60%, 50%)" 
                fill="hsl(160, 60%, 50%)" 
                name="Gross Profit"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Monthly Cash Flow Analysis
          </CardTitle>
          <CardDescription>
            Cash inflow, outflow, and cumulative cash position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyCashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="inflow" 
                stroke="hsl(160, 60%, 50%)" 
                strokeWidth={2}
                name="Cash Inflow"
                dot={{ fill: 'hsl(160, 60%, 50%)' }}
              />
              <Line 
                type="monotone" 
                dataKey="outflow" 
                stroke="hsl(0, 70%, 60%)" 
                strokeWidth={2}
                name="Cash Outflow"
                dot={{ fill: 'hsl(0, 70%, 60%)' }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeCash" 
                stroke="hsl(220, 70%, 60%)" 
                strokeWidth={3}
                name="Cumulative Cash"
                dot={{ fill: 'hsl(220, 70%, 60%)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Break-Even Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Break-Even Analysis
          </CardTitle>
          <CardDescription>
            Path to profitability - cumulative cash flow over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-foreground">
              Break-Even Point: <span className="text-primary font-bold">Month {generatedModel.keyMetrics.breakEvenMonth}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your business is projected to become cash-flow positive in month {generatedModel.keyMetrics.breakEvenMonth}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={breakEvenData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 60%, 50%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(160, 60%, 50%)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="cumulativeCash" 
                stroke="hsl(160, 60%, 50%)" 
                strokeWidth={3}
                fill="url(#cashGradient)"
                name="Cumulative Cash"
              />
              <Line 
                type="monotone" 
                dataKey="breakEven" 
                stroke="hsl(0, 0%, 50%)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Break-Even Line"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Margin Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Gross Profit Margin Trend
          </CardTitle>
          <CardDescription>
            Month-over-month profit margin percentage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitMarginData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number) => formatPercentage(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="margin" 
                stroke="hsl(30, 80%, 55%)" 
                strokeWidth={3}
                name="Profit Margin %"
                dot={{ fill: 'hsl(30, 80%, 55%)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
