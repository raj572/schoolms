<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Academic Report Card - {{ $student->candidate_name ?? 'Student' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #f1f5f9;
            font-size: 11px;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .action-bar {
            background: #0f172a;
            color: #fff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 50;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .action-bar .brand { font-weight: 700; font-size: 15px; }
        .action-bar .btn-group { display: flex; gap: 10px; }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            text-decoration: none;
            cursor: pointer;
            border: none;
        }
        .btn-print { background: #334155; color: #fff; }
        .btn-download { background: #0284c7; color: #fff; }

        .report-card {
            max-width: 820px;
            margin: 20px auto;
            background: #ffffff;
            padding: 28px 34px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            border: 2px solid #0369a1;
            position: relative;
        }

        @if($isPdf ?? false)
        body { background: #fff; }
        .report-card { margin: 0; padding: 16px; box-shadow: none; border: 2px solid #0369a1; max-width: 100%; }
        .action-bar { display: none !important; }
        @endif

        @media print {
            body { background: #fff; }
            .action-bar { display: none !important; }
            .report-card { margin: 0; padding: 16px; box-shadow: none; max-width: 100%; border: 2px solid #0369a1; }
        }

        table.full-width { width: 100%; border-collapse: collapse; }
        table.full-width td { vertical-align: top; }

        .school-header {
            text-align: center;
            border-bottom: 2px solid #0369a1;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .school-title { font-size: 22px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; }
        .school-affil { font-size: 10px; color: #475569; font-weight: 600; margin-top: 2px; }
        .school-address { font-size: 10px; color: #64748b; margin-top: 2px; }

        .doc-badge-bar {
            text-align: center;
            margin: 8px 0 12px 0;
        }
        .doc-badge {
            display: inline-block;
            background: #0369a1;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 18px;
            border-radius: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .term-title {
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
        }

        .student-bio-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 14px;
        }
        .student-bio-box td { font-size: 11px; padding: 3px 6px; }

        .marks-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .marks-table th {
            background: #e0f2fe;
            color: #0369a1;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            padding: 6px 8px;
            border: 1px solid #94a3b8;
            text-align: left;
        }
        .marks-table td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            font-size: 10.5px;
        }
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }

        .grade-badge {
            display: inline-block;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 4px;
            background: #f1f5f9;
            color: #0f172a;
            border: 1px solid #cbd5e1;
        }

        .summary-matrix {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .summary-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: center;
            border-radius: 4px;
        }
        .summary-card .val {
            font-size: 16px;
            font-weight: 800;
            color: #0369a1;
            margin-top: 2px;
        }
        .summary-card .lbl {
            font-size: 9px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
        }

        .grading-scale {
            font-size: 9px;
            color: #64748b;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 6px 10px;
            margin-bottom: 14px;
        }

        .signatures-table {
            width: 100%;
            margin-top: 28px;
            border-collapse: collapse;
        }
        .signatures-table td {
            text-align: center;
            vertical-align: bottom;
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            padding-top: 30px;
        }
        .sign-line {
            display: inline-block;
            width: 140px;
            border-top: 1px dashed #64748b;
            padding-top: 4px;
        }

        .footer-note {
            margin-top: 18px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    @if(!($isPdf ?? false))
    <div class="action-bar">
        <div class="brand">LEARNAZ SCHOOL ERP • Student Report Card</div>
        <div class="btn-group">
            <button onclick="window.print()" class="btn btn-print">🖨️ Print Marksheet</button>
            <a href="?download=pdf" class="btn btn-download">⬇️ Download PDF</a>
        </div>
    </div>
    @endif

    <div class="report-card">

        <!-- School Header -->
        <div class="school-header">
            <div class="school-title">{{ $school->name ?? 'Demo International School' }}</div>
            <div class="school-affil">
                Affiliated to {{ $school->board ?? 'CBSE' }} • Affiliation No: {{ $school->affiliation_number ?? 'AFF-2026-9812' }} • School Code: {{ $school->school_code ?? 'SCH-0102' }}
            </div>
            <div class="school-address">
                {{ $school->address ?? 'Station Road, Campus Area' }}, {{ $school->city ?? 'Central District' }} | Email: {{ $school->email ?? 'info@school.edu' }}
            </div>
        </div>

        <!-- Badge & Term -->
        <div class="doc-badge-bar">
            <div class="doc-badge">Academic Achievement Report Card</div>
            <div class="term-title">{{ $examName ?? 'Annual Examination' }} • Session {{ $session ?? '2026-2027' }}</div>
        </div>

        <!-- Student Profile Box -->
        <div class="student-bio-box">
            <table class="full-width">
                <tr>
                    <td style="width: 16%; font-weight: 700; color: #64748b;">Student Name:</td>
                    <td style="width: 34%; font-weight: 700; color: #0369a1;">{{ $student->candidate_name ?? 'Rohan Gupta' }}</td>
                    <td style="width: 16%; font-weight: 700; color: #64748b;">Admission No:</td>
                    <td style="width: 34%; font-weight: 700;">{{ $student->roll_no ? 'ADM-' . $student->roll_no : 'ADM-2026-088' }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #64748b;">Class & Section:</td>
                    <td style="font-weight: 600;">Class {{ $student->class ?? '10' }} - Section {{ $student->section ?? 'A' }}</td>
                    <td style="font-weight: 700; color: #64748b;">Roll Number:</td>
                    <td style="font-weight: 600;">{{ $student->roll_no ?? '12' }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #64748b;">Father's Name:</td>
                    <td>{{ $student->father_name ?? 'Manoj Gupta' }}</td>
                    <td style="font-weight: 700; color: #64748b;">Mother's Name:</td>
                    <td>{{ $student->mother_name ?? 'Sunita Gupta' }}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #64748b;">Date of Birth:</td>
                    <td>{{ $student->dob ? \Carbon\Carbon::parse($student->dob)->format('d M, Y') : '18 Mar 2011' }}</td>
                    <td style="font-weight: 700; color: #64748b;">Attendance:</td>
                    <td><strong style="color: #047857;">{{ $attendancePercentage ?? '96.2%' }}</strong> ({{ $presentDays ?? '212' }}/{{ $workingDays ?? '220' }} Days)</td>
                </tr>
            </table>
        </div>

        <!-- Academic Performance Table -->
        <table class="marks-table">
            <thead>
                <tr>
                    <th style="width: 6%;" class="text-center">#</th>
                    <th style="width: 36%;">Subject Title</th>
                    <th style="width: 14%;" class="text-center">Max Marks</th>
                    <th style="width: 14%;" class="text-center">Min Pass</th>
                    <th style="width: 16%;" class="text-center">Marks Obtained</th>
                    <th style="width: 14%;" class="text-center">Grade</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $subjectMarks = $marksList ?? [
                        ['subject' => 'English Language & Literature', 'max' => 100, 'min' => 33, 'obtained' => 88, 'grade' => 'A2'],
                        ['subject' => 'Mathematics', 'max' => 100, 'min' => 33, 'obtained' => 94, 'grade' => 'A1'],
                        ['subject' => 'Science & Technology', 'max' => 100, 'min' => 33, 'obtained' => 91, 'grade' => 'A1'],
                        ['subject' => 'Social Sciences', 'max' => 100, 'min' => 33, 'obtained' => 86, 'grade' => 'A2'],
                        ['subject' => 'Hindi Course-A', 'max' => 100, 'min' => 33, 'obtained' => 82, 'grade' => 'A2'],
                        ['subject' => 'Computer Applications / IT', 'max' => 100, 'min' => 33, 'obtained' => 97, 'grade' => 'A1'],
                    ];
                    $grandTotal = 0;
                    $grandObtained = 0;
                @endphp
                @foreach($subjectMarks as $idx => $mark)
                    @php
                        $grandTotal += $mark['max'];
                        $grandObtained += $mark['obtained'];
                    @endphp
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td style="font-weight: 600;">{{ $mark['subject'] }}</td>
                        <td class="text-center">{{ $mark['max'] }}</td>
                        <td class="text-center">{{ $mark['min'] }}</td>
                        <td class="text-center" style="font-weight: 700; color: #0f172a;">{{ $mark['obtained'] }}</td>
                        <td class="text-center">
                            <span class="grade-badge">{{ $mark['grade'] }}</span>
                        </td>
                    </tr>
                @endforeach
                @php
                    $percentage = $grandTotal > 0 ? round(($grandObtained / $grandTotal) * 100, 2) : 0;
                @endphp
                <tr style="background: #f8fafc; font-weight: 800;">
                    <td colspan="2" class="text-right">Grand Total:</td>
                    <td class="text-center">{{ $grandTotal }}</td>
                    <td class="text-center">-</td>
                    <td class="text-center" style="color: #0369a1; font-size: 12px;">{{ $grandObtained }}</td>
                    <td class="text-center">
                        <span class="grade-badge" style="background: #0369a1; color: #fff; border-color: #0369a1;">
                            {{ $percentage >= 90 ? 'A1' : ($percentage >= 80 ? 'A2' : ($percentage >= 70 ? 'B1' : 'B2')) }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Summary Statistics Row -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 10px;">
            <tr>
                <td style="width: 25%;">
                    <div class="summary-card">
                        <div class="lbl">Total Marks</div>
                        <div class="val">{{ $grandObtained }} / {{ $grandTotal }}</div>
                    </div>
                </td>
                <td style="width: 25%;">
                    <div class="summary-card">
                        <div class="lbl">Percentage</div>
                        <div class="val" style="color: #047857;">{{ $percentage }}%</div>
                    </div>
                </td>
                <td style="width: 25%;">
                    <div class="summary-card">
                        <div class="lbl">Overall Result</div>
                        <div class="val" style="color: #15803d; font-size: 13px;">PASSED & PROMOTED</div>
                    </div>
                </td>
                <td style="width: 25%;">
                    <div class="summary-card">
                        <div class="lbl">Class Position</div>
                        <div class="val">{{ $classRank ?? '2nd' }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Grading Legend & Remarks -->
        <div class="grading-scale">
            <strong>Grading Scale:</strong> A1 (91-100%), A2 (81-90%), B1 (71-80%), B2 (61-70%), C1 (51-60%), C2 (41-50%), D (33-40% - Pass), E (&lt;33% - Needs Improvement).
            <div style="margin-top: 4px; color: #1e293b;">
                <strong>Class Teacher's Remarks:</strong> <em>"Outstanding academic performance. Demonstrates sharp analytical skills and disciplined classroom engagement."</em>
            </div>
        </div>

        <!-- Signatures Table -->
        <table class="signatures-table">
            <tr>
                <td style="width: 33%;">
                    <div class="sign-line">Class Teacher</div>
                </td>
                <td style="width: 34%;">
                    <div class="sign-line">Examination Controller</div>
                </td>
                <td style="width: 33%;">
                    <div class="sign-line">Principal & Seal</div>
                </td>
            </tr>
        </table>

        <div class="footer-note">
            Official Academic Progress Report issued by LearnaZ ERP. Alteration of this document renders it null and void.
        </div>

    </div>

</body>
</html>
