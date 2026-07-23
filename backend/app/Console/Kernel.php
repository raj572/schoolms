<?php
// app/Console/Kernel.php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Run your custom command every 28th at 11:55 PM
        $schedule->command('generate:monthly-dues')->monthlyOn(28, '23:55');

        // Cleanup incomplete registrations daily at 2:00 AM
        // Deletes administrator accounts that haven't completed school setup within 24 hours
        $schedule->command('cleanup:incomplete-registrations')->dailyAt('02:00');
    }

    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

// php artisan generate:monthly-dues
// 🛠️ Next Steps
// Save the file.

// Confirm your command works manually:

// bash
// Copy
// Edit
// php artisan generate:monthly-dues
// Make sure your server has the Laravel scheduler cron job running:

// bash
// Copy
// Edit
// * * * * * php /path-to-your-project/artisan schedule:run >> /dev/null 2>&1
// This line runs Laravel’s internal scheduler every minute, and Laravel decides when to execute scheduled tasks like your monthly command.

// Let me know if you want help verifying your CRON setup or if you want to log output from the scheduled command to a file.



// You said:
// how to test locally


// ChatGPT said:
// To test your scheduled Artisan command locally, there are a few simple options:

// ✅ Option 1: Run it manually (best for testing logic)
// Since you’re testing generate:monthly-dues, just run:

// bash
// Copy
// Edit
// php artisan generate:monthly-dues
// You’ll instantly see if it creates MonthlyPayments as expected.

// ✅ Option 2: Simulate the scheduler manually
// If you want to simulate Laravel’s scheduler behavior (as if it’s the 28th of the month at 23:55), run:

// bash
// Copy
// Edit
// php artisan schedule:run
// This will execute any scheduled task that’s due right now, so make sure the current date/time matches the schedule.

// ⚙️ Force your command to run immediately for test
// You can temporarily modify the schedule in app/Console/Kernel.php like so:

// php
// Copy
// Edit
// $schedule->command('generate:monthly-dues')->everyMinute();
// Then open a new terminal and run the scheduler manually:

// bash
// Copy
// Edit
// php artisan schedule:run
// ➡️ This will now run your generate:monthly-dues command every time you invoke schedule:run.

// 🧪 Optional: Add logging to confirm it runs
// In your GenerateMonthlyDues command, add:

// php
// Copy
// Edit
// Log::info("Running monthly dues command manually...");
// Then check storage/logs/laravel.log after running:

// bash
// Copy
// Edit
// php artisan schedule:run
// ⏱️ Revert to Monthly Schedule After Testing
// After testing, change this back:

// php
// Copy
// Edit
// $schedule->command('generate:monthly-dues')->monthlyOn(28, '23:55');
// Let me know if you want to test for a custom month or backdate dues (e.g., for June). I can modify your command to accept an optional --month flag.
