<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Send a plain-text email.
     *
     * @param string $toEmail         // Recipient email
     * @param string $subject         // Subject of the email
     * @param string $rawMessage      // Plain text message body
     * @param array  $attachments     // Optional: [ ['path' => ..., 'name' => ...], ... ]
     * @return void
     */
    public function sendRaw(
        string $toEmail,
        string $subject,
        string $rawMessage,
        array $attachments = []
    ): void {
        Mail::raw($rawMessage, function ($message) use ($toEmail, $subject, $attachments) {
            $message->to($toEmail)->subject($subject);

            foreach ($attachments as $file) {
                $message->attach($file['path'], [
                    'as' => $file['name'] ?? basename($file['path']),
                ]);
            }
        });
    }

    /**
     * Send verification email to user
     *
     * @param \App\Models\User $user
     * @return void
     */
    public function sendVerificationEmail($user): void
    {
        $verificationUrl = env('APP_URL') . '/api/auth/verify-email?token=' . $user->verification_token;

        $subject = 'Verify Your Email Address - School Management System';

        $message = "Hello {$user->full_name},\n\n";
        $message .= "Thank you for registering with School Management System!\n\n";
        $message .= "Please verify your email address by using the verification token below:\n\n";
        $message .= "Verification Token: {$user->verification_token}\n\n";
        $message .= "Or click this link: {$verificationUrl}\n\n";
        $message .= "This link will expire in 24 hours.\n\n";
        $message .= "If you did not create an account, please ignore this email.\n\n";
        $message .= "Best regards,\n";
        $message .= "School Management Team";

        $this->sendRaw($user->email, $subject, $message);
    }

    /**
     * Send password reset email
     *
     * @param \App\Models\User $user
     * @param string $resetToken
     * @return void
     */
    public function sendPasswordResetEmail($user, string $resetToken): void
    {
        $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $resetToken;

        $subject = 'Reset Your Password - School Management System';

        $message = "Hello {$user->full_name},\n\n";
        $message .= "We received a request to reset your password.\n\n";
        $message .= "Click the link below to reset your password:\n\n";
        $message .= $resetUrl . "\n\n";
        $message .= "If you did not request a password reset, please ignore this email.\n\n";
        $message .= "This link will expire in 1 hour.\n\n";
        $message .= "Best regards,\n";
        $message .= "School Management Team";

        $this->sendRaw($user->email, $subject, $message);
    }


}
