<?php

namespace App\Services;

use App\Models\SyllabusCompletion;
use App\Models\SyllabusCompletionHistory;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyllabusCompletionService
{
    /**
     * Get all syllabus completions for a teacher
     * Fetches teacher's class-subject assignments from class_time_table
     */
    public function getTeacherCompletion(int $teacherId, int $schoolId): array
    {
        try {
            // Get unique class-subject combinations from timetable
            $assignments = DB::table('class_time_table')
                ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
                ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
                ->where('class_time_table.teacher_id', $teacherId)
                ->where('class_time_table.school_id', $schoolId)
                ->select(
                    'class_time_table.class_id',
                    'class_time_table.subject_id',
                    'school_class.class as class_name',
                    'school_class.section',
                    'school_subjects.subject_name'
                )
                ->groupBy(
                    'class_time_table.class_id',
                    'class_time_table.subject_id',
                    'school_class.class',
                    'school_class.section',
                    'school_subjects.subject_name'
                )
                ->get();

            // For each assignment, get or create completion record
            $completions = $assignments->map(function ($assignment) use ($teacherId, $schoolId) {
                // Try to find existing completion record
                $completion = SyllabusCompletion::where('teacher_id', $teacherId)
                    ->where('school_id', $schoolId)
                    ->where('class_id', $assignment->class_id)
                    ->where('subject_id', $assignment->subject_id)
                    ->first();

                // If no record exists, create a default one
                if (!$completion) {
                    $completion = SyllabusCompletion::create([
                        'teacher_id' => $teacherId,
                        'school_id' => $schoolId,
                        'class_id' => $assignment->class_id,
                        'subject_id' => $assignment->subject_id,
                        'total_chapters' => 0,
                        'completed_chapters' => 0,
                        'last_updated' => null,
                        'remarks' => null,
                    ]);
                }

                return [
                    'id' => $completion->id,
                    'class_id' => $assignment->class_id,
                    'class_name' => $assignment->class_name,
                    'section' => $assignment->section,
                    'subject_id' => $assignment->subject_id,
                    'subject_name' => $assignment->subject_name,
                    'total_chapters' => $completion->total_chapters,
                    'completed_chapters' => $completion->completed_chapters,
                    'completion_percentage' => $completion->completion_percentage,
                    'last_updated' => $completion->last_updated ? $completion->last_updated->format('Y-m-d') : null,
                    'remarks' => $completion->remarks,
                ];
            });

            return [
                'status' => true,
                'data' => $completions,
            ];
        } catch (Exception $e) {
            Log::error('Error fetching teacher completion: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching completion data: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get specific completion by class and subject
     */
    public function getCompletionByClass(int $teacherId, int $classId, int $subjectId, int $schoolId): array
    {
        try {
            $completion = SyllabusCompletion::with(['class', 'subject'])
                ->where('teacher_id', $teacherId)
                ->where('class_id', $classId)
                ->where('subject_id', $subjectId)
                ->where('school_id', $schoolId)
                ->first();

            if (!$completion) {
                return [
                    'status' => false,
                    'message' => 'Completion record not found',
                ];
            }

            return [
                'status' => true,
                'data' => [
                    'id' => $completion->id,
                    'class_id' => $completion->class_id,
                    'class_name' => $completion->class->class ?? 'N/A',
                    'section' => $completion->class->section ?? 'N/A',
                    'subject_id' => $completion->subject_id,
                    'subject_name' => $completion->subject->subject_name ?? 'N/A',
                    'total_chapters' => $completion->total_chapters,
                    'completed_chapters' => $completion->completed_chapters,
                    'completion_percentage' => $completion->completion_percentage,
                    'last_updated' => $completion->last_updated ? $completion->last_updated->format('Y-m-d') : null,
                    'remarks' => $completion->remarks,
                ],
            ];
        } catch (Exception $e) {
            Log::error('Error fetching completion: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching completion: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Update or create syllabus completion
     */
    public function updateCompletion(array $data): array
    {
        try {
            // Validate completed chapters
            if ($data['completed_chapters'] > $data['total_chapters']) {
                return [
                    'status' => false,
                    'message' => 'Completed chapters cannot exceed total chapters',
                ];
            }

            if ($data['completed_chapters'] < 0 || $data['total_chapters'] < 0) {
                return [
                    'status' => false,
                    'message' => 'Chapters count cannot be negative',
                ];
            }

            DB::beginTransaction();

            // Find or create completion record
            $completion = SyllabusCompletion::updateOrCreate(
                [
                    'teacher_id' => $data['teacher_id'],
                    'class_id' => $data['class_id'],
                    'subject_id' => $data['subject_id'],
                    'school_id' => $data['school_id'],
                ],
                [
                    'total_chapters' => $data['total_chapters'],
                    'completed_chapters' => $data['completed_chapters'],
                    'last_updated' => Carbon::now()->format('Y-m-d'),
                    'remarks' => $data['remarks'] ?? null,
                ]
            );

            // Create history record if completed chapters changed
            if ($completion->wasChanged('completed_chapters') || $completion->wasRecentlyCreated) {
                SyllabusCompletionHistory::create([
                    'syllabus_completion_id' => $completion->id,
                    'completed_chapters' => $completion->completed_chapters,
                    'completion_percentage' => $completion->completion_percentage,
                    'recorded_date' => Carbon::now()->format('Y-m-d'),
                ]);
            }

            DB::commit();

            $completion->load(['class', 'subject']);

            return [
                'status' => true,
                'message' => 'Completion updated successfully',
                'data' => [
                    'id' => $completion->id,
                    'class_id' => $completion->class_id,
                    'class_name' => $completion->class->class ?? 'N/A',
                    'section' => $completion->class->section ?? 'N/A',
                    'subject_id' => $completion->subject_id,
                    'subject_name' => $completion->subject->subject_name ?? 'N/A',
                    'total_chapters' => $completion->total_chapters,
                    'completed_chapters' => $completion->completed_chapters,
                    'completion_percentage' => $completion->completion_percentage,
                    'last_updated' => $completion->last_updated->format('Y-m-d'),
                    'remarks' => $completion->remarks,
                ],
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error updating completion: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error updating completion: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get completion history
     */
    public function getCompletionHistory(int $teacherId, int $classId, int $subjectId, int $schoolId): array
    {
        try {
            $completion = SyllabusCompletion::where('teacher_id', $teacherId)
                ->where('class_id', $classId)
                ->where('subject_id', $subjectId)
                ->where('school_id', $schoolId)
                ->first();

            if (!$completion) {
                return [
                    'status' => false,
                    'message' => 'Completion record not found',
                ];
            }

            $history = SyllabusCompletionHistory::where('syllabus_completion_id', $completion->id)
                ->orderBy('recorded_date', 'asc')
                ->get()
                ->map(function ($record) {
                    return [
                        'recorded_date' => $record->recorded_date->format('Y-m-d'),
                        'completed_chapters' => $record->completed_chapters,
                        'completion_percentage' => (float) $record->completion_percentage,
                    ];
                });

            return [
                'status' => true,
                'data' => $history,
            ];
        } catch (Exception $e) {
            Log::error('Error fetching history: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching history: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get syllabus completion for a specific teacher (for principal view)
     */
    public function getTeacherCompletionForPrincipal(int $teacherId, int $schoolId): array
    {
        try {
            // Get unique class-subject combinations from timetable
            $assignments = DB::table('class_time_table')
                ->join('school_class', 'class_time_table.class_id', '=', 'school_class.id')
                ->join('school_subjects', 'class_time_table.subject_id', '=', 'school_subjects.id')
                ->where('class_time_table.teacher_id', $teacherId)
                ->where('class_time_table.school_id', $schoolId)
                ->select(
                    'class_time_table.class_id',
                    'class_time_table.subject_id',
                    'school_class.class as class_name',
                    'school_class.section',
                    'school_subjects.subject_name'
                )
                ->groupBy(
                    'class_time_table.class_id',
                    'class_time_table.subject_id',
                    'school_class.class',
                    'school_class.section',
                    'school_subjects.subject_name'
                )
                ->get();

            // For each assignment, get completion record (don't auto-create for principal view)
            $completions = $assignments->map(function ($assignment) use ($teacherId, $schoolId) {
                $completion = SyllabusCompletion::where('teacher_id', $teacherId)
                    ->where('school_id', $schoolId)
                    ->where('class_id', $assignment->class_id)
                    ->where('subject_id', $assignment->subject_id)
                    ->first();

                // Return data even if no completion record exists
                return [
                    'id' => $completion->id ?? null,
                    'class_id' => $assignment->class_id,
                    'class_name' => $assignment->class_name,
                    'section' => $assignment->section,
                    'subject_id' => $assignment->subject_id,
                    'subject_name' => $assignment->subject_name,
                    'total_chapters' => $completion->total_chapters ?? 0,
                    'completed_chapters' => $completion->completed_chapters ?? 0,
                    'completion_percentage' => $completion ? $completion->completion_percentage : 0,
                    'last_updated' => $completion && $completion->last_updated ? $completion->last_updated->format('Y-m-d') : null,
                    'remarks' => $completion->remarks ?? null,
                ];
            });

            return [
                'status' => true,
                'data' => $completions,
            ];
        } catch (Exception $e) {
            Log::error('Error fetching teacher completion for principal: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching completion data: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get principal overview
     */
    public function getPrincipalOverview(int $schoolId): array
    {
        try {
            $completions = SyllabusCompletion::with(['teacher', 'class', 'subject'])
                ->where('school_id', $schoolId)
                ->get();

            $totalSubjects = $completions->count();
            $averageCompletion = $completions->avg('completion_percentage') ?? 0;
            $completedSubjects = $completions->where('completion_percentage', 100)->count();
            $behindSchedule = $completions->where('completion_percentage', '<', 50)->count();

            // Class-wise breakdown
            $classwiseData = $completions->groupBy('class_id')->map(function ($items, $classId) {
                $firstItem = $items->first();
                return [
                    'class_id' => $classId,
                    'class_name' => $firstItem->class->class ?? 'N/A',
                    'section' => $firstItem->class->section ?? 'N/A',
                    'total_subjects' => $items->count(),
                    'average_completion' => round($items->avg('completion_percentage'), 2),
                ];
            })->values();

            // Subject-wise breakdown
            $subjectwiseData = $completions->groupBy('subject_id')->map(function ($items, $subjectId) {
                $firstItem = $items->first();
                return [
                    'subject_id' => $subjectId,
                    'subject_name' => $firstItem->subject->subject_name ?? 'N/A',
                    'total_classes' => $items->count(),
                    'average_completion' => round($items->avg('completion_percentage'), 2),
                ];
            })->values();

            // Teacher-wise performance
            $teacherwiseData = $completions->groupBy('teacher_id')->map(function ($items, $teacherId) {
                $firstItem = $items->first();
                return [
                    'teacher_id' => $teacherId,
                    'teacher_name' => $firstItem->teacher->name ?? 'N/A',
                    'total_subjects' => $items->count(),
                    'average_completion' => round($items->avg('completion_percentage'), 2),
                ];
            })->values();

            return [
                'status' => true,
                'data' => [
                    'statistics' => [
                        'total_subjects' => $totalSubjects,
                        'average_completion' => round($averageCompletion, 2),
                        'completed_subjects' => $completedSubjects,
                        'behind_schedule' => $behindSchedule,
                    ],
                    'classwise' => $classwiseData,
                    'subjectwise' => $subjectwiseData,
                    'teacherwise' => $teacherwiseData,
                ],
            ];
        } catch (Exception $e) {
            Log::error('Error fetching principal overview: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching overview: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get principal detailed view with filters
     */
    public function getPrincipalDetailedView(int $schoolId, array $filters = []): array
    {
        try {
            $query = SyllabusCompletion::with(['teacher', 'class', 'subject'])
                ->where('school_id', $schoolId);

            // Apply filters
            if (!empty($filters['teacher_id'])) {
                $query->where('teacher_id', $filters['teacher_id']);
            }

            if (!empty($filters['class_id'])) {
                $query->where('class_id', $filters['class_id']);
            }

            if (!empty($filters['subject_id'])) {
                $query->where('subject_id', $filters['subject_id']);
            }

            $completions = $query->get()->map(function ($completion) {
                return [
                    'id' => $completion->id,
                    'teacher_id' => $completion->teacher_id,
                    'teacher_name' => $completion->teacher->name ?? 'N/A',
                    'class_id' => $completion->class_id,
                    'class_name' => $completion->class->class ?? 'N/A',
                    'section' => $completion->class->section ?? 'N/A',
                    'subject_id' => $completion->subject_id,
                    'subject_name' => $completion->subject->subject_name ?? 'N/A',
                    'total_chapters' => $completion->total_chapters,
                    'completed_chapters' => $completion->completed_chapters,
                    'completion_percentage' => $completion->completion_percentage,
                    'last_updated' => $completion->last_updated ? $completion->last_updated->format('Y-m-d') : null,
                    'remarks' => $completion->remarks,
                ];
            });

            return [
                'status' => true,
                'data' => $completions,
            ];
        } catch (Exception $e) {
            Log::error('Error fetching detailed view: ' . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Error fetching detailed view: ' . $e->getMessage(),
            ];
        }
    }
}

