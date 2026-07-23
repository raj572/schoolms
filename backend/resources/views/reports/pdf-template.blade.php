<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ ucfirst($reportType) }} Report - {{ $school->name }}</title>
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
        <h1>{{ $school->name }}</h1>
        <p>{{ ucfirst($reportType) }} Report</p>
        <p>Period: {{ $startDate }} to {{ $endDate }}</p>
    </div>

    <div class="info-section">
        <h2>Summary</h2>
        @if($reportType === 'attendance')
            <div class="summary-box">
                <div class="stat-item">
                    <span>Average Student Attendance</span>
                    <strong>{{ isset($data['summary']) ? $data['summary']['avgAttendance'] : 0 }}%</strong>
                </div>
            </div>
        @elseif($reportType === 'financial')
            <div class="summary-box">
                <div class="stat-item">
                    <span>Total Amount</span>
                    <strong>₹{{ number_format($data['feeCollection']['total'] ?? 0, 2) }}</strong>
                </div>
                <div class="stat-item">
                    <span>Collected</span>
                    <strong>₹{{ number_format($data['feeCollection']['paid'] ?? 0, 2) }}</strong>
                </div>
                <div class="stat-item">
                    <span>Collection Rate</span>
                    <strong>{{ $data['feeCollection']['collectionRate'] ?? 0 }}%</strong>
                </div>
            </div>
        @elseif($reportType === 'performance')
            <div class="summary-box">
                <div class="stat-item">
                    <span>Average Performance</span>
                    <strong>{{ $data['performance']['averagePerformance'] ?? 0 }}%</strong>
                </div>
                <div class="stat-item">
                    <span>Pass Rate</span>
                    <strong>{{ $data['performance']['passRate'] ?? 0 }}%</strong>
                </div>
            </div>
        @endif
    </div>

    <div class="info-section">
        <h2>Detailed Data</h2>
        @if($reportType === 'attendance')
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
                    @foreach($data['attendance']['studentAttendance']['data'] as $row)
                    <tr>
                        <td>{{ $row['month'] ?? '' }}</td>
                        <td>{{ $row['attendance'] ?? 0 }}%</td>
                        <td>{{ $row['present'] ?? 0 }}</td>
                        <td>{{ $row['absent'] ?? 0 }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @elseif($reportType === 'financial')
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Paid (₹)</th>
                        <th>Due (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['feeCollection']['monthlyData'] as $row)
                    <tr>
                        <td>{{ $row['month'] ?? '' }}</td>
                        <td>{{ number_format($row['paid'] ?? 0, 2) }}</td>
                        <td>{{ number_format($row['due'] ?? 0, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @elseif($reportType === 'performance')
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Average %</th>
                        <th>Students</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['performance']['subjectWiseData'] as $row)
                    <tr>
                        <td>{{ $row['name'] ?? '' }}</td>
                        <td>{{ $row['average'] ?? 0 }}%</td>
                        <td>{{ $row['students'] ?? 0 }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    <div class="footer">
        <p>Report generated on: {{ $generatedAt }}</p>
        <p>{{ $school->name }} | {{ $school->email ?? '' }}</p>
    </div>
</body>
</html>
