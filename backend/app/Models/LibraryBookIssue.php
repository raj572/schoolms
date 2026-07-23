<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * LibraryBookIssue Model
 *
 * Represents a book issue/borrowing record
 *
 * @property int $id
 * @property int $book_id
 * @property int $school_id
 * @property int $borrower_id
 * @property string $borrower_type
 * @property string $issue_date
 * @property string $due_date
 * @property string|null $return_date
 * @property float $fine_amount
 * @property string $status
 * @property string|null $remarks
 * @property int $issued_by
 * @property int|null $returned_to
 */
class LibraryBookIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'school_id',
        'borrower_id',
        'borrower_type',
        'issue_date',
        'due_date',
        'return_date',
        'fine_amount',
        'status',
        'remarks',
        'issued_by',
        'returned_to',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'return_date' => 'date',
        'fine_amount' => 'decimal:2',
    ];

    /**
     * Get the book
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(LibraryBook::class, 'book_id');
    }

    /**
     * Get the school
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get the borrower (polymorphic)
     */
    public function borrower(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who issued the book
     */
    public function issuedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Get the user who received the returned book
     */
    public function returnedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_to');
    }

    /**
     * Check if book is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status === 'issued' &&
               now()->greaterThan($this->due_date);
    }

    /**
     * Calculate overdue days
     */
    public function getOverdueDaysAttribute(): int
    {
        if ($this->isOverdue()) {
            return now()->diffInDays($this->due_date);
        }
        return 0;
    }
}


