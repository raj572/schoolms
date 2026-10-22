<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admission Receipt - {{ $admissionNumber ?? 'ADM-2026-001' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            background: #f3f4f6;
            font-size: 12px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .action-bar {
            background: #111827;
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
        .btn-print { background: #374151; color: #fff; }
        .btn-download { background: #10b981; color: #fff; }

        .receipt-container {
            max-width: 820px;
            margin: 24px auto;
            background: #ffffff;
            padding: 32px 38px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
            position: relative;
        }

        @if($isPdf ?? false)
        body { background: #fff; }
        .receipt-container { margin: 0; padding: 20px; box-shadow: none; border: none; max-width: 100%; }
        .action-bar { display: none !important; }
        @endif

        @media print {
            body { background: #fff; }
            .action-bar { display: none !important; }
            .receipt-container { margin: 0; padding: 20px; box-shadow: none; border: none; max-width: 100%; }
        }

        table.full-width { width: 100%; border-collapse: collapse; }
        table.full-width td { vertical-align: top; }

        .school-header { text-align: center; border-bottom: 2px double #0f766e; padding-bottom: 12px; margin-bottom: 14px; }
        .school-name { font-size: 22px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 0.5px; }
        .school-sub { font-size: 11px; color: #4b5563; margin-top: 3px; }
        .school-contact { font-size: 11px; color: #6b7280; margin-top: 2px; }

        .doc-title-bar { text-align: center; margin: 12px 0 16px 0; }
        .doc-title {
            display: inline-block;
            background: #0f766e;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 20px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .copy-type { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-top: 4px; }

        .section-header {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            background: #f0fdfa;
            color: #0f766e;
            padding: 6px 10px;
            border-left: 3px solid #0f766e;
            margin: 14px 0 8px 0;
            letter-spacing: 0.5px;
        }

        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .info-grid td {
            font-size: 11px;
            padding: 5px 8px;
            border-bottom: 1px solid #f1f5f9;
        }
        .info-label {
            width: 22%;
            color: #64748b;
            font-weight: 700;
        }
        .info-val {
            width: 28%;
            color: #0f172a;
            font-weight: 600;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
        }
        .items-table th {
            background: #f8fafc;
            color: #334155;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            text-align: left;
        }
        .items-table td {
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            font-size: 11px;
        }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }

        .words-box {
            background: #f8fafc;
            border-left: 3px solid #0f766e;
            padding: 8px 12px;
            font-size: 11px;
            margin-top: 8px;
        }

        .signatures-table {
            width: 100%;
            margin-top: 36px;
            border-collapse: collapse;
        }
        .signatures-table td {
            text-align: center;
            vertical-align: bottom;
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            padding-top: 30px;
        }
        .sign-line {
            display: inline-block;
            width: 160px;
            border-top: 1px dashed #6b7280;
            padding-top: 5px;
        }

        .footer-note {
            margin-top: 22px;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
        }
    </style>
</head>
<body>

    @if(!($isPdf ?? false) && !request()->has('embed'))
    <div class="action-bar">
        <div class="brand">LEARNAZ SCHOOL ERP • Admission Receipt</div>
        <div class="btn-group">
            <button onclick="window.print()" class="btn btn-print">🖨️ Print Receipt</button>
            <a href="?download=pdf" class="btn btn-download">⬇️ Download PDF</a>
        </div>
    </div>
    @endif

    <div class="receipt-container">

        <!-- School Header -->
        <div class="school-header">
            <div class="school-name">{{ $school->name ?? 'Demo International School' }}</div>
            <div class="school-sub">
                Affiliation No: {{ $school->affiliation_number ?? 'AFF-2026-9812' }} • School Code: {{ $school->school_code ?? 'SCH-0102' }} • Board: {{ $school->board ?? 'CBSE' }}
            </div>
            <div class="school-contact">
                {{ $school->address ?? 'Station Road, Campus Area' }}, {{ $school->city ?? 'Central District' }}, {{ $school->state ?? '' }} | Phone: {{ $school->phone ?? '+91 9876543210' }} | Email: {{ $school->email ?? 'admissions@school.edu' }}
            </div>
        </div>

        <!-- Document Title -->
        <div class="doc-title-bar">
            <div class="doc-title">Admission & Enrollment Fee Receipt</div>
            <div class="copy-type">Academic Session: {{ $session ?? '2026-2027' }} • [Official School Copy]</div>
        </div>

        <!-- 1. Admission & Student Particulars -->
        <div class="section-header">1. Student Enrollment Details</div>
        <table class="info-grid">
            <tr>
                <td class="info-label">Admission / Scholar No:</td>
                <td class="info-val" style="color: #0f766e; font-weight: 800;">{{ $admissionNumber ?? ($student->roll_no ? 'ADM-2026-' . $student->roll_no : 'ADM-2026-104') }}</td>
                <td class="info-label">Admission Date:</td>
                <td class="info-val">{{ $student->admission_date ? \Carbon\Carbon::parse($student->admission_date)->format('d M, Y') : date('d M, Y') }}</td>
            </tr>
            <tr>
                <td class="info-label">Candidate Full Name:</td>
                <td class="info-val">{{ $student->candidate_name ?? 'Ananya Verma' }}</td>
                <td class="info-label">Gender / DOB:</td>
                <td class="info-val">
                    {{ ucfirst($student->gender ?? 'Female') }} /
                    {{ $student->dob ? \Carbon\Carbon::parse($student->dob)->format('d M Y') : '14 Aug 2012' }}
                </td>
            </tr>
            <tr>
                <td class="info-label">Class Admitted:</td>
                <td class="info-val">Class {{ $student->class ?? '6' }} (Section {{ $student->section ?? 'A' }})</td>
                <td class="info-label">Aadhaar / ID No:</td>
                <td class="info-val" style="font-family: monospace;">{{ $student->addhar ?? 'XXXX-XXXX-4812' }}</td>
            </tr>
        </table>

        <!-- 2. Parents / Guardian Info -->
        <div class="section-header">2. Parent / Guardian Particulars</div>
        <table class="info-grid">
            <tr>
                <td class="info-label">Father's Name:</td>
                <td class="info-val">{{ $student->father_name ?? 'Vikram Verma' }}</td>
                <td class="info-label">Mother's Name:</td>
                <td class="info-val">{{ $student->mother_name ?? 'Pooja Verma' }}</td>
            </tr>
            <tr>
                <td class="info-label">Contact Mobile:</td>
                <td class="info-val">{{ $student->phone ?? '+91 9811223344' }}</td>
                <td class="info-label">Email Address:</td>
                <td class="info-val">{{ $student->email ?? 'parent@example.com' }}</td>
            </tr>
            <tr>
                <td class="info-label">Residential Address:</td>
                <td class="info-val" colspan="3">{{ $student->address ?? 'Flat 402, Royal Palms, Civil Lines, Central District' }}</td>
            </tr>
        </table>

        <!-- 3. Admission Fee Particulars -->
        <div class="section-header">3. Admission Fee Payment Details</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 8%;" class="text-center">S.No</th>
                    <th style="width: 62%;">Fee Description / Component</th>
                    <th style="width: 30%;" class="text-right">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $admissionItems = $admissionFeeItems ?? [
                        ['name' => 'Registration & Processing Fee', 'amount' => 1000],
                        ['name' => 'One-time Admission Fee', 'amount' => 10000],
                        ['name' => 'Security Deposit / Caution Money (Refundable)', 'amount' => 3000],
                        ['name' => 'Annual Infrastructure & Development Fund', 'amount' => 4000],
                        ['name' => 'First Installment / Composite Tuition Fee', 'amount' => 3500],
                    ];
                    $subtotal = 0;
                @endphp
                @foreach($admissionItems as $idx => $item)
                    @php $subtotal += $item['amount']; @endphp
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td style="font-weight: 600;">{{ $item['name'] }}</td>
                        <td class="text-right" style="font-weight: 600;">{{ number_format($item['amount'], 2) }}</td>
                    </tr>
                @endforeach
                <tr style="background: #f0fdfa; font-weight: 800;">
                    <td colspan="2" class="text-right" style="font-size: 12px; text-transform: uppercase;">Total Admission Fees Paid:</td>
                    <td class="text-right" style="color: #0f766e; font-size: 14px;">₹{{ number_format($subtotal, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="words-box">
            <strong>Amount in Words:</strong>
            <span style="font-style: italic; color: #0f766e;">
                {{ $amountInWords ?? 'Twenty-One Thousand Five Hundred Rupees Only' }}
            </span>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
                Payment Mode: <strong>{{ $paymentMode ?? 'Online / Bank Transfer' }}</strong> | Transaction Ref: <strong style="font-family: monospace;">{{ $txnRef ?? 'ADM_TXN_' . strtoupper(uniqid()) }}</strong>
            </div>
        </div>

        <!-- Signatures Table -->
        <table class="signatures-table">
            <tr>
                <td style="width: 33%;">
                    <div class="sign-line">Parent / Guardian Signature</div>
                </td>
                <td style="width: 34%;">
                    <div class="sign-line">Admission Incharge</div>
                </td>
                <td style="width: 33%;">
                    <div class="sign-line">Principal / Seal</div>
                </td>
            </tr>
        </table>

        <div class="footer-note">
            This certifies that the candidate has completed all admission formalities and is officially enrolled in the institution.
        </div>

    </div>

</body>
</html>
