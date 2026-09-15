<?php

namespace App\Repositories;

use App\Models\LibraryBookIssue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * LibraryBookIssueRepository
 *
 * Handles database operations for LibraryBookIssue model
 */
class LibraryBookIssueRepository
{
    /**
     * Get all issues for a school
     */
    public function getAllBySchool(int $schoolId): Collection
    {
        return LibraryBookIssue::where('school_id', $schoolId)
            ->with(['book', 'issuedByUser'])
            ->orderBy('issue_date', 'desc')
            ->get();
    }

    /**
     * Get active issues
     */
    public function getActive(int $schoolId): Collection
    {
        return LibraryBookIssue::where('school_id', $schoolId)
            ->where('status', 'issued')
            ->with(['book'])
            ->orderBy('due_date', 'asc')
            ->get();
    }

    /**
     * Get overdue issues
     */
    public function getOverdue(int $schoolId): Collection
    {
        return LibraryBookIssue::where('school_id', $schoolId)
            ->where('status', 'issued')
            ->where('due_date', '<', now())
            ->with(['book', 'borrower'])
            ->orderBy('due_date', 'asc')
            ->get();
    }

    /**
     * Get borrower's issues
     */
    public function getByBorrower(int $borrowerId, string $borrowerType): Collection
    {
        // Resolve student_details_id if student user id was provided
        $borrowerIds = [$borrowerId];
        
        if (str_contains(strtolower($borrowerType), 'student')) {
            $studentDetail = DB::table('student_details')
                ->where('student_id', $borrowerId)
                ->orWhere('id', $borrowerId)
                ->first();

            if ($studentDetail) {
                $borrowerIds[] = $studentDetail->id;
                $borrowerIds[] = $studentDetail->student_id;
            }
        }

        return LibraryBookIssue::whereIn('borrower_id', array_unique($borrowerIds))
            ->where(function ($query) use ($borrowerType) {
                if (str_contains(strtolower($borrowerType), 'student')) {
                    $query->whereIn('borrower_type', ['student', 'App\\Models\\StudentDetails']);
                } else {
                    $query->where('borrower_type', $borrowerType);
                }
            })
            ->with(['book'])
            ->orderBy('issue_date', 'desc')
            ->get();
    }

    /**
     * Get borrower's active issues
     */
    public function getActivByBorrower(int $borrowerId, string $borrowerType): Collection
    {
        return LibraryBookIssue::where('borrower_id', $borrowerId)
            ->where('borrower_type', $borrowerType)
            ->where('status', 'issued')
            ->with(['book'])
            ->get();
    }

    /**
     * Issue a book
     */
    public function issueBook(array $data): LibraryBookIssue
    {
        return DB::transaction(function () use ($data) {
            // Create the issue record
            $issue = LibraryBookIssue::create($data);

            // Update book's available quantity
            $book = $issue->book;
            if ($book->available_quantity > 0) {
                $book->decrement('available_quantity');
            } else {
                throw new \Exception('Book not available');
            }

            return $issue;
        });
    }

    /**
     * Return a book
     */
    public function returnBook(int $issueId, int $returnedTo, ?float $fineAmount = null, ?string $remarks = null): bool
    {
        return DB::transaction(function () use ($issueId, $returnedTo, $fineAmount, $remarks) {
            $issue = LibraryBookIssue::findOrFail($issueId);

            if ($issue->status !== 'issued') {
                throw new \Exception('Book already returned or not issued');
            }

            $issue->update([
                'status' => 'returned',
                'return_date' => now(),
                'returned_to' => $returnedTo,
                'fine_amount' => $fineAmount ?? 0,
                'remarks' => $remarks,
            ]);

            // Increment book's available quantity
            $issue->book->increment('available_quantity');

            return true;
        });
    }

    /**
     * Mark book as lost
     */
    public function markAsLost(int $issueId, ?string $remarks = null): bool
    {
        return DB::transaction(function () use ($issueId, $remarks) {
            $issue = LibraryBookIssue::findOrFail($issueId);

            $issue->update([
                'status' => 'lost',
                'remarks' => $remarks,
            ]);

            // Update book status if all copies are lost
            // (This is simplified - you might want more complex logic)

            return true;
        });
    }

    /**
     * Calculate fine for overdue book
     */
    public function calculateFine(int $issueId, float $finePerDay = 5.0): float
    {
        $issue = LibraryBookIssue::findOrFail($issueId);

        if (!$issue->isOverdue()) {
            return 0.0;
        }

        $overdueDays = now()->diffInDays($issue->due_date);
        return $overdueDays * $finePerDay;
    }

    /**
     * Extend due date
     */
    public function extendDueDate(int $issueId, int $days): bool
    {
        return DB::transaction(function () use ($issueId, $days) {
            $issue = LibraryBookIssue::findOrFail($issueId);

            if ($issue->status !== 'issued') {
                throw new \Exception('Can only extend due date for active issues');
            }

            $newDueDate = Carbon::parse($issue->due_date)->addDays($days);
            return $issue->update(['due_date' => $newDueDate]);
        });
    }

    /**
     * Get issue history for a book
     */
    public function getBookHistory(int $bookId): Collection
    {
        return LibraryBookIssue::where('book_id', $bookId)
            ->with(['borrower'])
            ->orderBy('issue_date', 'desc')
            ->get();
    }
}


