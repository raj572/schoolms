<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fee Receipt - <?php echo e($receiptNumber ?? 'REC-001'); ?></title>
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
            max-width: 800px;
            margin: 24px auto;
            background: #ffffff;
            padding: 32px 36px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
            position: relative;
        }

        <?php if($isPdf ?? false): ?>
        body { background: #fff; }
        .receipt-container { margin: 0; padding: 20px; box-shadow: none; border: none; max-width: 100%; }
        .action-bar { display: none !important; }
        <?php endif; ?>

        @media print {
            body { background: #fff; }
            .action-bar { display: none !important; }
            .receipt-container { margin: 0; padding: 20px; box-shadow: none; border: none; max-width: 100%; }
        }

        table.full-width { width: 100%; border-collapse: collapse; }
        table.full-width td { vertical-align: top; }

        .school-header { text-align: center; border-bottom: 2px double #1e3a8a; padding-bottom: 12px; margin-bottom: 16px; }
        .school-name { font-size: 22px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; }
        .school-sub { font-size: 11px; color: #4b5563; margin-top: 3px; }
        .school-contact { font-size: 11px; color: #6b7280; margin-top: 2px; }

        .doc-title-bar {
            text-align: center;
            margin: 12px 0;
            position: relative;
        }
        .doc-title {
            display: inline-block;
            background: #1e3a8a;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            padding: 4px 18px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .copy-type {
            font-size: 10px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            margin-top: 3px;
        }

        .meta-strip {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
        }
        .meta-strip td { font-size: 11px; padding: 3px 6px; }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }
        .items-table th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            text-align: left;
        }
        .items-table td {
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            font-size: 11px;
        }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }

        .words-box {
            background: #f8fafc;
            border-left: 3px solid #1e3a8a;
            padding: 8px 12px;
            font-size: 11px;
            margin-top: 10px;
        }

        .signatures-table {
            width: 100%;
            margin-top: 40px;
            border-collapse: collapse;
        }
        .signatures-table td {
            text-align: center;
            vertical-align: bottom;
            font-size: 11px;
            font-weight: 600;
            color: #374151;
            padding-top: 35px;
        }
        .sign-line {
            display: inline-block;
            width: 160px;
            border-top: 1px dashed #6b7280;
            padding-top: 5px;
        }

        .footer-note {
            margin-top: 24px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
        }
    </style>
</head>
<body>

    <?php if(!($isPdf ?? false)): ?>
    <div class="action-bar">
        <div class="brand">LEARNAZ SCHOOL ERP • Fee Receipt</div>
        <div class="btn-group">
            <button onclick="window.print()" class="btn btn-print">🖨️ Print Receipt</button>
            <a href="?download=pdf" class="btn btn-download">⬇️ Download PDF</a>
        </div>
    </div>
    <?php endif; ?>

    <div class="receipt-container">

        <!-- School Official Header -->
        <div class="school-header">
            <div class="school-name"><?php echo e($school->name ?? 'Demo International School'); ?></div>
            <div class="school-sub">
                Affiliated to <?php echo e($school->board ?? 'CBSE / State Board'); ?> • Affiliation No: <?php echo e($school->affiliation_number ?? 'AFF-2026-9812'); ?> • School Code: <?php echo e($school->school_code ?? 'SCH-0102'); ?>

            </div>
            <div class="school-contact">
                <?php echo e($school->address ?? 'Station Road, Campus Area'); ?>, <?php echo e($school->city ?? 'Central District'); ?>, <?php echo e($school->state ?? ''); ?> - <?php echo e($school->pincode ?? ''); ?> | Phone: <?php echo e($school->phone ?? '+91 9876543210'); ?> | Email: <?php echo e($school->email ?? 'info@school.edu'); ?>

            </div>
        </div>

        <!-- Title -->
        <div class="doc-title-bar">
            <div class="doc-title">Student Fee Receipt</div>
            <div class="copy-type">Academic Session: <?php echo e($session ?? '2026-2027'); ?> • [Parent Copy]</div>
        </div>

        <!-- Receipt & Student Particulars -->
        <div class="meta-strip">
            <table class="full-width">
                <tr>
                    <td style="width: 20%; font-weight: 700; color: #64748b;">Receipt No:</td>
                    <td style="width: 30%; font-weight: 700; color: #1e3a8a;"><?php echo e($receiptNumber ?? 'REC-2026-0042'); ?></td>
                    <td style="width: 20%; font-weight: 700; color: #64748b;">Date of Payment:</td>
                    <td style="width: 30%; font-weight: 600;"><?php echo e($paymentDate ?? date('d M, Y')); ?></td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #64748b;">Student Name:</td>
                    <td style="font-weight: 700;"><?php echo e($student->candidate_name ?? 'Aarav Sharma'); ?></td>
                    <td style="font-weight: 700; color: #64748b;">Admission / Reg No:</td>
                    <td style="font-weight: 600;"><?php echo e($student->roll_no ? 'ADM-' . $student->roll_no : 'ADM-2026-104'); ?></td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #64748b;">Class & Section:</td>
                    <td style="font-weight: 600;">Class <?php echo e($student->class ?? '10'); ?> - Sec <?php echo e($student->section ?? 'A'); ?></td>
                    <td style="font-weight: 700; color: #64748b;">Roll Number:</td>
                    <td style="font-weight: 600;"><?php echo e($student->roll_no ?? '18'); ?></td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #64748b;">Father's Name:</td>
                    <td><?php echo e($student->father_name ?? 'Rajesh Sharma'); ?></td>
                    <td style="font-weight: 700; color: #64748b;">Fee Month / Period:</td>
                    <td style="font-weight: 600; color: #047857;"><?php echo e($monthName ?? date('F Y')); ?></td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #64748b;">Payment Mode:</td>
                    <td style="text-transform: capitalize;"><?php echo e($paymentMode ?? 'Online UPI / NetBanking'); ?></td>
                    <td style="font-weight: 700; color: #64748b;">Transaction Ref:</td>
                    <td style="font-family: monospace; font-size: 10px;"><?php echo e($transactionRef ?? 'TXN_' . strtoupper(uniqid())); ?></td>
                </tr>
            </table>
        </div>

        <!-- Fee Items Breakdown -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 8%;" class="text-center">S.No</th>
                    <th style="width: 48%;">Fee Particulars / Head</th>
                    <th style="width: 16%;" class="text-right">Due (₹)</th>
                    <th style="width: 14%;" class="text-right">Concession (₹)</th>
                    <th style="width: 14%;" class="text-right">Paid Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                <?php
                    $items = $feeItems ?? [
                        ['name' => 'Monthly Tuition Fee', 'due' => 2500, 'concession' => 0, 'paid' => 2500],
                        ['name' => 'Computer & Smart Class Fee', 'due' => 400, 'concession' => 0, 'paid' => 400],
                        ['name' => 'Examination & Assessment Fee', 'due' => 300, 'concession' => 0, 'paid' => 300],
                        ['name' => 'Sports & Activity Charges', 'due' => 200, 'concession' => 0, 'paid' => 200],
                        ['name' => 'Library & Resource Charges', 'due' => 100, 'concession' => 0, 'paid' => 100],
                    ];
                    $totalDue = 0;
                    $totalConcession = 0;
                    $totalPaid = 0;
                ?>
                <?php $__currentLoopData = $items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $idx => $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <?php
                        $totalDue += $item['due'];
                        $totalConcession += $item['concession'] ?? 0;
                        $totalPaid += $item['paid'];
                    ?>
                    <tr>
                        <td class="text-center"><?php echo e($idx + 1); ?></td>
                        <td style="font-weight: 600;"><?php echo e($item['name']); ?></td>
                        <td class="text-right"><?php echo e(number_format($item['due'], 2)); ?></td>
                        <td class="text-right"><?php echo e(number_format($item['concession'] ?? 0, 2)); ?></td>
                        <td class="text-right" style="font-weight: 700;"><?php echo e(number_format($item['paid'], 2)); ?></td>
                    </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <tr style="background: #f8fafc; font-weight: 800;">
                    <td colspan="2" class="text-right">Grand Total:</td>
                    <td class="text-right">₹<?php echo e(number_format($totalDue, 2)); ?></td>
                    <td class="text-right">₹<?php echo e(number_format($totalConcession, 2)); ?></td>
                    <td class="text-right" style="color: #047857; font-size: 13px;">₹<?php echo e(number_format($totalPaid, 2)); ?></td>
                </tr>
            </tbody>
        </table>

        <!-- Amount in Words -->
        <div class="words-box">
            <strong>Amount in Words:</strong>
            <span style="font-style: italic; color: #1e3a8a;">
                <?php echo e($amountInWords ?? 'Three Thousand Five Hundred Rupees Only'); ?>

            </span>
        </div>

        <?php if(!empty($remarks)): ?>
        <div style="font-size: 11px; color: #64748b; margin-top: 8px;">
            <strong>Remarks / Notes:</strong> <?php echo e($remarks); ?>

        </div>
        <?php endif; ?>

        <!-- Signatures Table -->
        <table class="signatures-table">
            <tr>
                <td style="width: 33%;">
                    <div class="sign-line">Parent / Guardian</div>
                </td>
                <td style="width: 34%;">
                    <div class="sign-line">Cashier / Accountant</div>
                </td>
                <td style="width: 33%;">
                    <div class="sign-line">Authorized Signatory / Seal</div>
                </td>
            </tr>
        </table>

        <div class="footer-note">
            Notice: Fees once paid are non-refundable & non-transferable. Computer-generated official receipt issued by LearnaZ ERP.
        </div>

    </div>

</body>
</html>
<?php /**PATH D:\Projects\school Management Software\backend\resources\views\documents\fee-receipt.blade.php ENDPATH**/ ?>