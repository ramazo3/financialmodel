import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { businessIdeaInputSchema, type BusinessIdeaInput } from "@shared/schema";
import { ArrowRight, Lightbulb } from "lucide-react";

interface BusinessIdeaFormProps {
  onSubmit: (data: BusinessIdeaInput) => void;
}

export function BusinessIdeaForm({ onSubmit }: BusinessIdeaFormProps) {
  const form = useForm<BusinessIdeaInput>({
    resolver: zodResolver(businessIdeaInputSchema),
    defaultValues: {
      businessIdea: "",
    },
  });

  const exampleIdeas = [
    "A subscription-based meal prep service delivering healthy, pre-portioned meals to busy professionals in urban areas",
    "Mobile car detailing service using eco-friendly products, targeting office parks and residential communities",
    "Online tutoring platform connecting college students with high school students for personalized academic coaching",
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-2">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Tell Us About Your Business Idea</CardTitle>
              <CardDescription className="text-base mt-1">
                Describe your business concept in detail. The more specific you are, the better our AI can analyze it.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="businessIdea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Business Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: A mobile pet grooming service that brings professional grooming directly to customers' homes, targeting busy pet owners in suburban neighborhoods..."
                        className="min-h-[200px] resize-none text-base"
                        data-testid="input-business-idea"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include details about your target market, unique value proposition, and how you plan to deliver your product or service.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Example Ideas
                </h4>
                <div className="space-y-2">
                  {exampleIdeas.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => form.setValue("businessIdea", example)}
                      className="w-full text-left text-sm text-muted-foreground hover:text-foreground hover-elevate p-3 rounded-md border bg-background transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="min-w-[200px]"
                  data-testid="button-next-step"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
