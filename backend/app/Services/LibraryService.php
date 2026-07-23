<?php

namespace App\Services;

use App\Repositories\LibraryBookRepository;
use App\Repositories\LibraryBookIssueRepository;
use Exception;
use Illuminate\Support\Facades\Log;

/**
 * LibraryService
 *
 * Handles business logic for library management
 */
class LibraryService
{
    protected LibraryBookRepository $bookRepository;
    protected LibraryBookIssueRepository $issueRepository;

    public function __construct(
        LibraryBookRepository $bookRepository,
        LibraryBookIssueRepository $issueRepository
    ) {
        $this->bookRepository = $bookRepository;
        $this->issueRepository = $issueRepository;
    }

    // ==================== Book Management ====================

    /**
     * Get all books
     */
    public function getAllBooks(int $schoolId): array
    {
        try {
            $books = $this->bookRepository->getAllBySchool($schoolId);

            return [
                'status' => true,
                'message' => 'Books fetched successfully',
                'data' => $books->toArray(),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching books: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch books',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get available books
     */
    public function getAvailableBooks(int $schoolId): array
    {
        try {
            $books = $this->bookRepository->getAvailable($schoolId);

            return [
                'status' => true,
                'message' => 'Available books fetched successfully',
                'data' => $books,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching available books: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch available books',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Search books
     */
    public function searchBooks(int $schoolId, string $query): array
    {
        try {
            $books = $this->bookRepository->search($schoolId, $query);

            return [
                'status' => true,
                'message' => 'Search completed successfully',
                'data' => $books,
            ];
        } catch (Exception $e) {
            Log::error("Error searching books: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get book by ID
     */
    public function getBookById(int $id): array
    {
        try {
            $book = $this->bookRepository->findById($id);

            if (!$book) {
                return [
                    'status' => false,
                    'message' => 'Book not found',
                ];
            }

            return [
                'status' => true,
                'message' => 'Book fetched successfully',
                'data' => $book,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching book: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch book',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Create new book
     */
    public function createBook(array $data): array
    {
        try {
            // Check if book code already exists
            $existing = $this->bookRepository->findByCode($data['book_code']);
            if ($existing) {
                return [
                    'status' => false,
                    'message' => 'Book code already exists',
                ];
            }

            $book = $this->bookRepository->create($data);

            return [
                'status' => true,
                'message' => 'Book added successfully',
                'data' => $book,
            ];
        } catch (Exception $e) {
            Log::error("Error creating book: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to add book',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update book
     */
    public function updateBook(int $id, array $data): array
    {
        try {
            $updated = $this->bookRepository->update($id, $data);

            if (!$updated) {
                return [
                    'status' => false,
                    'message' => 'Failed to update book',
                ];
            }

            return [
                'status' => true,
                'message' => 'Book updated successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error updating book: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to update book',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete book
     */
    public function deleteBook(int $id): array
    {
        try {
            $deleted = $this->bookRepository->delete($id);

            if (!$deleted) {
                return [
                    'status' => false,
                    'message' => 'Failed to delete book',
                ];
            }

            return [
                'status' => true,
                'message' => 'Book deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error deleting book: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get categories
     */
    public function getCategories(int $schoolId): array
    {
        try {
            $categories = $this->bookRepository->getCategories($schoolId);

            return [
                'status' => true,
                'message' => 'Categories fetched successfully',
                'data' => $categories,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching categories: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ];
        }
    }

    // ==================== Book Issue Management ====================

    /**
     * Issue a book
     */
    public function issueBook(array $data): array
    {
        try {
            // Check if book is available
            $book = $this->bookRepository->findById($data['book_id']);
            if (!$book || !$book->isAvailable()) {
                return [
                    'status' => false,
                    'message' => 'Book is not available for issue',
                ];
            }

            // Check if borrower already has this book
            $activeIssues = $this->issueRepository->getActivByBorrower(
                $data['borrower_id'],
                $data['borrower_type']
            );

            $alreadyIssued = $activeIssues->where('book_id', $data['book_id'])->count() > 0;
            if ($alreadyIssued) {
                return [
                    'status' => false,
                    'message' => 'This book is already issued to the borrower',
                ];
            }

            $issue = $this->issueRepository->issueBook($data);

            return [
                'status' => true,
                'message' => 'Book issued successfully',
                'data' => $issue,
            ];
        } catch (Exception $e) {
            Log::error("Error issuing book: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to issue book: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Return a book
     */
    public function returnBook(int $issueId, int $returnedTo, ?float $fineAmount = null, ?string $remarks = null): array
    {
        try {
            // Calculate fine if not provided
            if ($fineAmount === null) {
                $fineAmount = $this->issueRepository->calculateFine($issueId);
            }

            $returned = $this->issueRepository->returnBook($issueId, $returnedTo, $fineAmount, $remarks);

            if (!$returned) {
                return [
                    'status' => false,
                    'message' => 'Failed to return book',
                ];
            }

            return [
                'status' => true,
                'message' => 'Book returned successfully',
                'fine_amount' => $fineAmount,
            ];
        } catch (Exception $e) {
            Log::error("Error returning book: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all issues
     */
    public function getAllIssues(int $schoolId): array
    {
        try {
            $issues = $this->issueRepository->getAllBySchool($schoolId);

            return [
                'status' => true,
                'message' => 'Issues fetched successfully',
                'data' => $issues,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching issues: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch issues',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get active issues
     */
    public function getActiveIssues(int $schoolId): array
    {
        try {
            $issues = $this->issueRepository->getActive($schoolId);

            // Add borrower name to each issue
            $issuesData = $issues->map(function ($issue) {
                $issueArray = $issue->toArray();
                $issueArray['borrower_name'] = $this->getBorrowerName($issue);
                return $issueArray;
            });

            return [
                'status' => true,
                'message' => 'Active issues fetched successfully',
                'data' => $issuesData->toArray(),
            ];
        } catch (Exception $e) {
            Log::error("Error fetching active issues: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch active issues',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get borrower name from polymorphic relationship
     */
    private function getBorrowerName($issue): string
    {
        try {
            $borrowerType = $issue->borrower_type;
            $borrowerId = $issue->borrower_id;

            if (!$borrowerType || !$borrowerId) {
                return 'Unknown';
            }

            // Map borrower_type to actual model class
            $modelClass = $this->getModelClass($borrowerType);

            if (!$modelClass) {
                return 'Unknown';
            }

            // Load the borrower from the database
            $borrower = $modelClass::find($borrowerId);

            if (!$borrower) {
                return 'Unknown';
            }

            // Extract name based on model type
            if ($borrowerType === 'App\\Models\\StudentDetails' || $borrowerType === 'student') {
                return $borrower->candidate_name ?? 'Unknown Student';
            } elseif ($borrowerType === 'App\\Models\\Teacher' || $borrowerType === 'teacher') {
                return $borrower->full_name ?? 'Unknown Teacher';
            }

            return 'Unknown';
        } catch (Exception $e) {
            Log::error("Error getting borrower name: " . $e->getMessage());
            return 'Unknown';
        }
    }

    /**
     * Get model class from borrower type
     */
    private function getModelClass(string $borrowerType): ?string
    {
        $mapping = [
            'App\\Models\\StudentDetails' => 'App\\Models\\StudentDetails',
            'student' => 'App\\Models\\StudentDetails',
            'App\\Models\\Teacher' => 'App\\Models\\Teacher',
            'teacher' => 'App\\Models\\Teacher',
        ];

        return $mapping[$borrowerType] ?? null;
    }

    /**
     * Get overdue issues
     */
    public function getOverdueIssues(int $schoolId): array
    {
        try {
            $issues = $this->issueRepository->getOverdue($schoolId);

            return [
                'status' => true,
                'message' => 'Overdue issues fetched successfully',
                'data' => $issues,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching overdue issues: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch overdue issues',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get borrower's issues
     */
    public function getBorrowerIssues(int $borrowerId, string $borrowerType): array
    {
        try {
            $issues = $this->issueRepository->getByBorrower($borrowerId, $borrowerType);

            return [
                'status' => true,
                'message' => 'Issues fetched successfully',
                'data' => $issues,
            ];
        } catch (Exception $e) {
            Log::error("Error fetching borrower issues: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch issues',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Extend due date
     */
    public function extendDueDate(int $issueId, int $days): array
    {
        try {
            $extended = $this->issueRepository->extendDueDate($issueId, $days);

            if (!$extended) {
                return [
                    'status' => false,
                    'message' => 'Failed to extend due date',
                ];
            }

            return [
                'status' => true,
                'message' => 'Due date extended successfully',
            ];
        } catch (Exception $e) {
            Log::error("Error extending due date: " . $e->getMessage());
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get library statistics
     */
    public function getStatistics(int $schoolId): array
    {
        try {
            // Get all books
            $allBooks = $this->bookRepository->getAllBySchool($schoolId);
            $totalBooks = $allBooks->sum('quantity');

            // Get available books
            $availableBooks = $allBooks->sum('available_quantity');

            // Get all issues
            $allIssues = $this->issueRepository->getAllBySchool($schoolId);
            $totalIssued = $allIssues->where('status', 'issued')->count();

            // Get overdue issues
            $overdueIssues = $this->issueRepository->getOverdue($schoolId);
            $totalOverdue = $overdueIssues->count();

            return [
                'status' => true,
                'message' => 'Statistics fetched successfully',
                'data' => [
                    'totalBooks' => $totalBooks,
                    'availableBooks' => $availableBooks,
                    'totalIssued' => $totalIssued,
                    'totalOverdue' => $totalOverdue,
                ],
            ];
        } catch (Exception $e) {
            Log::error("Error fetching library statistics: " . $e->getMessage());
            return [
                'status' => false,
                'message' => 'Failed to fetch library statistics',
                'error' => $e->getMessage(),
            ];
        }
    }
}


