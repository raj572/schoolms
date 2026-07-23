<?php

namespace App\Helpers;

class JWTHelper
{
    private static $secret = 'your-secret-key-here';

    /**
     * Generate JWT token
     */
    public static function generateToken($data)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);

        // Build payload with dynamic data
        $payloadData = [
            'user_id' => $data['user_id'] ?? ($data->id ?? null),
            'email' => $data['email'] ?? ($data->email ?? null),
            'role' => $data['role'] ?? ($data->role ?? null),
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24 * 7), // 7 days
        ];

        // Add school_id only if it exists (not for super_admin)
        if (isset($data['school_id']) || (is_object($data) && property_exists($data, 'school_id'))) {
            $payloadData['school_id'] = $data['school_id'] ?? $data->school_id;
        }

        // Add type for super admin
        if (isset($data['type'])) {
            $payloadData['type'] = $data['type'];
        }

        $payload = json_encode($payloadData);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    /**
     * Verify JWT token with proper error messages
     */
    public static function verifyToken($token)
    {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return [
                    'success' => false,
                    'message' => 'Invalid token structure'
                ];
            }

            [$header, $payload, $signature] = $parts;

            // Verify signature
            $expectedSignature = hash_hmac('sha256', $header . "." . $payload, self::$secret, true);
            $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));

            if (!hash_equals($expectedSignature, $signature)) {
                return [
                    'success' => false,
                    'message' => 'Invalid token signature'
                ];
            }

            // Decode payload
            $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)));

            if (!$payloadData) {
                return [
                    'success' => false,
                    'message' => 'Invalid token payload'
                ];
            }

            // Check expiration
            if (!isset($payloadData->exp)) {
                return [
                    'success' => false,
                    'message' => 'Token missing expiration field'
                ];
            }

            if ($payloadData->exp < time()) {
                return [
                    'success' => false,
                    'message' => 'Token has expired'
                ];
            }

            return [
                'success' => true,
                'message' => 'Token is valid',
                'data' => $payloadData
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Token verification error: ' . $e->getMessage()
            ];
        }
    }
}
