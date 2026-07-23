<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
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
            background-color: #4A90E2;
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
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4A90E2;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #357ABD;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .code-box {
            background-color: #f4f4f4;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            word-break: break-all;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔐 Password Reset Request</h1>
    </div>

    <div class="content">
        <p>Hello <strong><?php echo e($superAdmin->full_name); ?></strong>,</p>

        <p>We received a request to reset your password for your Eklavya Super Admin account.</p>

        <p>Click the button below to reset your password:</p>

        <center>
            <a href="<?php echo e($resetUrl); ?>" class="button">Reset Password</a>
        </center>

        <p>Or copy and paste this link into your browser:</p>
        <div class="code-box">
            <?php echo e($resetUrl); ?>

        </div>

        <div class="warning">
            <strong>⏰ Important:</strong> This link will expire at <strong><?php echo e($expiresAt); ?></strong> (in 1 hour).
        </div>

        <p><strong>Security Tips:</strong></p>
        <ul>
            <li>If you didn't request this password reset, please ignore this email.</li>
            <li>Never share your password or reset link with anyone.</li>
            <li>Make sure you're on the official Eklavya domain before entering your new password.</li>
        </ul>

        <p>If you have any issues, please contact the system support team immediately.</p>

        <p>Best regards,<br>
        <strong>Eklavya System Team</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; <?php echo e(date('Y')); ?> Eklavya School Management System. All rights reserved.</p>
    </div>
</body>
</html>

<?php /**PATH D:\Projects\School ERP\erpapi2\resources\views\emails\super-admin-password-reset.blade.php ENDPATH**/ ?>