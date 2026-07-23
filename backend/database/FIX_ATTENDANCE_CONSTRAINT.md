# Fix Attendance Constraint Issue

## Problem
Error: `Duplicate entry '3-2025-10-31' for key 'uq_student_date'`

This means the old unique constraint `uq_student_date` (on `student_details_id + attendance_date`) is still active, blocking multiple period attendance records.

## Solution

### Option 1: Run the SQL Script Directly

Execute this SQL in your MySQL database:

```sql
-- Check current constraints
SHOW INDEX FROM student_attendance_records WHERE Key_name LIKE 'uq_%';

-- Drop old constraint
ALTER TABLE student_attendance_records DROP INDEX uq_student_date;

-- Verify it's dropped (should return empty)
SHOW INDEX FROM student_attendance_records WHERE Key_name = 'uq_student_date';

-- Verify new constraint exists (should return results)
SHOW INDEX FROM student_attendance_records WHERE Key_name = 'uq_student_date_period';
```

### Option 2: Use Laravel Tinker

```php
php artisan tinker

// Then in tinker:
DB::statement('ALTER TABLE student_attendance_records DROP INDEX uq_student_date');
```

### Option 3: Check for Conflicting Records

If the constraint drop fails, there might be duplicate records. Check:

```sql
-- Find duplicates that would violate old constraint
SELECT student_details_id, attendance_date, COUNT(*) as count
FROM student_attendance_records
GROUP BY student_details_id, attendance_date
HAVING count > 1;
```

If duplicates exist, you may need to delete them or handle them according to your business logic.

## Expected Result

After fixing:
- Old constraint `uq_student_date` should be DROPPED
- New constraint `uq_student_date_period` should EXIST
- Period attendance should work for multiple periods per student per date
- Updates to same period should work correctly

## Verification

Test with this payload:
```json
{
  "attendance_date": "2025-10-31",
  "class_id": 2,
  "subject_id": 1,
  "period_number": 1,
  "attendance_type": "period",
  "students": [
    {"student_id": 3, "status": "absent"},
    {"student_id": 4, "status": "late"}
  ]
}
```

If there's already a record for student 3 on 2025-10-31 with period_number=1, it should UPDATE.
If there's a record with period_number=NULL or different period_number, it should INSERT a new record.

