<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed Successfully</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
        }
        .success-box {
            background-color: #d4edda;
            border: 1px solid #28a745;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .info-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        .info-table td:first-child {
            font-weight: bold;
            width: 40%;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Password Changed Successfully</h1>
    </div>

    <div class="content">
        <p>Hello <strong>{{ $superAdmin->full_name }}</strong>,</p>

        <div class="success-box">
            <h2 style="margin: 0; color: #28a745;">Your password has been changed successfully!</h2>
        </div>

        <p>This email confirms that your Eklavya Super Admin account password was changed.</p>

        <table class="info-table">
            <tr>
                <td>Account:</td>
                <td>{{ $superAdmin->email }}</td>
            </tr>
            <tr>
                <td>Username:</td>
                <td>{{ $superAdmin->username }}</td>
            </tr>
            <tr>
                <td>Changed At:</td>
                <td>{{ now()->format('F j, Y \a\t g:i A') }}</td>
            </tr>
            <tr>
                <td>IP Address:</td>
                <td>{{ request()->ip() }}</td>
            </tr>
        </table>

        <div class="warning">
            <strong>⚠️ Didn't make this change?</strong><br>
            If you did not change your password, your account may be compromised. Please contact the system security team immediately at <a href="mailto:security@eklavya.com">security@eklavya.com</a>
        </div>

        <p><strong>Security Recommendations:</strong></p>
        <ul>
            <li>Use a strong, unique password for your account</li>
            <li>Enable two-factor authentication if available</li>
            <li>Never share your password with anyone</li>
            <li>Regularly review your account activity</li>
        </ul>

        <p>You can now login to your Super Admin panel using your new password.</p>

        <p>Best regards,<br>
        <strong>Eklavya System Team</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }} Eklavya School Management System. All rights reserved.</p>
    </div>
</body>
</html>

