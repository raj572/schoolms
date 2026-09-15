<?php

namespace App\Http\Controllers;

use App\Services\LibraryService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * LibraryController
 *
 * Handles HTTP requests for library management
 */
class LibraryController extends Controller
{
    protected LibraryService $libraryService;

    public function __construct(LibraryService $libraryService)
    {
        $this->libraryService = $libraryService;
    }

    // ==================== Books ====================

    public function getAllBooks(int $schoolId)
    {
        try {
            $result = $this->libraryService->getAllBooks($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getAllBooks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getAvailableBooks(int $schoolId)
    {
        try {
            $result = $this->libraryService->getAvailableBooks($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getAvailableBooks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function searchBooks(Request $request, int $schoolId)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $query = (string) $request->input('query');
            $result = $this->libraryService->searchBooks($schoolId, $query);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::searchBooks - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getBook(int $id)
    {
        try {
            $result = $this->libraryService->getBookById($id);
            return response()->json($result, $result['status'] ? 200 : 404);
        } catch (Exception $e) {
            Log::error("LibraryController::getBook - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function createBook(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|exists:schools,id',
            'book_code' => 'required|string|unique:library_books,book_code',
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'isbn' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'shelf_location' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->libraryService->createBook($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::createBook - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function updateBook(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'author' => 'nullable|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'isbn' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'quantity' => 'sometimes|integer|min:1',
            'available_quantity' => 'sometimes|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'shelf_location' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:available,unavailable,damaged,lost',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->libraryService->updateBook($id, $validator->validated());
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::updateBook - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function deleteBook(int $id)
    {
        try {
            $result = $this->libraryService->deleteBook($id);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::deleteBook - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getCategories(int $schoolId)
    {
        try {
            $result = $this->libraryService->getCategories($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getCategories - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Issues ====================

    public function issueBook(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'book_id' => 'required|exists:library_books,id',
            'school_id' => 'required|exists:schools,id',
            'borrower_id' => 'required|integer',
            'borrower_type' => 'required|string',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'issued_by' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->libraryService->issueBook($validator->validated());
            return response()->json($result, $result['status'] ? 201 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::issueBook - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function returnBook(Request $request, int $issueId)
    {
        $validator = Validator::make($request->all(), [
            'returned_to' => 'required|exists:users,id',
            'fine_amount' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $result = $this->libraryService->returnBook(
                $issueId,
                $data['returned_to'],
                $data['fine_amount'] ?? null,
                $data['remarks'] ?? null
            );
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::returnBook - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getAllIssues(int $schoolId)
    {
        try {
            $result = $this->libraryService->getAllIssues($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getAllIssues - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getActiveIssues(int $schoolId)
    {
        try {
            $result = $this->libraryService->getActiveIssues($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getActiveIssues - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getOverdueIssues(int $schoolId)
    {
        try {
            $result = $this->libraryService->getOverdueIssues($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getOverdueIssues - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getBorrowerIssues(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'borrower_id' => 'required|integer',
            'borrower_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $result = $this->libraryService->getBorrowerIssues($data['borrower_id'], $data['borrower_type']);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getBorrowerIssues - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function extendDueDate(Request $request, int $issueId)
    {
        $validator = Validator::make($request->all(), [
            'days' => 'required|integer|min:1|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->libraryService->extendDueDate($issueId, $request->days);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::extendDueDate - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function getStatistics(int $schoolId)
    {
        try {
            $result = $this->libraryService->getStatistics($schoolId);
            return response()->json($result, $result['status'] ? 200 : 400);
        } catch (Exception $e) {
            Log::error("LibraryController::getStatistics - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    // ==================== Digital Resources ====================

    public function getDigitalResources(int $schoolId)
    {
        try {
            $resources = \App\Models\DigitalResource::where('school_id', $schoolId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Digital resources fetched successfully',
                'data' => $resources,
            ]);
        } catch (Exception $e) {
            Log::error("LibraryController::getDigitalResources - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function createDigitalResource(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'resource_type' => 'required|string',
            'file_size' => 'nullable|string',
            'file_path_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            $data['file_size'] = $data['file_size'] ?? '2.5 MB';
            $data['downloads'] = rand(10, 250);

            $resource = \App\Models\DigitalResource::create($data);

            return response()->json([
                'status' => true,
                'message' => 'Digital resource created successfully',
                'data' => $resource,
            ], 201);
        } catch (Exception $e) {
            Log::error("LibraryController::createDigitalResource - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }

    public function deleteDigitalResource(int $id)
    {
        try {
            \App\Models\DigitalResource::destroy($id);
            return response()->json([
                'status' => true,
                'message' => 'Digital resource deleted successfully',
            ]);
        } catch (Exception $e) {
            Log::error("LibraryController::deleteDigitalResource - " . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server error'], 500);
        }
    }
}


