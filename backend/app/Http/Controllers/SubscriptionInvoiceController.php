<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionTransaction;
use App\Models\School;
use App\Helpers\JWTHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;

class SubscriptionInvoiceController extends Controller
{
    /**
     * Convert integer amount to words (Indian numbering system).
     */
    private function numberToWords(float $number): string
    {
        $no = floor($number);
        $fraction = round(($number - $no) * 100);
        $words = [
            0 => '', 1 => 'One', 2 => 'Two', 3 => 'Three', 4 => 'Four', 5 => 'Five',
            6 => 'Six', 7 => 'Seven', 8 => 'Eight', 9 => 'Nine', 10 => 'Ten',
            11 => 'Eleven', 12 => 'Twelve', 13 => 'Thirteen', 14 => 'Fourteen', 15 => 'Fifteen',
            16 => 'Sixteen', 17 => 'Seventeen', 18 => 'Eighteen', 19 => 'Nineteen',
            20 => 'Twenty', 30 => 'Thirty', 40 => 'Forty', 50 => 'Fifty',
            60 => 'Sixty', 70 => 'Seventy', 80 => 'Eighty', 90 => 'Ninety'
        ];
        $digits = ['', 'Hundred', 'Thousand', 'Lakh', 'Crore'];

        $str = [];
        $crore = floor($no / 10000000);
        $no %= 10000000;
        $lakh = floor($no / 100000);
        $no %= 100000;
        $thousand = floor($no / 1000);
        $no %= 1000;
        $hundred = floor($no / 100);
        $remainder = $no % 100;

        if ($crore) {
            $str[] = $this->twoDigitsToWords($crore, $words) . ' Crore';
        }
        if ($lakh) {
            $str[] = $this->twoDigitsToWords($lakh, $words) . ' Lakh';
        }
        if ($thousand) {
            $str[] = $this->twoDigitsToWords($thousand, $words) . ' Thousand';
        }
        if ($hundred) {
            $str[] = $words[$hundred] . ' Hundred';
        }
        if ($remainder) {
            $str[] = $this->twoDigitsToWords($remainder, $words);
        }

        $result = implode(' ', array_filter($str)) . ' Rupees';
        if ($fraction > 0) {
            $result .= ' and ' . $this->twoDigitsToWords($fraction, $words) . ' Paise';
        }
        return $result . ' Only';
    }

    private function twoDigitsToWords(int $num, array $words): string
    {
        if ($num < 20) {
            return $words[$num] ?? '';
        }
        $tens = floor($num / 10) * 10;
        $units = $num % 10;
        return trim(($words[$tens] ?? '') . ' ' . ($words[$units] ?? ''));
    }

    /**
     * Prepare invoice data from transaction.
     */
    private function prepareInvoiceData(SubscriptionTransaction $transaction): array
    {
        $transaction->load(['school', 'subscriptionPlan', 'administrator']);

        $totalAmount = floatval($transaction->order_amount);
        // Assuming 18% GST included in price
        $taxRate = 18.0;
        $baseAmount = round($totalAmount / (1 + ($taxRate / 100)), 2);
        $taxAmount = round($totalAmount - $baseAmount, 2);
        $cgst = round($taxAmount / 2, 2);
        $sgst = round($taxAmount / 2, 2);

        $invoiceNumber = 'INV-' . ($transaction->created_at ? $transaction->created_at->format('Y') : date('Y')) . '-' . str_pad($transaction->id, 5, '0', STR_PAD_LEFT);

        $startDate = $transaction->subscription_start_date ? Carbon::parse($transaction->subscription_start_date) : Carbon::parse($transaction->created_at);
        $endDate = $transaction->subscription_end_date ? Carbon::parse($transaction->subscription_end_date) : $startDate->copy()->addMonths($transaction->duration_months ?? 1);

        $paymentDate = $transaction->payment_date ? Carbon::parse($transaction->payment_date) : Carbon::parse($transaction->created_at);

        $isExtension = str_contains(strtolower($transaction->remarks ?? ''), 'extension') ||
                       str_contains(strtolower($transaction->remarks ?? ''), 'renewal');

        return [
            'transaction' => $transaction,
            'school' => $transaction->school,
            'administrator' => $transaction->administrator,
            'plan' => $transaction->subscriptionPlan,
            'invoiceNumber' => $invoiceNumber,
            'invoiceDate' => $paymentDate->format('d M, Y'),
            'paymentDate' => $paymentDate->format('d M, Y h:i A'),
            'startDate' => $startDate->format('d M, Y'),
            'endDate' => $endDate->format('d M, Y'),
            'baseAmount' => $baseAmount,
            'taxRate' => $taxRate,
            'taxAmount' => $taxAmount,
            'cgst' => $cgst,
            'sgst' => $sgst,
            'totalAmount' => $totalAmount,
            'amountInWords' => $this->numberToWords($totalAmount),
            'isExtension' => $isExtension,
        ];
    }

    /**
     * Show official invoice view in browser.
     * GET /invoices/subscription/{id}
     */
    public function showInvoice(Request $request, $id)
    {
        try {
            $transaction = SubscriptionTransaction::findOrFail($id);
            $data = $this->prepareInvoiceData($transaction);
            $data['isPdf'] = false;

            return view('invoices.subscription-invoice', $data);
        } catch (Exception $e) {
            Log::error("Failed to render invoice view: " . $e->getMessage());
            abort(404, 'Invoice not found: ' . $e->getMessage());
        }
    }

    /**
     * Download official invoice as PDF.
     * GET /invoices/subscription/{id}/download
     * GET /api/administrator/payments/transactions/{id}/invoice/pdf
     */
    public function downloadPdf(Request $request, $id)
    {
        try {
            $transaction = SubscriptionTransaction::findOrFail($id);
            $data = $this->prepareInvoiceData($transaction);
            $data['isPdf'] = true;

            $pdf = Pdf::loadView('invoices.subscription-invoice', $data);
            $pdf->setPaper('a4', 'portrait');

            $filename = 'Invoice-' . $data['invoiceNumber'] . '.pdf';

            if ($request->query('stream') === 'true') {
                return $pdf->stream($filename);
            }

            return $pdf->download($filename);
        } catch (Exception $e) {
            Log::error("Failed to download PDF invoice: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate PDF invoice: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get invoice JSON data (API).
     * GET /api/administrator/payments/transactions/{id}/invoice
     */
    public function getInvoiceData(Request $request, $id)
    {
        try {
            $transaction = SubscriptionTransaction::findOrFail($id);
            $data = $this->prepareInvoiceData($transaction);

            // Add direct links for frontend
            $baseUrl = url('/');
            $data['view_url'] = "{$baseUrl}/invoices/subscription/{$transaction->id}";
            $data['download_url'] = "{$baseUrl}/invoices/subscription/{$transaction->id}/download";

            return response()->json([
                'status' => true,
                'message' => 'Invoice data retrieved successfully',
                'data' => $data,
            ]);
        } catch (Exception $e) {
            Log::error("Failed to fetch invoice data: " . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Invoice not found: ' . $e->getMessage(),
            ], 404);
        }
    }
}
