<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Identity Card - {{ $student->candidate_name ?? 'Student' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #f1f5f9;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .action-bar {
            max-width: 720px;
            margin: 0 auto 20px auto;
            background: #0f172a;
            color: #fff;
            padding: 10px 20px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .action-bar .brand { font-weight: 700; font-size: 14px; }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            font-size: 12px;
            font-weight: 600;
            border-radius: 4px;
            text-decoration: none;
            cursor: pointer;
            border: none;
            background: #3b82f6;
            color: #fff;
        }

        .cards-wrapper {
            display: flex;
            gap: 30px;
            justify-content: center;
            align-items: flex-start;
            flex-wrap: wrap;
        }

        /* Standard CR80 Vertical ID Card: 240px x 380px (~54mm x 85.6mm) */
        .id-card {
            width: 250px;
            height: 390px;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 1px solid #cbd5e1;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        @if($isPdf ?? false)
        body { background: #fff; padding: 10px; }
        .action-bar { display: none !important; }
        @endif

        @media print {
            body { background: #fff; padding: 0; }
            .action-bar { display: none !important; }
            .id-card { box-shadow: none; border: 1px solid #94a3b8; }
        }

        /* FRONT CARD */
        .card-header-front {
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            color: #ffffff;
            text-align: center;
            padding: 12px 10px 8px 10px;
        }
        .school-logo-text { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .school-tagline { font-size: 8px; opacity: 0.85; margin-top: 2px; }

        .photo-wrap {
            text-align: center;
            margin: 10px 0 6px 0;
        }
        .student-photo {
            width: 78px;
            height: 90px;
            border-radius: 6px;
            border: 2px solid #2563eb;
            background: #e2e8f0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #64748b;
            font-weight: bold;
        }

        .student-name-front {
            text-align: center;
            font-size: 14px;
            font-weight: 800;
            color: #1e3a8a;
            margin-bottom: 2px;
            padding: 0 8px;
            text-transform: uppercase;
        }
        .student-role-badge {
            text-align: center;
            margin-bottom: 8px;
        }
        .badge-pill {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            font-size: 9px;
            font-weight: 700;
            padding: 2px 10px;
            border-radius: 12px;
            text-transform: uppercase;
        }

        .details-grid {
            padding: 0 16px;
            font-size: 10px;
        }
        .details-grid table { width: 100%; border-collapse: collapse; }
        .details-grid td { padding: 2px 0; }
        .lbl { color: #64748b; font-weight: 700; width: 42%; }
        .val { color: #0f172a; font-weight: 700; }

        .card-footer-front {
            background: #1e3a8a;
            color: #ffffff;
            text-align: center;
            padding: 5px;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        /* BACK CARD */
        .card-header-back {
            background: #1e293b;
            color: #ffffff;
            text-align: center;
            padding: 10px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .back-body {
            padding: 12px 16px;
            font-size: 9.5px;
            color: #334155;
            line-height: 1.5;
        }

        .qr-placeholder {
            width: 60px;
            height: 60px;
            background: #f8fafc;
            border: 1px dashed #94a3b8;
            margin: 10px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #64748b;
        }

        .sign-box-back {
            text-align: center;
            margin-top: 14px;
        }
        .sign-line-back {
            display: inline-block;
            width: 120px;
            border-top: 1px solid #64748b;
            padding-top: 2px;
            font-size: 9px;
            font-weight: bold;
            color: #0f172a;
        }

        .card-footer-back {
            background: #f1f5f9;
            border-top: 1px solid #e2e8f0;
            padding: 6px 10px;
            text-align: center;
            font-size: 7.5px;
            color: #64748b;
        }
    </style>
</head>
<body>

    @if(!($isPdf ?? false) && !request()->has('embed'))
    <div class="action-bar">
        <div class="brand">LEARNAZ SCHOOL ERP • Student Identity Card</div>
        <div>
            <button onclick="window.print()" class="btn">🖨️ Print ID Badge</button>
        </div>
    </div>
    @endif

    <div class="cards-wrapper">

        <!-- FRONT SIDE -->
        <div class="id-card">
            <div>
                <div class="card-header-front">
                    <div class="school-logo-text">{{ $school->name ?? 'Demo International School' }}</div>
                    <div class="school-tagline">Excellence in Education • Affil No: {{ $school->affiliation_number ?? 'AFF-2026' }}</div>
                </div>

                <div class="photo-wrap">
                    <div class="student-photo">PHOTO</div>
                </div>

                <div class="student-name-front">{{ $student->candidate_name ?? 'Aarav Sharma' }}</div>
                <div class="student-role-badge">
                    <span class="badge-pill">Student • Class {{ $student->class ?? '10' }}-{{ $student->section ?? 'A' }}</span>
                </div>

                <div class="details-grid">
                    <table>
                        <tr>
                            <td class="lbl">Roll No:</td>
                            <td class="val">{{ $student->roll_no ?? '18' }}</td>
                        </tr>
                        <tr>
                            <td class="lbl">Admission No:</td>
                            <td class="val">{{ $student->roll_no ? 'ADM-' . $student->roll_no : 'ADM-2026-104' }}</td>
                        </tr>
                        <tr>
                            <td class="lbl">Date of Birth:</td>
                            <td class="val">{{ $student->dob ? \Carbon\Carbon::parse($student->dob)->format('d/m/Y') : '14/08/2011' }}</td>
                        </tr>
                        <tr>
                            <td class="lbl">Blood Group:</td>
                            <td class="val" style="color: #dc2626;">{{ $bloodGroup ?? 'B+' }}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="card-footer-front">
                ACADEMIC SESSION: {{ $session ?? '2026 - 2027' }}
            </div>
        </div>

        <!-- BACK SIDE -->
        <div class="id-card">
            <div>
                <div class="card-header-back">
                    Student Details & Instructions
                </div>

                <div class="back-body">
                    <div><strong>Father:</strong> {{ $student->father_name ?? 'Rajesh Sharma' }}</div>
                    <div><strong>Emergency Contact:</strong> {{ $student->phone ?? '+91 9876543210' }}</div>
                    <div style="margin-top: 4px;">
                        <strong>Address:</strong><br>
                        {{ $student->address ?? 'Civil Lines, Campus Road, Central District' }}
                    </div>

                    <div class="qr-placeholder">
                        QR CODE<br>VERIFY
                    </div>

                    <div class="sign-box-back">
                        <div class="sign-line-back">Principal's Signature</div>
                    </div>
                </div>
            </div>

            <div class="card-footer-back">
                This card is non-transferable. If found, please return to {{ $school->name ?? 'the school' }}. Phone: {{ $school->phone ?? '+91 9876543210' }}.
            </div>
        </div>

    </div>

</body>
</html>
