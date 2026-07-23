<?php

namespace App\Http\Controllers;

use App\Models\ContactEnquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class ContactController extends Controller
{
    /**
     * Submit contact form enquiry
     * POST /api/contact/submit
     */
    public function submitEnquiry(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'subject' => 'required|string|max:255',
                'message' => 'required|string|max:5000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed.',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Create enquiry
            $enquiry = ContactEnquiry::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'subject' => $request->subject,
                'message' => $request->message,
                'status' => 'pending',
            ]);

            Log::info('Contact enquiry submitted', [
                'enquiry_id' => $enquiry->id,
                'email' => $enquiry->email,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Thank you for contacting us! We will get back to you soon.',
                'data' => [
                    'enquiry_id' => $enquiry->id,
                ],
            ], 201);

        } catch (Exception $e) {
            Log::error('Contact enquiry submission failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to submit enquiry. Please try again later.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
