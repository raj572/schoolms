<?php

namespace App\Console\Commands;

use App\Models\SuperAdmin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class TestSuperAdminPassword extends Command
{
    protected $signature = 'test:super-admin-password {email} {password}';
    protected $description = 'Test super admin password verification';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $superAdmin = SuperAdmin::where('email', $email)->first();

        if (!$superAdmin) {
            $this->error("Super admin not found with email: {$email}");
            return Command::FAILURE;
        }

        $this->info("Super admin found: {$superAdmin->email}");
        $this->info("Status: {$superAdmin->status}");
        $this->info("Password hash length: " . strlen($superAdmin->password));
        $this->info("Password starts with: " . substr($superAdmin->password, 0, 10));

        $isValid = Hash::check($password, $superAdmin->password);

        if ($isValid) {
            $this->info("✓ Password is VALID!");
            return Command::SUCCESS;
        } else {
            $this->error("✗ Password is INVALID!");

            // Try creating a new hash to compare
            $testHash = Hash::make($password);
            $this->info("Test hash: " . substr($testHash, 0, 20) . "...");
            $this->info("Stored hash: " . substr($superAdmin->password, 0, 20) . "...");

            return Command::FAILURE;
        }
    }
}

