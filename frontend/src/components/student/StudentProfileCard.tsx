import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Hash } from "lucide-react";
import { StudentInfo, ClassDetails } from "@/types/student";

interface StudentProfileCardProps {
  studentInfo: StudentInfo;
  classDetails: ClassDetails;
}

export const StudentProfileCard = ({ studentInfo, classDetails }: StudentProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Student Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-base font-semibold">{studentInfo.name}</p>
          </div>
          <Badge variant={studentInfo.status === 'active' ? 'secondary' : 'destructive'}>
            {studentInfo.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Class & Section</p>
            <p className="text-base font-semibold">
              {classDetails.class} - {classDetails.section}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Roll Number</p>
            <p className="text-base font-semibold flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {studentInfo.roll_no || 'N/A'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="text-sm flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {studentInfo.email}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Room Number</p>
          <p className="text-base font-semibold">{classDetails.room_no || 'N/A'}</p>
        </div>

        {classDetails.teacher_in_charge && (
          <div>
            <p className="text-sm font-medium text-gray-500">Class Teacher</p>
            <p className="text-base font-semibold">{classDetails.teacher_in_charge}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

