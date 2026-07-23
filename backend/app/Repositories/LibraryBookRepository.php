<?php

namespace App\Repositories;

use App\Models\LibraryBook;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * LibraryBookRepository
 *
 * Handles database operations for LibraryBook model
 */
class LibraryBookRepository
{
    /**
     * Get all books for a school
     */
    public function getAllBySchool(int $schoolId): Collection
    {
        return LibraryBook::where('school_id', $schoolId)
            ->orderBy('title', 'asc')
            ->get();
    }

    /**
     * Get available books
     */
    public function getAvailable(int $schoolId): Collection
    {
        return LibraryBook::where('school_id', $schoolId)
            ->where('status', 'available')
            ->where('available_quantity', '>', 0)
            ->orderBy('title', 'asc')
            ->get();
    }

    /**
     * Find book by ID
     */
    public function findById(int $id): ?LibraryBook
    {
        return LibraryBook::with(['activeIssues'])->find($id);
    }

    /**
     * Find book by code
     */
    public function findByCode(string $bookCode): ?LibraryBook
    {
        return LibraryBook::where('book_code', $bookCode)->first();
    }

    /**
     * Search books
     */
    public function search(int $schoolId, string $query): Collection
    {
        return LibraryBook::where('school_id', $schoolId)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('author', 'like', "%{$query}%")
                    ->orWhere('isbn', 'like', "%{$query}%")
                    ->orWhere('book_code', 'like', "%{$query}%");
            })
            ->get();
    }

    /**
     * Get books by category
     */
    public function getByCategory(int $schoolId, string $category): Collection
    {
        return LibraryBook::where('school_id', $schoolId)
            ->where('category', $category)
            ->orderBy('title', 'asc')
            ->get();
    }

    /**
     * Create a new book
     */
    public function create(array $data): LibraryBook
    {
        return DB::transaction(function () use ($data) {
            // Ensure available_quantity matches quantity on creation
            if (!isset($data['available_quantity']) && isset($data['quantity'])) {
                $data['available_quantity'] = $data['quantity'];
            }
            return LibraryBook::create($data);
        });
    }

    /**
     * Update a book
     */
    public function update(int $id, array $data): bool
    {
        return DB::transaction(function () use ($id, $data) {
            $book = LibraryBook::findOrFail($id);
            return $book->update($data);
        });
    }

    /**
     * Delete a book
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            $book = LibraryBook::findOrFail($id);

            // Check if book has active issues
            if ($book->activeIssues()->count() > 0) {
                throw new \Exception('Cannot delete book with active issues');
            }

            return $book->delete();
        });
    }

    /**
     * Update available quantity
     */
    public function updateAvailableQuantity(int $id, int $change): bool
    {
        return DB::transaction(function () use ($id, $change) {
            $book = LibraryBook::findOrFail($id);
            $newQuantity = $book->available_quantity + $change;

            if ($newQuantity < 0 || $newQuantity > $book->quantity) {
                throw new \Exception('Invalid available quantity');
            }

            return $book->update(['available_quantity' => $newQuantity]);
        });
    }

    /**
     * Get all categories for a school
     */
    public function getCategories(int $schoolId): array
    {
        return LibraryBook::where('school_id', $schoolId)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->toArray();
    }
}


