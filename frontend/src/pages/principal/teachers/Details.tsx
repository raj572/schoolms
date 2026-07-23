import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUsersStore, TeacherForm } from "@/store/useUsersStore";
import Heading from "@/components/common/Heading";
import { BookOpen, Calendar, Edit, Mail, MapPin, Phone, User, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectForm, useSubjectStore } from "@/store/useSubjectStore";
import { Badge } from "@/components/ui/badge";
import { getTeacherCompletionForPrincipal, SyllabusCompletion } from "@/services/syllabusApiService";

export interface TeacherSubject {
  id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  class: {
    id: number;
    class: string;
    section: string;
  };
  subject: {
    id: number;
    subject_name: string;
    description?: string;
    school_id: number;
  };
}

const Details = () => {
  const { id } = useParams(); 
  const { getTeacherById } = useUsersStore();
  const [teacher, setTeacher] = useState<TeacherForm| null>(null);
  const [subjects, setSubjects] = useState<SubjectForm[]>([]);
  const [syllabusCompletion, setSyllabusCompletion] = useState<SyllabusCompletion[]>([]);
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);
  const { getSubjects } = useSubjectStore();

//fetch teacher by id
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        if (!id) return;
        const data = await getTeacherById(id);

        setTeacher(data);
      } catch (error) {
        console.error("Failed to fetch teacher:", error);
      }
    };
    fetchTeacher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  //fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!teacher?.school_id) return;
      const data = await getSubjects(Number(teacher.school_id));
      if (data) setSubjects(data);
    };
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);

  // Fetch syllabus completion
  useEffect(() => {
    const fetchSyllabusCompletion = async () => {
      if (!id) return;
      
      try {
        setIsLoadingCompletion(true);
        const response = await getTeacherCompletionForPrincipal(Number(id));
        if (response.status && response.data) {
          setSyllabusCompletion(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch syllabus completion:", error);
      } finally {
        setIsLoadingCompletion(false);
      }
    };

    fetchSyllabusCompletion();
  }, [id]);

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return "text-success";
    if (percentage >= 75) return "text-success";
    if (percentage >= 50) return "text-warning";
    return "text-destructive";
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage === 100) return { label: "Completed", variant: "default" as const };
    if (percentage >= 75) return { label: "On Track", variant: "secondary" as const };
    if (percentage >= 50) return { label: "In Progress", variant: "secondary" as const };
    return { label: "Behind", variant: "destructive" as const };
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:justify-between md:items-center mb-8">
        <Heading
          title={teacher?.name || "Teacher Details"}
          description={teacher ? ` EMP${teacher?.id}` : "Loading..."}
        />

        <div className="flex gap-2">
          <Link to="/principal/teachers/list">
            <Button variant="outline">Back to List</Button>
          </Link>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Teacher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{teacher?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{teacher?.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{teacher?.employee_code || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                DOB: {teacher?.dob ? new Date(teacher.dob).toLocaleDateString() : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Qualification:</span>
              <span className="text-sm">{teacher?.qualification || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Gender:</span>
              <span className="text-sm">{teacher?.gender || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Subjects / Classes Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex text-lg items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subjects & Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
           <div>
              {teacher?.subjects && teacher.subjects.length > 0 ? (
                <ul className="mt-1 ml-4 space-y-1 text-sm">
                  {teacher.subjects.map((item) => (
                    <li key={item.id} className="list-none  list-inside">
                      {item.subject?.subject_name || "Unknown Subject"}{" "}
                      <span className="text-muted-foreground">
                        – {item.class?.class} {item.class?.section}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm ml-2">No subjects/classes assigned</p>
              )}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Syllabus Completion Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex text-lg items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Syllabus Completion Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCompletion ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : syllabusCompletion.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {syllabusCompletion.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Subjects</p>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">
                    {(syllabusCompletion.reduce((sum, item) => sum + item.completion_percentage, 0) / syllabusCompletion.length).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Average Completion</p>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <p className="text-2xl font-bold text-info">
                    {syllabusCompletion.filter(item => item.completion_percentage === 100).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
              </div>

              {/* Subject-wise Completion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {syllabusCompletion.map((item) => {
                  const badge = getCompletionBadge(item.completion_percentage);
                  return (
                    <div key={item.id || `${item.class_id}-${item.subject_id}`} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.subject_name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Class {item.class_name}-{item.section}
                          </p>
                        </div>
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.label}
                        </Badge>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className={`font-medium ${getCompletionColor(item.completion_percentage)}`}>
                            {item.completion_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500 bg-primary"
                            // Dynamic width for progress bar - inline style is necessary
                            style={{ width: `${Math.min(100, item.completion_percentage)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>
                          {item.completed_chapters} / {item.total_chapters} chapters
                        </span>
                        {item.last_updated && (
                          <span>Updated: {new Date(item.last_updated).toLocaleDateString()}</span>
                        )}
                      </div>

                      {item.remarks && (
                        <p className="mt-2 text-xs text-muted-foreground italic">
                          {item.remarks}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No syllabus completion data available yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Teacher needs to update their syllabus progress
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note: Teacher assignments are now managed through the Timetable page */}

    </div>
  );
};

export default Details;
