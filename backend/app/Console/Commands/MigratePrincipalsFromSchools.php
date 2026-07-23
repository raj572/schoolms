<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RegistrationService;

class MigratePrincipalsFromSchools extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'principals:migrate-from-schools';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing principal data from school records to principal user accounts';

    protected $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        parent::__construct();
        $this->registrationService = $registrationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting principal migration from school records...');
        $this->newLine();

        $result = $this->registrationService->migratePrincipalsFromSchools();

        if ($result['status']) {
            $this->info($result['message']);
            $this->newLine();

            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Schools Checked', $result['data']['total_schools_checked']],
                    ['Principals Created', $result['data']['created_count']],
                    ['Skipped', $result['data']['skipped_count']],
                ]
            );

            if (!empty($result['data']['created_principals'])) {
                $this->newLine();
                $this->info('Created Principals:');
                $this->table(
                    ['School Name', 'Principal Name', 'Email'],
                    array_map(function($principal) {
                        return [
                            $principal['school_name'],
                            $principal['principal_name'],
                            $principal['principal_email'],
                        ];
                    }, $result['data']['created_principals'])
                );
            }

            if (!empty($result['data']['skipped_reasons'])) {
                $this->newLine();
                $this->warn('Skipped Records:');
                foreach ($result['data']['skipped_reasons'] as $reason) {
                    $this->warn("  • {$reason}");
                }
            }

            $this->newLine();
            $this->info('✓ Migration completed successfully!');
            return 0;
        } else {
            $this->error('Migration failed: ' . $result['message']);
            if (isset($result['error'])) {
                $this->error('Error: ' . $result['error']);
            }
            return 1;
        }
    }
}
