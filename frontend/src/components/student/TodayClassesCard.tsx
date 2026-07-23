import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import { TodayClass } from "@/types/student";

interface TodayClassesCardProps {
  classes: TodayClass[];
}

export const TodayClassesCard = ({ classes }: TodayClassesCardProps) => {
  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No classes scheduled for today</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Today's Classes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {classes.map((class_) => (
          <div
            key={class_.id}
            className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
              class_.is_current
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : class_.is_next
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm">{class_.subject_name}</p>
                {class_.is_current && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    Now
                  </Badge>
                )}
                {class_.is_next && !class_.is_current && (
                  <Badge variant="default" className="text-xs bg-blue-600">
                    Next
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {class_.teacher_name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {class_.room_no || 'N/A'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {class_.start_time} - {class_.end_time}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

