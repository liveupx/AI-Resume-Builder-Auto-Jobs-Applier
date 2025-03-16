import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer 
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, MapPin, BriefcaseIcon, DollarSign } from "lucide-react";

interface SalaryTrend {
  role: string;
  avgSalary: number;
  count: number;
}

interface LocationTrend {
  location: string;
  count: number;
}

interface SkillTrend {
  skill: string;
  count: number;
}

export default function MarketInsightsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: salaryTrends } = useQuery<SalaryTrend[]>({
    queryKey: ["/api/insights/salary-trends"],
  });

  const { data: locationTrends } = useQuery<LocationTrend[]>({
    queryKey: ["/api/insights/location-trends"],
  });

  const { data: skillTrends } = useQuery<SkillTrend[]>({
    queryKey: ["/api/insights/skill-trends"],
  });

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Market Insights</h1>
        <p className="text-muted-foreground">
          Real-time analytics and trends from our job market data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Salary
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$95,400</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Job Posts
            </CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <p className="text-xs text-muted-foreground">
              +180 new this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Location
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">New York</div>
            <p className="text-xs text-muted-foreground">
              38% of all postings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Salary Ranges by Role</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgSalary" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}