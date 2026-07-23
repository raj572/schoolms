import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import Heading from "@/components/common/Heading";

interface Student {
  id: number;
  name: string;
  status: "present" | "absent" | null;
  previousDays: ("P" | "A" | string)[];
  absentDays: number;
}

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Ahmed Ali",
      status: null,
      previousDays: ["06", "07", "08", "10", "11", "12", "13"],
      absentDays: 2,
    },
    {
      id: 2,
      name: "Fatima Khan",
      status: null,
      previousDays:["06", "07", "08", "10", "11", "12", "13"] ,
      absentDays: 2,
    },
    {
      id: 3,
      name: "Muhammad Hassan",
      status: null,
      previousDays: ["06", "07", "08", "10", "11", "12", "13"],
      absentDays: 2,
    },
    {
      id: 4,
      name: "Ayesha Malik",
      status: null,
      previousDays:  ["06", "07", "08", "10", "11", "12", "13"],
      absentDays: 1,
    },
    {
      id: 5,
      name: "Omar Sheikh",
      status: null,
      previousDays:  ["06", "07", "08", "10", "11", "12", "13"],
      absentDays: 3,
    },
    {
      id: 6,
      name: "Zara Ahmed",
      status: null,
      previousDays:  ["06", "07", "08", "10", "11", "12", "13"],
      absentDays: 2,
    },
    {
      id: 7,
      name: "Bilal Raza",
      status: null,
      previousDays: ["06", "07", "08", "10", "11", "12", "13"],
      absentDays: 1,
    },
    {
      id: 8,
      name: "Sana Iqbal",
      status: null,
      previousDays: ["06", "07", "08", "10", "11", "12", "13"] ,
      absentDays: 2,
    },
  ]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (
    studentId: number,
    status: "present" | "absent"
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSave = () => {
    console.log("Attendance saved:", students);
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Heading title="Attendance Management" description="Mark student attendance for today"/>
          
            <Link to="/principal/dashboard">
              <Button variant="outline" className=" text-slate-800 dark:text-slate-300">
                Back to Dashboard
              </Button>
            </Link>

        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4  p-4 bg-muted/50 border-b border-border font-semibold text-xs">
            <div className="col-span-3">Student Name</div>
            <div className="col-span-2">Today's Status</div>
            <div className="col-span-5 ml-9">Previous 7 Days</div>
            <div className="col-span-2">Absent Days</div>
          </div>

          <div className="divide-y divide-border">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 transition-colors duration-200",
                  student.status === "present" &&
                    " dark:bg-green-950/20",
                  student.status === "absent" && " dark:bg-red-950/20"
                )}
              >
                <div className="col-span-3 text-xs flex items-center">
                  <span className="font-medium text-foreground">
                    {student.name}
                  </span>
                </div>

                <div className="col-span-2 text-xs flex items-center">
                  <RadioGroup
                    value={student.status || ""}
                    onValueChange={(value) =>
                      handleStatusChange(
                        student.id,
                        value as "present" | "absent"
                      )
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="present"
                        id={`present-${student.id}`}
                        className={cn(
                          student.status === "present" &&
                            "border-green-500 text-green-500"
                        )}
                      />
                      <Label
                        htmlFor={`present-${student.id}`}
                        className={cn(
                          "text-xs cursor-pointer",
                          student.status === "present" &&
                            "text-green-600 font-medium"
                        )}
                      >
                        Present
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="absent"
                        id={`absent-${student.id}`}
                        className={cn(
                          student.status === "absent" &&
                            "border-red-500 text-red-500"
                        )}
                      />
                      <Label
                        htmlFor={`absent-${student.id}`}
                        className={cn(
                          "text-xs cursor-pointer",
                          student.status === "absent" &&
                            "text-red-600 font-medium"
                        )}
                      >
                        Absent
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Previous 7 Days */}
                <div className="col-span-5 flex items-center gap-2 ml-9">
                  {student.previousDays.map((day, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        day === "P"
                          ? " text-green-700  dark:text-green-400"
                          : " text-red-700  dark:text-red-400"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-muted-foreground">
                    {student.absentDays} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-3">
            <Link to="/admin/students/attendance/mark-attendance">
              <Button >
                Saved Attendance
              </Button>
            </Link>
            
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
    </div>
  );
};

export default Attendance;
