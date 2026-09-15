<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\School;
use App\Models\User;
use App\Models\SuperAdmin;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\StudentDetails;
use App\Models\ParentModel;

class RoleSeeder extends Seeder
{
    /**
     * Seed sample test accounts for all application roles.
     * Default Password for all seeded test accounts: Password@123
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        // 1. Super Admin (super_admins table)
        SuperAdmin::updateOrCreate(
            ['email' => 'superadmin@school.com'],
            [
                'username' => 'superadmin_test',
                'password' => $defaultPassword,
                'full_name' => 'Test Super Admin',
                'phone' => '+91 9876543210',
                'status' => 'active',
                'role' => 'super_admin',
            ]
        );

        // 2. Demo School setup
        $school = School::updateOrCreate(
            ['email' => 'contact@demoschool.com'],
            [
                'name' => 'Demo International School',
                'phone' => '+91 9876543211',
                'school_code' => 'DEMO001',
                'address' => '123 Education Street',
                'city' => 'Metropolis',
                'state' => 'State',
                'country' => 'India',
                'pincode' => '110001',
                'principal_name' => 'Dr. Eleanor Vance',
                'principal_phone' => '+91 9876543212',
                'principal_email' => 'principal@school.com',
                'subscription_status' => 'active',
                'subscription_start_date' => now(),
                'subscription_end_date' => now()->addYear(),
                'status' => 'active',
            ]
        );

        // 3. Administrator (users table)
        $admin = User::updateOrCreate(
            ['email' => 'admin@school.com'],
            [
                'full_name' => 'Test School Admin',
                'username' => 'admin_test',
                'password' => $defaultPassword,
                'role' => 'administrator',
                'phone' => '+91 9876543213',
                'school_id' => $school->id,
                'status' => 'active',
                'registration_status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
                'school_setup_completed' => true,
                'subscription_active' => true,
            ]
        );

        // Update school administrator_id link
        $school->update(['administrator_id' => $admin->id]);

        // 4. Principal (users table)
        User::updateOrCreate(
            ['email' => 'principal@school.com'],
            [
                'full_name' => 'Dr. Eleanor Vance',
                'username' => 'principal_test',
                'password' => $defaultPassword,
                'role' => 'principal',
                'phone' => '+91 9876543212',
                'school_id' => $school->id,
                'administrator_id' => $admin->id,
                'status' => 'active',
                'assignment_status' => 'assigned',
                'registration_status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
                'school_setup_completed' => true,
                'subscription_active' => true,
            ]
        );

        // 5. Accountant (users table)
        User::updateOrCreate(
            ['email' => 'accountant@school.com'],
            [
                'full_name' => 'Test Accountant',
                'username' => 'accountant_test',
                'password' => $defaultPassword,
                'role' => 'accountant',
                'phone' => '+91 9876543214',
                'school_id' => $school->id,
                'administrator_id' => $admin->id,
                'status' => 'active',
                'registration_status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
                'school_setup_completed' => true,
                'subscription_active' => true,
            ]
        );

        // 6. Librarian (users table)
        User::updateOrCreate(
            ['email' => 'librarian@school.com'],
            [
                'full_name' => 'Test Librarian',
                'username' => 'librarian_test',
                'password' => $defaultPassword,
                'role' => 'librarian',
                'phone' => '+91 9876543215',
                'school_id' => $school->id,
                'administrator_id' => $admin->id,
                'status' => 'active',
                'registration_status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
                'school_setup_completed' => true,
                'subscription_active' => true,
            ]
        );

        // 7. Warden (users table)
        User::updateOrCreate(
            ['email' => 'warden@school.com'],
            [
                'full_name' => 'Test Hostel Warden',
                'username' => 'warden_test',
                'password' => $defaultPassword,
                'role' => 'warden',
                'phone' => '+91 9876543216',
                'school_id' => $school->id,
                'administrator_id' => $admin->id,
                'status' => 'active',
                'registration_status' => 'active',
                'email_verified' => true,
                'email_verified_at' => now(),
                'school_setup_completed' => true,
                'subscription_active' => true,
            ]
        );

        // 8. Teacher (teachers table)
        Teacher::updateOrCreate(
            ['email' => 'teacher@school.com'],
            [
                'school_id' => $school->id,
                'name' => 'Test Teacher',
                'role' => 'teacher',
                'password' => $defaultPassword,
                'phone' => '+91 9876543217',
                'qualification' => 'M.Sc., B.Ed',
                'dob' => '1990-05-15',
                'gender' => 'female',
                'address' => '456 Faculty Lane',
                'city' => 'Metropolis',
                'state' => 'State',
                'status' => 'active',
                'employee_code' => 'EMP001',
            ]
        );

        // 9. Parent (parents table)
        $parent = ParentModel::updateOrCreate(
            ['email' => 'parent@school.com'],
            [
                'school_id' => $school->id,
                'role' => 'parent',
                'father_name' => 'John Doe',
                'mother_name' => 'Jane Doe',
                'guardian_name' => 'John Doe',
                'phone' => '+91 9876543218',
                'password' => $defaultPassword,
                'address' => json_encode(['street' => '789 Parent Avenue', 'city' => 'Metropolis']),
                'relation' => 'father',
                'status' => 'active',
            ]
        );

        // 10. Classes & Subjects
        $classes = [
            ['class' => '9', 'section' => 'A', 'room_no' => '901', 'capacity' => 40],
            ['class' => '9', 'section' => 'B', 'room_no' => '902', 'capacity' => 40],
            ['class' => '10', 'section' => 'A', 'room_no' => '101', 'capacity' => 45],
            ['class' => '10', 'section' => 'B', 'room_no' => '102', 'capacity' => 45],
            ['class' => '11', 'section' => 'A', 'room_no' => '1101', 'capacity' => 50],
            ['class' => '12', 'section' => 'A', 'room_no' => '1201', 'capacity' => 50],
        ];

        foreach ($classes as $c) {
            \DB::table('school_class')->updateOrInsert(
                [
                    'school_id' => $school->id,
                    'class' => $c['class'],
                    'section' => $c['section']
                ],
                [
                    'teacher_in_charge' => 'Test Teacher',
                    'room_no' => $c['room_no'],
                    'capacity' => $c['capacity'],
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $subjects = [
            ['subject_name' => 'Mathematics', 'description' => 'Algebra, Geometry, and Calculus'],
            ['subject_name' => 'Physics', 'description' => 'Fundamentals of Physics'],
            ['subject_name' => 'Chemistry', 'description' => 'Organic and Inorganic Chemistry'],
            ['subject_name' => 'English Literature', 'description' => 'English Language and Literature'],
            ['subject_name' => 'Computer Science', 'description' => 'Programming and Data Structures'],
            ['subject_name' => 'Social Studies', 'description' => 'History, Civics, and Geography'],
        ];

        foreach ($subjects as $s) {
            \DB::table('school_subjects')->updateOrInsert(
                [
                    'school_id' => $school->id,
                    'subject_name' => $s['subject_name']
                ],
                [
                    'description' => $s['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $student = Student::updateOrCreate(
            [
                'school_id' => $school->id,
                'email' => 'student@school.com'
            ],
            [
                'username' => 'student_test',
                'password' => $defaultPassword,
                'class' => '10A',
                'status' => 'active',
                'role' => 'student',
            ]
        );

        StudentDetails::updateOrCreate(
            [
                'school_id' => $school->id,
                'student_id' => $student->id
            ],
            [
                'parent_id' => $parent->id,
                'candidate_name' => 'Alex Doe',
                'gender' => 'male',
                'addhar' => '123456789012',
                'dob' => '2010-08-20',
                'class' => '10',
                'section' => 'A',
                'status' => 'studying',
                'roll_no' => '1001',
                'email' => 'student@school.com',
                'father_name' => 'John Doe',
                'mother_name' => 'Jane Doe',
                'phone' => '+91 9876543219',
                'address' => '789 Parent Avenue, Metropolis',
                'admission_date' => '2024-04-01',
            ]
        );

        $this->command->info('RoleSeeder completed successfully!');
        $this->command->info('Test Credentials (Password for all: password):');
        $this->command->info(' - Super Admin: superadmin@school.com (Table: super_admins)');
        $this->command->info(' - Admin:       admin@school.com (School ID: ' . $school->id . ')');
        $this->command->info(' - Principal:   principal@school.com (School ID: ' . $school->id . ')');
        $this->command->info(' - Accountant:  accountant@school.com (School ID: ' . $school->id . ')');
        $this->command->info(' - Librarian:   librarian@school.com (School ID: ' . $school->id . ')');
        $this->command->info(' - Warden:      warden@school.com (School ID: ' . $school->id . ')');
        $this->command->info(' - Teacher:     teacher@school.com (School ID: ' . $school->id . ')');
        $this->command->info(' - Parent:      parent@school.com (School ID: ' . $school->id . ')');
        $this->command->info(' - Student:     student@school.com (School ID: ' . $school->id . ')');
    }
}
