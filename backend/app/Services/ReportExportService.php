<?php

namespace App\Services;

use App\Models\Student;
use App\Models\MonthlyPayment;
use App\Models\StudentAttendanceRecord;
use App\Models\School;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Exception;

class ReportExportService
{
    /**
     * Export report to PDF
     */
    public function exportToPDF($schoolId, $reportType, $data, $startDate, $endDate): array
    {
        try {
            $school = School::find($schoolId);
            
            $pdf = Pdf::loadView('reports.pdf-template', [
                'reportType' => $reportType,
                'data' => $data,
                'school' => $school,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'generatedAt' => Carbon::now()->format('Y-m-d H:i:s'),
            ]);

            $filename = $this->generateFilename($reportType, $schoolId);
            
            return [
                'status' => true,
                'filename' => $filename,
                'content' => $pdf->output(),
                'error' => null,
            ];
        } catch (Exception $e) {
            Log::error("Error exporting PDF: " . $e->getMessage());
            return [
                'status' => false,
                'filename' => null,
                'content' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Export report to Excel
     */
    public function exportToExcel($schoolId, $reportType, $data, $startDate, $endDate): array
    {
        try {
            $school = School::find($schoolId);
            $filename = $this->generateFilename($reportType, $schoolId, 'xlsx');
            
            $exportData = $this->formatDataForExcel($reportType, $data);
            
            $filePath = storage_path('app/exports/' . $filename);
            
            // Create Excel file using PhpSpreadsheet
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Set report header
            $sheet->setCellValue('A1', $school->name);
            $sheet->setCellValue('A2', ucfirst($reportType) . ' Report');
            $sheet->setCellValue('A3', 'Period: ' . $startDate . ' to ' . $endDate);
            $sheet->setCellValue('A4', 'Generated: ' . Carbon::now()->format('Y-m-d H:i:s'));
            
            // Add data
            $row = 6;
            foreach ($exportData as $rowData) {
                $col = 'A';
                foreach ($rowData as $cell) {
                    $sheet->setCellValue($col . $row, $cell);
                    $col++;
                }
                $row++;
            }
            
            // Save file
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $writer->save($filePath);
            
            return [
                'status' => true,
                'filename' => $filename,
                'filePath' => $filePath,
                'error' => null,
            ];
        } catch (Exception $e) {
            Log::error("Error exporting Excel: " . $e->getMessage());
            return [
                'status' => false,
                'filename' => null,
                'filePath' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Export report to CSV
     */
    public function exportToCSV($schoolId, $reportType, $data, $startDate, $endDate): array
    {
        try {
            $school = School::find($schoolId);
            $filename = $this->generateFilename($reportType, $schoolId, 'csv');
            
            $exportData = $this->formatDataForCSV($reportType, $data);
            
            $filePath = storage_path('app/exports/' . $filename);
            
            $file = fopen($filePath, 'w');
            
            // Write header
            fputcsv($file, [$school->name]);
            fputcsv($file, [ucfirst($reportType) . ' Report']);
            fputcsv($file, ['Period: ' . $startDate . ' to ' . $endDate]);
            fputcsv($file, ['Generated: ' . Carbon::now()->format('Y-m-d H:i:s')]);
            fputcsv($file, []); // Empty row
            
            // Write data
            foreach ($exportData as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
            
            return [
                'status' => true,
                'filename' => $filename,
                'filePath' => $filePath,
                'error' => null,
            ];
        } catch (Exception $e) {
            Log::error("Error exporting CSV: " . $e->getMessage());
            return [
                'status' => false,
                'filename' => null,
                'filePath' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Format data for Excel export
     */
    private function formatDataForExcel($reportType, $data): array
    {
        $formattedData = [];
        
        switch ($reportType) {
            case 'attendance':
                $formattedData[] = ['Month', 'Attendance %', 'Present', 'Absent'];
                foreach ($data['attendance']['studentAttendance']['data'] as $row) {
                    $formattedData[] = [
                        $row['month'] ?? '',
                        $row['attendance'] ?? 0,
                        $row['present'] ?? 0,
                        $row['absent'] ?? 0,
                    ];
                }
                break;
                
            case 'financial':
                $formattedData[] = ['Month', 'Paid (₹)', 'Due (₹)'];
                foreach ($data['feeCollection']['monthlyData'] as $row) {
                    $formattedData[] = [
                        $row['month'] ?? '',
                        $row['paid'] ?? 0,
                        $row['due'] ?? 0,
                    ];
                }
                break;
                
            case 'performance':
                $formattedData[] = ['Subject', 'Average %', 'Students'];
                foreach ($data['performance']['subjectWiseData'] as $row) {
                    $formattedData[] = [
                        $row['name'] ?? '',
                        $row['average'] ?? 0,
                        $row['students'] ?? 0,
                    ];
                }
                break;
        }
        
        return $formattedData;
    }

    /**
     * Format data for CSV export
     */
    private function formatDataForCSV($reportType, $data): array
    {
        // Reuse the same format as Excel
        return $this->formatDataForExcel($reportType, $data);
    }

    /**
     * Generate filename for export
     */
    private function generateFilename($reportType, $schoolId, $extension = 'pdf'): string
    {
        $timestamp = Carbon::now()->format('Y-m-d_His');
        return "{$reportType}_report_school_{$schoolId}_{$timestamp}.{$extension}";
    }
}
