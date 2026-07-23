import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, User, Calendar } from "lucide-react";
import { SyllabusProgress } from "@/types/student";

interface SyllabusProgressCardProps {
  syllabusData: SyllabusProgress[];
}

export const SyllabusProgressCard = ({ syllabusData }: SyllabusProgressCardProps) => {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  if (syllabusData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Syllabus Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No syllabus data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5" />
          Syllabus Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {syllabusData.map((subject) => (
          <div key={subject.subject_id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold">{subject.subject_name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  {subject.teacher_name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {subject.teacher_name}
                    </span>
                  )}
                  {subject.last_updated && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(subject.last_updated).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-sm font-bold ${getProgressTextColor(subject.percentage)}`}>
                {subject.percentage.toFixed(1)}%
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="relative">
                <Progress 
                  value={subject.percentage} 
                  className="h-2"
                />
                <div 
                  className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(subject.percentage)}`}
                  style={{ width: `${subject.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {subject.completed_chapters} of {subject.total_chapters} chapters completed
              </p>
            </div>

            {subject.remarks && (
              <p className="text-xs text-gray-600 italic bg-gray-50 dark:bg-gray-900 p-2 rounded">
                {subject.remarks}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

