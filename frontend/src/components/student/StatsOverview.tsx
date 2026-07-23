import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, TrendingUp, Calendar } from "lucide-react";
import { DashboardStats } from "@/types/student";

interface StatsOverviewProps {
  stats: DashboardStats;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const statCards = [
    {
      title: "Total Subjects",
      value: stats.total_subjects.toString(),
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Classes Today",
      value: stats.classes_today.toString(),
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Syllabus Progress",
      value: `${stats.average_syllabus_completion.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Next Class",
      value: stats.next_class_time || "No more",
      icon: Clock,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

