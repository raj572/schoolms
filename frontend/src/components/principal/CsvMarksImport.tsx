import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadMarksCsv, downloadMarksTemplate, type Exam } from '@/services/examApiService';

interface CsvMarksImportProps {
  exams: Exam[];
  onSuccess?: () => void;
}

export const CsvMarksImport: React.FC<CsvMarksImportProps> = ({ exams, onSuccess }) => {
  const { toast } = useToast();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success_count: number; error_count: number; errors?: string[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload a CSV file',
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload a CSV file',
        });
      }
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedExamId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an exam first',
      });
      return;
    }

    setDownloading(true);
    try {
      const result = await downloadMarksTemplate(selectedExamId);
      
      if (result.status && result.data) {
        // Convert array data to CSV
        const csvContent = result.data.map((row: string[]) => row.join(',')).join('\n');
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `exam_marks_template_${selectedExamId}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Success',
          description: 'Template downloaded successfully',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to download template',
        });
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download template',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedExamId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an exam',
      });
      return;
    }

    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a CSV file to upload',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadMarksCsv(selectedFile, selectedExamId);
      
      if (result.status) {
        setUploadResult(result.data);
        toast({
          title: 'Success',
          description: result.message || 'CSV imported successfully',
        });
        onSuccess?.();
        
        // Clear file after successful upload
        setSelectedFile(null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to import CSV',
        });
        if (result.data && result.data.errors) {
          setUploadResult(result.data);
        }
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload CSV',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>CSV Bulk Import</CardTitle>
          <CardDescription>
            Upload a CSV file to import marks for multiple students at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exam Selection */}
          <div>
            <Label htmlFor="exam-select">Select Exam *</Label>
            <Select
              value={selectedExamId?.toString() || ''}
              onValueChange={(value) => {
                setSelectedExamId(value ? Number(value) : null);
                setSelectedFile(null);
                setUploadResult(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id.toString()}>
                    {exam.exam_name} - {new Date(exam.start_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Download Template */}
          {selectedExamId && (
            <div>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={downloading}
                className="w-full"
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Download a pre-filled template with all students and subjects for this exam
              </p>
            </div>
          )}

          {/* File Upload Area */}
          {selectedExamId && (
            <div>
              <Label>Upload CSV File *</Label>
              <div
                className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium">
                  {selectedFile ? selectedFile.name : 'Drag and drop your CSV file here'}
                </p>
                <p className="mt-1 text-xs text-gray-500">or</p>
                <label htmlFor="file-upload" className="mt-2 inline-block">
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Import
                </>
              )}
            </Button>
          )}

          {/* CSV Format Instructions */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong className="text-base">Required CSV Format:</strong>
                  <p className="text-xs text-gray-600 mt-1">
                    Your CSV file must include these columns in this exact order:
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border text-xs font-mono overflow-x-auto">
                  <div className="whitespace-nowrap">
                    class_name,subject_name,roll_no,student_name,marks_obtained,status,remarks
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-sm">Column Descriptions:</p>
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Column</TableHead>
                        <TableHead className="w-[180px]">Format</TableHead>
                        <TableHead>Example</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">class_name</TableCell>
                        <TableCell>Class {'{'}number{'}'}-{'{'}section{'}'}</TableCell>
                        <TableCell>Class 4-A, Class 10-B</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">subject_name</TableCell>
                        <TableCell>Exact subject name</TableCell>
                        <TableCell>English, Mathematics</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">roll_no</TableCell>
                        <TableCell>Student roll number</TableCell>
                        <TableCell>101, 1001</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">student_name</TableCell>
                        <TableCell>Full student name</TableCell>
                        <TableCell>John Doe</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">marks_obtained</TableCell>
                        <TableCell>Number (leave empty for absent)</TableCell>
                        <TableCell>85, 92.5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">status</TableCell>
                        <TableCell>submitted or absent</TableCell>
                        <TableCell>submitted</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">remarks</TableCell>
                        <TableCell>Optional text</TableCell>
                        <TableCell>Good work</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-sm">Sample CSV Data:</p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border text-xs font-mono overflow-x-auto">
                    <div className="space-y-1 whitespace-nowrap">
                      <div className="text-blue-600 dark:text-blue-400">
                        class_name,subject_name,roll_no,student_name,marks_obtained,status,remarks
                      </div>
                      <div>Class 4-A,English,101,John Doe,85,submitted,Good work</div>
                      <div>Class 4-A,Mathematics,101,John Doe,92,submitted,Excellent</div>
                      <div>Class 4-A,Science,102,Jane Smith,78,submitted,</div>
                      <div>Class 10-B,Physics,201,Bob Wilson,88,absent,Was sick</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Important Notes:
                  </p>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Download the template first</strong> - it includes all correct class names and students
                    </li>
                    <li>Class name must be in format: "Class 4-A" (not just "4" or "4-A")</li>
                    <li>Subject names must match exactly as shown in exam schedules</li>
                    <li>Status must be either "submitted" or "absent"</li>
                    <li>For absent students, leave marks_obtained empty</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.error_count > 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Import Completed with Warnings
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Import Successful
                </>
              )}
            </CardTitle>
            <CardDescription>
              {uploadResult.success_count} records imported successfully
              {uploadResult.error_count > 0 && `, ${uploadResult.error_count} errors`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Errors:
                </h4>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Error Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadResult.errors.map((error: string, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-sm text-red-600">{error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

