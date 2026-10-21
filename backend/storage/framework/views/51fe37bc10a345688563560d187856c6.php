<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admit Card - <?php echo e($student->candidate_name ?? 'Candidate'); ?></title>
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
        .btn-download { background: #b91c1c; color: #fff; }

        .admit-card-container {
            max-width: 800px;
            margin: 20px auto;
            background: #ffffff;
            padding: 26px 32px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.06);
            border: 2px solid #b91c1c;
            position: relative;
        }

        <?php if($isPdf ?? false): ?>
        body { background: #fff; }
        .admit-card-container { margin: 0; padding: 16px; box-shadow: none; border: 2px solid #b91c1c; max-width: 100%; }
        .action-bar { display: none !important; }
        <?php endif; ?>

        @media print {
            body { background: #fff; }
            .action-bar { display: none !important; }
            .admit-card-container { margin: 0; padding: 16px; box-shadow: none; max-width: 100%; border: 2px solid #b91c1c; }
        }

        table.full-width { width: 100%; border-collapse: collapse; }
        table.full-width td { vertical-align: top; }

        .school-header {
            text-align: center;
            border-bottom: 2px solid #b91c1c;
            padding-bottom: 10px;
            margin-bottom: 12px;
        }
        .school-title { font-size: 20px; font-weight: 800; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; }
        .school-affil { font-size: 10px; color: #475569; font-weight: 600; margin-top: 2px; }

        .doc-badge-bar { text-align: center; margin: 8px 0 14px 0; }
        .doc-badge {
            display: inline-block;
            background: #b91c1c;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 18px;
            border-radius: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .exam-title {
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 4px;
        }

        .candidate-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
        }
        .candidate-table td {
            font-size: 11px;
            padding: 5px 8px;
            border: 1px solid #e2e8f0;
        }
        .candidate-label { width: 18%; font-weight: 700; color: #64748b; }
        .candidate-val { width: 32%; font-weight: 600; color: #0f172a; }

        .photo-box {
            width: 95px;
            height: 115px;
            border: 1px dashed #94a3b8;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            margin: auto;
        }

        .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        .schedule-table th {
            background: #fee2e2;
            color: #991b1b;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            padding: 7px 8px;
            border: 1px solid #f87171;
            text-align: left;
        }
        .schedule-table td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            font-size: 10.5px;
        }
        .text-center { text-align: center !important; }

        .instructions-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 14px;
            font-size: 9.5px;
            color: #7f1d1d;
            line-height: 1.5;
        }
        .instructions-box ul { padding-left: 14px; margin-top: 3px; }

        .signatures-table {
            width: 100%;
            margin-top: 24px;
            border-collapse: collapse;
        }
        .signatures-table td {
            text-align: center;
            vertical-align: bottom;
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            padding-top: 25px;
        }
        .sign-line {
            display: inline-block;
            width: 150px;
            border-top: 1px dashed #64748b;
            padding-top: 4px;
        }

        .footer-note {
            margin-top: 16px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <?php if(!($isPdf ?? false)): ?>
    <div class="action-bar">
        <div class="brand">LEARNAZ SCHOOL ERP • Examination Admit Card</div>
        <div class="btn-group">
            <button onclick="window.print()" class="btn btn-print">🖨️ Print Admit Card</button>
            <a href="?download=pdf" class="btn btn-download">⬇️ Download PDF</a>
        </div>
    </div>
    <?php endif; ?>

    <div class="admit-card-container">

        <!-- Header -->
        <div class="school-header">
            <div class="school-title"><?php echo e($school->name ?? 'Demo International School'); ?></div>
            <div class="school-affil">
                Affiliated to <?php echo e($school->board ?? 'CBSE'); ?> • School Code: <?php echo e($school->school_code ?? 'SCH-0102'); ?> • Affiliation No: <?php echo e($school->affiliation_number ?? 'AFF-2026-9812'); ?>

            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                <?php echo e($school->address ?? 'Station Road, Campus Area'); ?>, <?php echo e($school->city ?? 'Central District'); ?>

            </div>
        </div>

        <!-- Title -->
        <div class="doc-badge-bar">
            <div class="doc-badge">Official Examination Admit Card</div>
            <div class="exam-title"><?php echo e($examName ?? 'Annual Examination - 2026'); ?> • Hall Ticket</div>
        </div>

        <!-- Candidate Particulars with Photo Box -->
        <table class="full-width" style="margin-bottom: 12px;">
            <tr>
                <td style="width: 78%; padding-right: 12px;">
                    <table class="candidate-table">
                        <tr>
                            <td class="candidate-label">Candidate Name:</td>
                            <td class="candidate-val" style="color: #b91c1c; font-weight: 800;"><?php echo e($student->candidate_name ?? 'Aarav Sharma'); ?></td>
                            <td class="candidate-label">Roll Number:</td>
                            <td class="candidate-val" style="font-weight: 800; font-size: 12px;"><?php echo e($student->roll_no ?? '18'); ?></td>
                        </tr>
                        <tr>
                            <td class="candidate-label">Class & Section:</td>
                            <td class="candidate-val">Class <?php echo e($student->class ?? '10'); ?> (<?php echo e($student->section ?? 'A'); ?>)</td>
                            <td class="candidate-label">Admission No:</td>
                            <td class="candidate-val"><?php echo e($student->roll_no ? 'ADM-' . $student->roll_no : 'ADM-2026-104'); ?></td>
                        </tr>
                        <tr>
                            <td class="candidate-label">Father's Name:</td>
                            <td class="candidate-val"><?php echo e($student->father_name ?? 'Rajesh Sharma'); ?></td>
                            <td class="candidate-label">Mother's Name:</td>
                            <td class="candidate-val"><?php echo e($student->mother_name ?? 'Sunita Sharma'); ?></td>
                        </tr>
                        <tr>
                            <td class="candidate-label">Date of Birth:</td>
                            <td class="candidate-val"><?php echo e($student->dob ? \Carbon\Carbon::parse($student->dob)->format('d M, Y') : '14 Aug 2011'); ?></td>
                            <td class="candidate-label">Exam Center:</td>
                            <td class="candidate-val"><?php echo e($centerName ?? 'Main Academic Block (Wing-A)'); ?></td>
                        </tr>
                    </table>
                </td>
                <td style="width: 22%; text-align: center; vertical-align: middle;">
                    <div class="photo-box">
                        Affix Student<br>Passport Photo<br>(Attested)
                    </div>
                </td>
            </tr>
        </table>

        <!-- Examination Date-Sheet Schedule -->
        <table class="schedule-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Date</th>
                    <th style="width: 14%;">Day</th>
                    <th style="width: 18%;">Shift / Timing</th>
                    <th style="width: 28%;">Subject Name</th>
                    <th style="width: 11%;" class="text-center">Hall No</th>
                    <th style="width: 14%;" class="text-center">Invigilator Sign</th>
                </tr>
            </thead>
            <tbody>
                <?php
                    $schedules = $examSchedules ?? [
                        ['date' => '02 Mar 2026', 'day' => 'Monday', 'time' => '09:00 AM - 12:00 PM', 'subject' => 'English Language & Lit.', 'room' => 'Hall 101'],
                        ['date' => '05 Mar 2026', 'day' => 'Thursday', 'time' => '09:00 AM - 12:00 PM', 'subject' => 'Mathematics', 'room' => 'Hall 101'],
                        ['date' => '09 Mar 2026', 'day' => 'Monday', 'time' => '09:00 AM - 12:00 PM', 'subject' => 'Science & Technology', 'room' => 'Hall 101'],
                        ['date' => '12 Mar 2026', 'day' => 'Thursday', 'time' => '09:00 AM - 12:00 PM', 'subject' => 'Social Sciences', 'room' => 'Hall 101'],
                        ['date' => '16 Mar 2026', 'day' => 'Monday', 'time' => '09:00 AM - 12:00 PM', 'subject' => 'Hindi Course-A', 'room' => 'Hall 101'],
                        ['date' => '19 Mar 2026', 'day' => 'Thursday', 'time' => '09:00 AM - 11:00 AM', 'subject' => 'Computer Applications', 'room' => 'Lab 2'],
                    ];
                ?>
                <?php $__currentLoopData = $schedules; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $sched): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td style="font-weight: 700;"><?php echo e($sched['date']); ?></td>
                        <td><?php echo e($sched['day']); ?></td>
                        <td style="color: #64748b;"><?php echo e($sched['time']); ?></td>
                        <td style="font-weight: 600;"><?php echo e($sched['subject']); ?></td>
                        <td class="text-center"><?php echo e($sched['room']); ?></td>
                        <td class="text-center" style="color: #cbd5e1;">___________</td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tbody>
        </table>

        <!-- Rules & Instructions -->
        <div class="instructions-box">
            <strong>Important Instructions for Candidate:</strong>
            <ul>
                <li>Candidate must carry this Admit Card to the Examination Center every day. Entry will not be allowed without it.</li>
                <li>Report at the Examination Center at least 30 minutes before the scheduled commencement time.</li>
                <li>Mobile phones, calculators, smartwatches, or any electronic items are strictly prohibited in the exam hall.</li>
                <li>Candidate must occupy the seat allotted against their respective Roll Number.</li>
            </ul>
        </div>

        <!-- Signatures Table -->
        <table class="signatures-table">
            <tr>
                <td style="width: 33%;">
                    <div class="sign-line">Candidate's Signature</div>
                </td>
                <td style="width: 34%;">
                    <div class="sign-line">Center Superintendent</div>
                </td>
                <td style="width: 33%;">
                    <div class="sign-line">Principal & School Seal</div>
                </td>
            </tr>
        </table>

        <div class="footer-note">
            Official Examination Hall Ticket generated by LearnaZ School ERP Suite.
        </div>

    </div>

</body>
</html>
<?php /**PATH D:\Projects\school Management Software\backend\resources\views\documents\admit-card.blade.php ENDPATH**/ ?>