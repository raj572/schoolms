import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, School, Building2, Building, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { subscriptionApi, SubscriptionPlan } from "@/services/subscriptionApiService";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/hooks/use-toast";

interface PlanDisplay {
  icon: JSX.Element;
  name: string;
  desc: string;
  price: string;
  features: string[];
  button: string;
  highlight?: boolean;
  planId?: number; // Store original plan ID
  originalPlan?: SubscriptionPlan; // Store original plan data
}

export default function PricingSection() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<PlanDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});

  const togglePlanExpansion = (index: number) => {
    setExpandedPlans(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionApi.getSubscriptionPlans();
      
      if (response.status && response.data?.plans) {
        const apiPlans: SubscriptionPlan[] = response.data.plans;
        
        // Filter only active plans and map to display format
        const displayPlans = apiPlans
          .filter(plan => plan.is_active)
          .map((plan, index) => {
            // Determine icon based on plan name or index
            let icon;
            const planNameLower = plan.name.toLowerCase();
            if (planNameLower.includes('basic') || planNameLower.includes('starter')) {
              icon = <Building className="h-8 w-8 text-primary mb-4" />;
            } else if (planNameLower.includes('enterprise') || planNameLower.includes('premium')) {
              icon = <Building2 className="h-8 w-8 text-primary mb-4" />;
            } else {
              icon = <School className="h-8 w-8 text-primary mb-4" />;
            }

            // Format price based on billing cycle
            const price = billing === "monthly" 
              ? plan.monthly_price 
              : (plan.annual_price || plan.monthly_price * 12);
            
            const formattedPrice = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: plan.currency || 'INR',
              minimumFractionDigits: 0,
            }).format(price);

            // Extract features from plan.features (can be object or array)
            let features: string[] = [];
            if (plan.features) {
              if (Array.isArray(plan.features)) {
                features = plan.features;
              } else if (typeof plan.features === 'object') {
                // If features is an object, convert keys with true values to strings
                features = Object.entries(plan.features)
                  .filter(([_, value]) => value === true)
                  .map(([key, _]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
              }
            }

            // Default button text
            let buttonText = "Get Started";
            if (planNameLower.includes('enterprise') || planNameLower.includes('premium')) {
              buttonText = "Contact Sales";
            } else if (planNameLower.includes('professional') || planNameLower.includes('pro')) {
              buttonText = "Start Now";
            }

            return {
              icon,
              name: plan.name,
              desc: plan.description || "Perfect for your institution",
              price: formattedPrice,
              features: features.length > 0 ? features : ["Contact us for details"],
              button: buttonText,
              highlight: plan.is_popular || index === 1, // Highlight popular plan or middle plan
              planId: plan.id, // Store plan ID for navigation
              originalPlan: plan, // Store original plan data
            };
          })
          .sort((a, b) => {
            // Sort by price (extract numeric value)
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return priceA - priceB;
          });

        setPlans(displayPlans);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load pricing plans. Please try again later.');
      // Fallback to empty array or show error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Re-calculate prices when billing changes
    if (plans.length > 0) {
      // Re-fetch to get fresh plan data and recalculate prices
      fetchPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billing]);

  const handlePlanButtonClick = (plan: PlanDisplay) => {
    // Handle "Contact Sales" buttons - redirect to contact page
    if (plan.button === "Contact Sales") {
      navigate("/contact");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const isAuthenticated = token && authUser;

    if (!isAuthenticated) {
      // Not authenticated - redirect to signup
      // Store plan preference in sessionStorage for post-signup flow
      if (plan.planId) {
        sessionStorage.setItem("selectedPlanId", plan.planId.toString());
        sessionStorage.setItem("selectedBillingCycle", billing);
      }
      navigate("/signup");
      return;
    }

    // Authenticated - navigate directly to payment page with selected plan
    // This provides a smoother, more professional experience
    if (plan.planId && plan.originalPlan) {
      navigate("/payment", {
        state: {
          planId: plan.planId,
          billingCycle: billing === "monthly" ? "monthly" : "annual",
          plan: plan.originalPlan,
        },
      });
    } else {
      // Fallback: navigate to pricing page if plan data is missing
      toast({
        title: "Plan Selection",
        description: "Please select a plan to continue.",
        variant: "default",
      });
      navigate("/pricing");
    }
  };

  return (
    <section className="relative py-10 md:py-20 bg-background text-foreground overflow-hidden">
      {/* Subtle glowing gradient + grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15)_0%,transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(transparent_96%,hsl(var(--primary)/0.1)_100%)] opacity-10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
          Plans that are{" "}
          <span className="text-primary">flexible</span> for every school
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-12">
          Empower your institution with digital management tools. Whether you're
          a small academy or a multi-campus university, we’ve got you covered.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex rounded-lg border border-border p-1 mb-10 sm:mb-14 bg-background/50 backdrop-blur-sm">
          <Button
            variant={billing === "monthly" ? "default" : "ghost"}
            size="sm"
            className="rounded-md sm:px-6"
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billing === "yearly" ? "default" : "ghost"}
            size="sm"
            className="rounded-md sm:px-6"
            onClick={() => setBilling("yearly")}
          >
            Yearly
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        {!loading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative flex flex-col border border-border bg-background/30 backdrop-blur-sm hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all ${
                plan.highlight
                  ? "border-primary shadow-[0_0_35px_hsl(var(--primary)/0.4)] scale-[1.02]"
                  : ""
              }`}
            >
              {/* Subtle radial glow behind highlighted card */}
              {plan.highlight && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.25)_0%,transparent_80%)] pointer-events-none"></div>
              )}

              <CardHeader className="flex flex-col items-center text-center relative z-10">
                {plan.icon}
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {plan.desc}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 px-5 sm:px-6 relative z-10">
                <p className="text-3xl sm:text-4xl font-bold mb-2">
                  {plan.price}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                  per {billing === "monthly" ? "month" : "year"}
                </p>
                <Separator className="mb-6 opacity-40" />
                <ul className="space-y-3 text-left">
                  {(expandedPlans[i] ? plan.features : plan.features.slice(0, 5)).map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.features.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors" 
                      onClick={() => togglePlanExpansion(i)}
                    >
                      {expandedPlans[i] ? (
                        <>Show less <ChevronUp className="ml-1 h-4 w-4" /></>
                      ) : (
                        <>See full details <ChevronDown className="ml-1 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="px-5 sm:px-6 pb-6 relative z-10">
                <Button
                  onClick={() => handlePlanButtonClick(plan)}
                  className={`w-full text-sm sm:text-base transition-all duration-300 ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      : "bg-transparent text-primary border border-border hover:bg-primary/10 hover:border-primary/50"
                  }`}
                >
                  {plan.button}
                </Button>
              </CardFooter>
            </Card>
            ))}
          </div>
        )}

        {/* No Plans Found */}
        {!loading && !error && plans.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No pricing plans available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
