<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bonafide Certificate - {{ $student->candidate_name ?? 'Student' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111827;
            background: #f8fafc;
            font-size: 14px;
            line-height: 1.8;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .action-bar {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
        .btn-download { background: #1e3a8a; color: #fff; }

        .cert-container {
            max-width: 820px;
            margin: 24px auto;
            background: #ffffff;
            padding: 48px 56px;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 2px solid #1e3a8a;
            position: relative;
        }

        @if($isPdf ?? false)
        body { background: #fff; }
        .cert-container { margin: 0; padding: 30px 40px; box-shadow: none; border: 2px solid #1e3a8a; max-width: 100%; }
        .action-bar { display: none !important; }
        @endif

        @media print {
            body { background: #fff; }
            .action-bar { display: none !important; }
            .cert-container { margin: 0; padding: 30px 40px; box-shadow: none; max-width: 100%; border: 2px solid #1e3a8a; }
        }

        .school-header {
            text-align: center;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .school-title { font-size: 26px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; }
        .school-affil { font-size: 12px; color: #374151; font-weight: bold; margin-top: 4px; }
        .school-address { font-size: 11px; color: #4b5563; margin-top: 2px; }

        .cert-meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 24px;
            color: #374151;
        }

        .doc-title-bar { text-align: center; margin: 18px 0 28px 0; }
        .doc-title {
            display: inline-block;
            font-size: 18px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 4px;
        }

        .cert-body {
            text-align: justify;
            font-size: 15px;
            line-height: 2.1;
            color: #111827;
            margin-bottom: 30px;
        }
        .highlight {
            font-weight: bold;
            color: #1e3a8a;
            border-bottom: 1px dotted #94a3b8;
            padding: 0 4px;
        }

        .signatures-table {
            width: 100%;
            margin-top: 60px;
            border-collapse: collapse;
        }
        .signatures-table td {
            text-align: center;
            vertical-align: bottom;
            font-size: 13px;
            font-weight: bold;
            color: #1f2937;
            padding-top: 40px;
        }
        .sign-line {
            display: inline-block;
            width: 180px;
            border-top: 1px solid #111827;
            padding-top: 5px;
        }

        .footer-note {
            margin-top: 36px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
        }
    </style>
</head>
<body>

    @if(!($isPdf ?? false) && !request()->has('embed'))
    <div class="action-bar">
        <div class="brand">LEARNAZ SCHOOL ERP • Bonafide Certificate</div>
        <div class="btn-group">
            <button onclick="window.print()" class="btn btn-print">🖨️ Print Certificate</button>
            <a href="?download=pdf" class="btn btn-download">⬇️ Download PDF</a>
        </div>
    </div>
    @endif

    <div class="cert-container">

        <!-- School Letterhead Header -->
        <div class="school-header">
            <div class="school-title">{{ $school->name ?? 'Demo International School' }}</div>
            <div class="school-affil">
                Affiliated to {{ $school->board ?? 'CBSE' }} • Affiliation No: {{ $school->affiliation_number ?? 'AFF-2026-9812' }} • School Code: {{ $school->school_code ?? 'SCH-0102' }}
            </div>
            <div class="school-address">
                {{ $school->address ?? 'Station Road, Campus Area' }}, {{ $school->city ?? 'Central District' }}, {{ $school->state ?? '' }} | Phone: {{ $school->phone ?? '+91 9876543210' }} | Email: {{ $school->email ?? 'info@school.edu' }}
            </div>
        </div>

        <div class="cert-meta-row">
            <div>Ref. No: <strong style="color: #1e3a8a;">{{ $refNumber ?? 'CERT/BONA/2026/089' }}</strong></div>
            <div>Date of Issue: <strong>{{ date('d F, Y') }}</strong></div>
        </div>

        <div class="doc-title-bar">
            <div class="doc-title">Bonafide & Character Certificate</div>
        </div>

        <!-- Certificate Declaration Body -->
        <div class="cert-body">
            This is to certify that Master / Miss <span class="highlight">{{ strtoupper($student->candidate_name ?? 'AARAV SHARMA') }}</span>,
            Son / Daughter of Shri <span class="highlight">{{ strtoupper($student->father_name ?? 'RAJESH SHARMA') }}</span>
            and Smt. <span class="highlight">{{ strtoupper($student->mother_name ?? 'SUNITA SHARMA') }}</span>,
            is a regular and bonafide student of this institution, studying in
            <span class="highlight">Class {{ $student->class ?? '10' }} (Section {{ $student->section ?? 'A' }})</span>,
            bearing Roll Number <span class="highlight">{{ $student->roll_no ?? '18' }}</span>
            and Admission / Scholar Number <span class="highlight">{{ $student->roll_no ? 'ADM-' . $student->roll_no : 'ADM-2026-104' }}</span>,
            for the Academic Session <span class="highlight">{{ $session ?? '2026 - 2027' }}</span>.
            <br><br>
            As per the official records of the school, his / her Date of Birth is
            <span class="highlight">{{ $student->dob ? \Carbon\Carbon::parse($student->dob)->format('d F Y') : '14 August 2011' }}</span>.
            <br><br>
            To the best of our knowledge and belief, he / she bears a <strong style="color: #047857;">Good Moral Character</strong>, demonstrates regular attendance, and has shown exemplary discipline throughout his / her tenure at the school.
            <br><br>
            This certificate is issued upon the formal request of the candidate's parent for the purpose of
            <strong>{{ $purpose ?? 'Official Documentation / Passport / Academic Verification' }}</strong>.
            We wish him / her all the very best in all future academic pursuits.
        </div>

        <!-- Signatures Table -->
        <table class="signatures-table">
            <tr>
                <td style="width: 50%;">
                    <div class="sign-line">Office Superintendent / Incharge</div>
                </td>
                <td style="width: 50%;">
                    <div class="sign-line">Principal & Official Seal</div>
                </td>
            </tr>
        </table>

        <div class="footer-note">
            LearnaZ School ERP Automated Certificate Verification System. Alteration invalidates this certificate.
        </div>

    </div>

</body>
</html>
