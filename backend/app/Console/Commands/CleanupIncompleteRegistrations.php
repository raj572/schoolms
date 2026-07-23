<?php

namespace App\Console\Commands;

use App\Services\RegistrationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupIncompleteRegistrations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:incomplete-registrations {--hours=24 : Number of hours after which registration is considered abandoned}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup incomplete administrator registrations (users who registered but did not complete school setup)';

    protected $registrationService;

    /**
     * Create a new command instance.
     */
    public function __construct(RegistrationService $registrationService)
    {
        parent::__construct();
        $this->registrationService = $registrationService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $hours = (int) $this->option('hours');

        $this->info("🔍 Searching for incomplete registrations older than {$hours} hours...");

        $result = $this->registrationService->cleanupIncompleteRegistrations($hours);

        if ($result['status']) {
            $deletedCount = $result['data']['deleted_count'];

            if ($deletedCount > 0) {
                $this->info("✅ Successfully cleaned up {$deletedCount} incomplete registration(s).");

                if (!empty($result['data']['deleted_emails'])) {
                    $this->info("\n📧 Deleted user emails:");
                    foreach ($result['data']['deleted_emails'] as $email) {
                        $this->line("  - {$email}");
                    }
                }
            } else {
                $this->info("✅ No incomplete registrations found to clean up.");
            }

            Log::info("Cleanup incomplete registrations completed: {$deletedCount} user(s) deleted.");
            return Command::SUCCESS;
        } else {
            $this->error("❌ Failed to cleanup incomplete registrations.");
            $this->error("Error: " . ($result['error'] ?? 'Unknown error'));

            Log::error("Cleanup incomplete registrations failed: " . ($result['error'] ?? 'Unknown error'));
            return Command::FAILURE;
        }
    }
}

