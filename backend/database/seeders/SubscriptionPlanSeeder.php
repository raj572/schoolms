<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic Plan',
                'code' => 'BASIC',
                'description' => 'Perfect for small schools getting started with digital management',
                'price' => 999.00,
                'monthly_price' => 999.00,
                'annual_price' => 9990.00,
                'currency' => 'INR',
                'max_students' => 100,
                'max_teachers' => 10,
                'max_staff' => 5,
                'max_classes' => 10,
                'features' => json_encode([
                    'student_management' => true,
                    'teacher_management' => true,
                    'attendance_tracking' => true,
                    'fee_management' => true,
                    'basic_reports' => true,
                    'email_notifications' => true,
                    'sms_notifications' => false,
                    'parent_app' => false,
                    'online_exams' => false,
                    'transport_module' => false,
                    'hostel_module' => false,
                    'library_module' => false,
                    'custom_reports' => false,
                    'api_access' => false,
                    'multi_branch' => false,
                    'priority_support' => false,
                ]),
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Standard Plan',
                'code' => 'STANDARD',
                'description' => 'Ideal for growing schools with advanced features',
                'price' => 1999.00,
                'monthly_price' => 1999.00,
                'annual_price' => 19990.00,
                'currency' => 'INR',
                'max_students' => 500,
                'max_teachers' => 50,
                'max_staff' => 20,
                'max_classes' => 50,
                'features' => json_encode([
                    'student_management' => true,
                    'teacher_management' => true,
                    'attendance_tracking' => true,
                    'fee_management' => true,
                    'basic_reports' => true,
                    'email_notifications' => true,
                    'sms_notifications' => true,
                    'parent_app' => true,
                    'online_exams' => true,
                    'transport_module' => true,
                    'hostel_module' => false,
                    'library_module' => true,
                    'custom_reports' => false,
                    'api_access' => false,
                    'multi_branch' => false,
                    'priority_support' => true,
                ]),
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Premium Plan',
                'code' => 'PREMIUM',
                'description' => 'Complete solution for large institutions with unlimited access',
                'price' => 3999.00,
                'monthly_price' => 3999.00,
                'annual_price' => 39990.00,
                'currency' => 'INR',
                'max_students' => null, // unlimited
                'max_teachers' => null,
                'max_staff' => null,
                'max_classes' => null,
                'features' => json_encode([
                    'student_management' => true,
                    'teacher_management' => true,
                    'attendance_tracking' => true,
                    'fee_management' => true,
                    'basic_reports' => true,
                    'email_notifications' => true,
                    'sms_notifications' => true,
                    'parent_app' => true,
                    'online_exams' => true,
                    'transport_module' => true,
                    'hostel_module' => true,
                    'library_module' => true,
                    'custom_reports' => true,
                    'api_access' => true,
                    'multi_branch' => true,
                    'priority_support' => true,
                ]),
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::updateOrCreate(
                ['code' => $planData['code']],
                $planData
            );
        }

        $this->command->info('Subscription plans seeded successfully!');
        $this->command->warn('Note: Database seeders should only be used during initial setup. For production, use the Super Admin panel to manage plans manually.');
    }
}

