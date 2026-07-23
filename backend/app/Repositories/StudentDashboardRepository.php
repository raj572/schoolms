<?php

namespace App\Repositories;

use App\Models\Student;
use App\Models\StudentDetails;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StudentDashboardRepository
{
    /**
     * Get student with full details
     */
    public function getStudentWithDetails(int $studentId)
    {
        try {
            return Student::with('detail')
                ->where('id', $studentId)
                ->first();
        } catch (\Exception $e) {
            Log::error('Error fetching student details: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get class_id for a student based on their class and section
     */
    public function getClassIdForStudent(int $studentId, int $schoolId)
    {
        try {
            $studentDetail = StudentDetails::where('student_id', $studentId)->first();

            if (!$studentDetail) {
                return null;
            }

            $schoolClass = DB::table('school_class')
                ->where('school_id', $schoolId)
                ->where('class', $studentDetail->class)
                ->where('section', $studentDetail->section)
                ->first();

            return $schoolClass ? $schoolClass->id : null;
        } catch (\Exception $e) {
            Log::error('Error fetching class_id for student: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get today's classes for a specific class
     */
    public function getTodayClassesForClass(int $classId, string $dayOfWeek, int $schoolId)
    {
        try {
            return DB::table('class_time_table as ctt')
                ->join('school_subjects as ss', 'ctt.subject_id', '=', 'ss.id')
                ->join('teachers as t', 'ctt.teacher_id', '=', 't.id')
                ->join('school_class as sc', 'ctt.class_id', '=', 'sc.id')
                ->where('ctt.class_id', $classId)
                ->where('ctt.day_of_week', $dayOfWeek)
                ->where('ctt.school_id', $schoolId)
                ->select(
                    'ctt.id',
                    'ctt.start_time',
                    'ctt.end_time',
                    'ss.id as subject_id',
                    'ss.subject_name',
                    't.name as teacher_name',
                    'sc.room_no'
                )
                ->orderBy('ctt.start_time', 'asc')
                ->get();
        } catch (\Exception $e) {
            Log::error('Error fetching today\'s classes: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get syllabus completion for all subjects in a class
     */
    public function getSyllabusCompletionForClass(int $classId, int $schoolId)
    {
        try {
            return DB::table('class_time_table as ctt')
                ->join('school_subjects as ss', 'ctt.subject_id', '=', 'ss.id')
                ->leftJoin('syllabus_completion as sc', function ($join) use ($classId) {
                    $join->on('sc.subject_id', '=', 'ctt.subject_id')
                        ->where('sc.class_id', '=', $classId);
                })
                ->leftJoin('teachers as t', 'ctt.teacher_id', '=', 't.id')
                ->where('ctt.class_id', $classId)
                ->where('ctt.school_id', $schoolId)
                ->select(
                    'ss.id as subject_id',
                    'ss.subject_name',
                    DB::raw('COALESCE(sc.total_chapters, 0) as total_chapters'),
                    DB::raw('COALESCE(sc.completed_chapters, 0) as completed_chapters'),
                    DB::raw('ROUND((COALESCE(sc.completed_chapters, 0) / NULLIF(COALESCE(sc.total_chapters, 1), 0) * 100), 2) as percentage'),
                    'sc.last_updated',
                    'sc.remarks',
                    't.name as teacher_name'
                )
                ->groupBy(
                    'ss.id',
                    'ss.subject_name',
                    'sc.total_chapters',
                    'sc.completed_chapters',
                    'sc.last_updated',
                    'sc.remarks',
                    't.name'
                )
                ->get();
        } catch (\Exception $e) {
            Log::error('Error fetching syllabus completion: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get student's class and section details
     */
    public function getStudentClassDetails(int $studentId)
    {
        try {
            return DB::table('student_details as sd')
                ->join('school_class as sc', function ($join) {
                    $join->on('sd.class', '=', 'sc.class')
                        ->on('sd.section', '=', 'sc.section')
                        ->on('sd.school_id', '=', 'sc.school_id');
                })
                ->where('sd.student_id', $studentId)
                ->select(
                    'sc.id as class_id',
                    'sc.class',
                    'sc.section',
                    'sc.room_no',
                    'sc.teacher_in_charge'
                )
                ->first();
        } catch (\Exception $e) {
            Log::error('Error fetching student class details: ' . $e->getMessage());
            return null;
        }
    }
}

