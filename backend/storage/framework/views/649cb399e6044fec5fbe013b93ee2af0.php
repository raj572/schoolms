<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transfer Certificate - <?php echo e($student->candidate_name ?? 'Student'); ?></title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', Times, serif;
            color: #111827;
            background: #f8fafc;
            font-size: 13px;
            line-height: 1.6;
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
        .btn-download { background: #b45309; color: #fff; }

        .tc-container {
            max-width: 820px;
            margin: 20px auto;
            background: #ffffff;
            padding: 40px 48px;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 3px double #78350f;
            position: relative;
        }

        <?php if($isPdf ?? false): ?>
        body { background: #fff; }
        .tc-container { margin: 0; padding: 24px 30px; box-shadow: none; border: 3px double #78350f; max-width: 100%; }
        .action-bar { display: none !important; }
        <?php endif; ?>

        @media print {
            body { background: #fff; }
            .action-bar { display: none !important; }
            .tc-container { margin: 0; padding: 24px 30px; box-shadow: none; max-width: 100%; border: 3px double #78350f; }
        }

        .school-header {
            text-align: center;
            border-bottom: 2px solid #78350f;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }
        .school-title { font-size: 24px; font-weight: 800; color: #78350f; text-transform: uppercase; letter-spacing: 0.5px; }
        .school-affil { font-size: 12px; color: #374151; font-weight: bold; margin-top: 4px; }
        .school-address { font-size: 11px; color: #4b5563; margin-top: 2px; }

        .doc-title-bar { text-align: center; margin: 12px 0 16px 0; }
        .doc-title {
            display: inline-block;
            font-size: 16px;
            font-weight: 800;
            color: #78350f;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 2px solid #78350f;
            padding-bottom: 2px;
        }

        .tc-meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 14px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
        }

        table.fields-table {
            width: 100%;
            border-collapse: collapse;
        }
        table.fields-table td {
            padding: 5px 4px;
            font-size: 12.5px;
            vertical-align: top;
        }
        .field-num { width: 5%; font-weight: bold; }
        .field-label { width: 45%; color: #374151; }
        .field-dots { width: 3%; text-align: center; }
        .field-val { width: 47%; font-weight: bold; color: #111827; border-bottom: 1px dotted #9ca3af; }

        .signatures-table {
            width: 100%;
            margin-top: 40px;
            border-collapse: collapse;
        }
        .signatures-table td {
            text-align: center;
            vertical-align: bottom;
            font-size: 12px;
            font-weight: bold;
            color: #374151;
            padding-top: 35px;
        }
        .sign-line {
            display: inline-block;
            width: 160px;
            border-top: 1px solid #111827;
            padding-top: 4px;
        }

        .footer-note {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
        }
    </style>
</head>
<body>

    <?php if(!($isPdf ?? false) && !request()->has('embed')): ?>
    <div class="action-bar">
        <div class="brand">LEARNAZ SCHOOL ERP • School Transfer Certificate</div>
        <div class="btn-group">
            <button onclick="window.print()" class="btn btn-print">🖨️ Print Certificate</button>
            <a href="?download=pdf" class="btn btn-download">⬇️ Download PDF</a>
        </div>
    </div>
    <?php endif; ?>

    <div class="tc-container">

        <!-- Header -->
        <div class="school-header">
            <div class="school-title"><?php echo e($school->name ?? 'Demo International School'); ?></div>
            <div class="school-affil">
                Affiliated to <?php echo e($school->board ?? 'CBSE'); ?> • Affiliation No: <?php echo e($school->affiliation_number ?? 'AFF-2026-9812'); ?> • School Code: <?php echo e($school->school_code ?? 'SCH-0102'); ?>

            </div>
            <div class="school-address">
                <?php echo e($school->address ?? 'Station Road, Campus Area'); ?>, <?php echo e($school->city ?? 'Central District'); ?>, <?php echo e($school->state ?? ''); ?> | Phone: <?php echo e($school->phone ?? '+91 9876543210'); ?>

            </div>
        </div>

        <div class="doc-title-bar">
            <div class="doc-title">Transfer Certificate</div>
            <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">(Recognized by the Department of Education)</div>
        </div>

        <div class="tc-meta-row">
            <div>Book No: <strong>01</strong></div>
            <div>SI. No: <strong style="color: #78350f;"><?php echo e($tcNumber ?? 'TC/2026/048'); ?></strong></div>
            <div>Admission No: <strong><?php echo e($student->roll_no ? 'ADM-' . $student->roll_no : 'ADM-2026-104'); ?></strong></div>
        </div>

        <!-- Serialized Statutory Fields -->
        <table class="fields-table">
            <tr>
                <td class="field-num">1.</td>
                <td class="field-label">Name of the Pupil</td>
                <td class="field-dots">:</td>
                <td class="field-val" style="color: #78350f;"><?php echo e(strtoupper($student->candidate_name ?? 'AARAV SHARMA')); ?></td>
            </tr>
            <tr>
                <td class="field-num">2.</td>
                <td class="field-label">Mother's Name</td>
                <td class="field-dots">:</td>
                <td class="field-val"><?php echo e(strtoupper($student->mother_name ?? 'SUNITA SHARMA')); ?></td>
            </tr>
            <tr>
                <td class="field-num">3.</td>
                <td class="field-label">Father's / Guardian's Name</td>
                <td class="field-dots">:</td>
                <td class="field-val"><?php echo e(strtoupper($student->father_name ?? 'RAJESH SHARMA')); ?></td>
            </tr>
            <tr>
                <td class="field-num">4.</td>
                <td class="field-label">Nationality</td>
                <td class="field-dots">:</td>
                <td class="field-val">INDIAN</td>
            </tr>
            <tr>
                <td class="field-num">5.</td>
                <td class="field-label">Whether candidate belongs to SC / ST / OBC / General</td>
                <td class="field-dots">:</td>
                <td class="field-val"><?php echo e($category ?? 'GENERAL'); ?></td>
            </tr>
            <tr>
                <td class="field-num">6.</td>
                <td class="field-label">Date of first admission in the school with class</td>
                <td class="field-dots">:</td>
                <td class="field-val">
                    <?php echo e($student->admission_date ? \Carbon\Carbon::parse($student->admission_date)->format('d-m-Y') : '05-04-2022'); ?> (Class 6)
                </td>
            </tr>
            <tr>
                <td class="field-num">7.</td>
                <td class="field-label">Date of Birth (according to Admission Register)</td>
                <td class="field-dots">:</td>
                <td class="field-val">
                    <?php echo e($student->dob ? \Carbon\Carbon::parse($student->dob)->format('d-m-Y') : '14-08-2011'); ?>

                    <span style="font-size: 11px; font-weight: normal; color: #4b5563;">(<?php echo e($dobInWords ?? 'Fourteenth August Two Thousand Eleven'); ?>)</span>
                </td>
            </tr>
            <tr>
                <td class="field-num">8.</td>
                <td class="field-label">Class in which the pupil last studied</td>
                <td class="field-dots">:</td>
                <td class="field-val">CLASS 10 (TENTH)</td>
            </tr>
            <tr>
                <td class="field-num">9.</td>
                <td class="field-label">School / Board Annual Examination last taken with result</td>
                <td class="field-dots">:</td>
                <td class="field-val">ANNUAL EXAMINATION (PASSED)</td>
            </tr>
            <tr>
                <td class="field-num">10.</td>
                <td class="field-label">Whether failed, if so once / twice in same class</td>
                <td class="field-dots">:</td>
                <td class="field-val">NO</td>
            </tr>
            <tr>
                <td class="field-num">11.</td>
                <td class="field-label">Subjects Studied</td>
                <td class="field-dots">:</td>
                <td class="field-val">English, Mathematics, Science, Social Science, Hindi, Computer</td>
            </tr>
            <tr>
                <td class="field-num">12.</td>
                <td class="field-label">Whether qualified for promotion to higher class</td>
                <td class="field-dots">:</td>
                <td class="field-val">YES, PROMOTED TO CLASS 11 (ELEVENTH)</td>
            </tr>
            <tr>
                <td class="field-num">13.</td>
                <td class="field-label">Month up to which the pupil has paid school dues</td>
                <td class="field-dots">:</td>
                <td class="field-val">MARCH 2026 (ALL DUES CLEARED)</td>
            </tr>
            <tr>
                <td class="field-num">14.</td>
                <td class="field-label">Any fee concession availed of, if so the nature</td>
                <td class="field-dots">:</td>
                <td class="field-val">NO</td>
            </tr>
            <tr>
                <td class="field-num">15.</td>
                <td class="field-label">Total No. of working days in the academic session</td>
                <td class="field-dots">:</td>
                <td class="field-val">224 DAYS</td>
            </tr>
            <tr>
                <td class="field-num">16.</td>
                <td class="field-label">Total No. of working days pupil was present</td>
                <td class="field-dots">:</td>
                <td class="field-val">214 DAYS</td>
            </tr>
            <tr>
                <td class="field-num">17.</td>
                <td class="field-label">General Conduct / Character</td>
                <td class="field-dots">:</td>
                <td class="field-val" style="color: #047857;">EXEMPLARY / VERY GOOD</td>
            </tr>
            <tr>
                <td class="field-num">18.</td>
                <td class="field-label">Date of application for certificate</td>
                <td class="field-dots">:</td>
                <td class="field-val"><?php echo e(date('d-m-Y', strtotime('-3 days'))); ?></td>
            </tr>
            <tr>
                <td class="field-num">19.</td>
                <td class="field-label">Date of issue of certificate</td>
                <td class="field-dots">:</td>
                <td class="field-val"><?php echo e(date('d-m-Y')); ?></td>
            </tr>
            <tr>
                <td class="field-num">20.</td>
                <td class="field-label">Reason for leaving the school</td>
                <td class="field-dots">:</td>
                <td class="field-val">COMPLETED CLASS 10 / PARENTAL RELOCATION</td>
            </tr>
        </table>

        <!-- Signatures Table -->
        <table class="signatures-table">
            <tr>
                <td style="width: 33%;">
                    <div class="sign-line">Class Teacher</div>
                </td>
                <td style="width: 34%;">
                    <div class="sign-line">Checked by (Clerk / Incharge)</div>
                </td>
                <td style="width: 33%;">
                    <div class="sign-line">Principal & Official Seal</div>
                </td>
            </tr>
        </table>

        <div class="footer-note">
            Official Transfer Certificate registered with the Education Department.
        </div>

    </div>

</body>
</html>
<?php /**PATH D:\Projects\school Management Software\backend\resources\views\documents\transfer-certificate.blade.php ENDPATH**/ ?>