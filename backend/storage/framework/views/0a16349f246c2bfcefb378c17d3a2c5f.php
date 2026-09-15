<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title><?php echo e(ucfirst($reportType)); ?> Report - <?php echo e($school->name); ?></title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-section h2 {
            font-size: 18px;
            margin-bottom: 10px;
            color: #333;
            border-bottom: 2px solid #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .summary-box {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .summary-box h3 {
            margin-top: 0;
        }
        .stat-item {
            display: inline-block;
            margin-right: 20px;
            padding: 10px;
            border-left: 3px solid #333;
        }
        .stat-item strong {
            display: block;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1><?php echo e($school->name); ?></h1>
        <p><?php echo e(ucfirst($reportType)); ?> Report</p>
        <p>Period: <?php echo e($startDate); ?> to <?php echo e($endDate); ?></p>
    </div>

    <div class="info-section">
        <h2>Summary</h2>
        <?php if($reportType === 'attendance'): ?>
            <div class="summary-box">
                <div class="stat-item">
                    <span>Average Student Attendance</span>
                    <strong><?php echo e(isset($data['summary']) ? $data['summary']['avgAttendance'] : 0); ?>%</strong>
                </div>
            </div>
        <?php elseif($reportType === 'financial'): ?>
            <div class="summary-box">
                <div class="stat-item">
                    <span>Total Amount</span>
                    <strong>₹<?php echo e(number_format($data['feeCollection']['total'] ?? 0, 2)); ?></strong>
                </div>
                <div class="stat-item">
                    <span>Collected</span>
                    <strong>₹<?php echo e(number_format($data['feeCollection']['paid'] ?? 0, 2)); ?></strong>
                </div>
                <div class="stat-item">
                    <span>Collection Rate</span>
                    <strong><?php echo e($data['feeCollection']['collectionRate'] ?? 0); ?>%</strong>
                </div>
            </div>
        <?php elseif($reportType === 'performance'): ?>
            <div class="summary-box">
                <div class="stat-item">
                    <span>Average Performance</span>
                    <strong><?php echo e($data['performance']['averagePerformance'] ?? 0); ?>%</strong>
                </div>
                <div class="stat-item">
                    <span>Pass Rate</span>
                    <strong><?php echo e($data['performance']['passRate'] ?? 0); ?>%</strong>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <div class="info-section">
        <h2>Detailed Data</h2>
        <?php if($reportType === 'attendance'): ?>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Attendance %</th>
                        <th>Present</th>
                        <th>Absent</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__currentLoopData = $data['attendance']['studentAttendance']['data']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td><?php echo e($row['month'] ?? ''); ?></td>
                        <td><?php echo e($row['attendance'] ?? 0); ?>%</td>
                        <td><?php echo e($row['present'] ?? 0); ?></td>
                        <td><?php echo e($row['absent'] ?? 0); ?></td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>
        <?php elseif($reportType === 'financial'): ?>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Paid (₹)</th>
                        <th>Due (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__currentLoopData = $data['feeCollection']['monthlyData']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td><?php echo e($row['month'] ?? ''); ?></td>
                        <td><?php echo e(number_format($row['paid'] ?? 0, 2)); ?></td>
                        <td><?php echo e(number_format($row['due'] ?? 0, 2)); ?></td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>
        <?php elseif($reportType === 'performance'): ?>
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Average %</th>
                        <th>Students</th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__currentLoopData = $data['performance']['subjectWiseData']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $row): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <tr>
                        <td><?php echo e($row['name'] ?? ''); ?></td>
                        <td><?php echo e($row['average'] ?? 0); ?>%</td>
                        <td><?php echo e($row['students'] ?? 0); ?></td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>

    <div class="footer">
        <p>Report generated on: <?php echo e($generatedAt); ?></p>
        <p><?php echo e($school->name); ?> | <?php echo e($school->email ?? ''); ?></p>
    </div>
</body>
</html>
<?php /**PATH D:\Projects\school Management Software\backend\resources\views\reports\pdf-template.blade.php ENDPATH**/ ?>