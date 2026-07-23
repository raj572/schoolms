<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * LibraryBook Model
 *
 * Represents a book in the school library
 *
 * @property int $id
 * @property int $school_id
 * @property string $book_code
 * @property string $title
 * @property string|null $author
 * @property string|null $publisher
 * @property string|null $isbn
 * @property string|null $category
 * @property int $quantity
 * @property int $available_quantity
 * @property float|null $price
 * @property string|null $shelf_location
 * @property string|null $description
 * @property string $status
 */
class LibraryBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'book_code',
        'title',
        'author',
        'publisher',
        'isbn',
        'category',
        'quantity',
        'available_quantity',
        'price',
        'shelf_location',
        'description',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'available_quantity' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * Get the school that owns the book
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Get all book issues
     */
    public function issues(): HasMany
    {
        return $this->hasMany(LibraryBookIssue::class, 'book_id');
    }

    /**
     * Get active (currently issued) book issues
     */
    public function activeIssues(): HasMany
    {
        return $this->hasMany(LibraryBookIssue::class, 'book_id')
            ->where('status', 'issued');
    }

    /**
     * Check if book is available
     */
    public function isAvailable(): bool
    {
        return $this->available_quantity > 0 && $this->status === 'available';
    }
}


