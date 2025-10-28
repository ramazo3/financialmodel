import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Search, TrendingUp, Shield, Zap, BarChart3, CheckCircle2, Sparkles, Lightbulb } from "lucide-react";
import { useState } from "react";
import type { BusinessSector } from "@shared/schema";

interface SectorSelectionProps {
  businessIdea: string;
  onSelect: (sectorName: string) => void;
  onBack: () => void;
}

export function SectorSelection({ businessIdea, onSelect, onBack }: SectorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const { data: sectors, isLoading } = useQuery<BusinessSector[]>({
    queryKey: ["/api/sectors"],
  });

  // Fetch AI-powered sector recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<{
    recommendedSectors: string[];
    reasoning: string;
  }>({
    queryKey: ["/api/sectors/recommend", businessIdea],
    queryFn: async () => {
      const response = await fetch("/api/sectors/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIdea }),
      });
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return response.json();
    },
    enabled: businessIdea.length >= 10, // Only fetch if business idea is meaningful
  });

  const filteredSectors = sectors?.filter(sector =>
    sector.sectorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.investorPersonaFit?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelect = (sectorName: string) => {
    setSelectedSector(sectorName);
  };

  const handleContinue = () => {
    if (selectedSector) {
      onSelect(selectedSector);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Select Your Business Sector</CardTitle>
          <CardDescription className="text-base">
            Choose the sector that best matches your business idea. We've analyzed 35+ sectors with comprehensive financial data.
          </CardDescription>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search sectors by name or persona..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
                data-testid="input-search-sectors"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Your Business Idea Context */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-2">Your Business Idea:</p>
          <p className="text-sm text-foreground line-clamp-3">{businessIdea}</p>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {isLoadingRecommendations ? (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <CardTitle className="text-lg">Analyzing your business idea...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : recommendations && recommendations.recommendedSectors.length > 0 ? (
        <Alert className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <Lightbulb className="h-5 w-5 text-primary" />
          <AlertDescription className="mt-2">
            <p className="font-semibold text-base text-foreground mb-2">
              AI Recommendations
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {recommendations.reasoning}
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendations.recommendedSectors.map((sectorName) => (
                <Badge
                  key={sectorName}
                  variant="default"
                  className="bg-primary/20 hover:bg-primary/30 text-primary-foreground cursor-pointer"
                  onClick={() => {
                    const element = document.getElementById(`sector-${sectorName}`);
                    element?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  data-testid={`badge-recommended-${sectorName}`}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {sectorName}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Sectors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSectors.map((sector) => {
            const isRecommended = recommendations?.recommendedSectors.includes(sector.sectorName);
            
            return (
              <Card
                key={sector.id}
                id={`sector-${sector.sectorName}`}
                className={`cursor-pointer transition-all hover-elevate ${
                  selectedSector === sector.sectorName
                    ? "border-2 border-primary bg-primary/5"
                    : isRecommended
                    ? "border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent"
                    : "border"
                }`}
                onClick={() => handleSelect(sector.sectorName)}
                data-testid={`card-sector-${sector.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <CardTitle className="text-lg leading-tight">{sector.sectorName}</CardTitle>
                      {isRecommended && (
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" data-testid={`icon-recommended-${sector.id}`} />
                      )}
                    </div>
                    {selectedSector === sector.sectorName && (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="w-fit">
                      {sector.investorPersonaFit}
                    </Badge>
                    {isRecommended && (
                      <Badge variant="default" className="w-fit bg-primary/20 text-primary-foreground">
                        AI Match
                      </Badge>
                    )}
                  </div>
                </CardHeader>

              <CardContent className="space-y-4">
                {/* Inachee Index Score */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-foreground">Inachee Index</span>
                  <span className="text-2xl font-bold font-mono text-primary">{sector.inacheeIndexScore}</span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs">Year 1 ROI</span>
                    </div>
                    <p className="font-mono font-semibold text-foreground">~{sector.year1ROI}%</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="text-xs">Startup Cost</span>
                    </div>
                    <p className="font-mono font-semibold text-foreground">${Number(sector.totalStartupCost).toLocaleString()}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span className="text-xs">Scalability</span>
                    </div>
                    <p className="font-mono font-semibold text-foreground">{sector.scalability}/10</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="text-xs">Risk Score</span>
                    </div>
                    <p className="font-mono font-semibold text-foreground">{sector.marketResilience}/10</p>
                  </div>
                </div>

                {/* Dimensions Summary */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ROI Potential</span>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i < sector.roiPotential ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Execution Ease</span>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i < sector.executionSimplicity ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {filteredSectors.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No sectors found matching your search.</p>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" size="lg" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedSector}
          className="min-w-[200px]"
          data-testid="button-continue-to-assumptions"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
