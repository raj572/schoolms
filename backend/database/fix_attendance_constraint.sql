-- SQL script to manually fix attendance constraint issue
-- Run this directly in MySQL if migrations don't work

-- Step 1: Check current constraints
SHOW INDEX FROM student_attendance_records WHERE Key_name LIKE 'uq_%';

-- Step 2: Drop old constraint (if exists)
ALTER TABLE student_attendance_records DROP INDEX IF EXISTS uq_student_date;

-- Alternative for MySQL versions that don't support IF EXISTS:
-- ALTER TABLE student_attendance_records DROP INDEX uq_student_date;

-- Step 3: Verify old constraint is dropped
SHOW INDEX FROM student_attendance_records WHERE Key_name = 'uq_student_date';

-- Step 4: Verify new constraint exists
SHOW INDEX FROM student_attendance_records WHERE Key_name = 'uq_student_date_period';

-- Step 5: If new constraint doesn't exist, add it
ALTER TABLE student_attendance_records 
ADD UNIQUE INDEX uq_student_date_period (student_details_id, attendance_date, period_number);

-- Step 6: Final verification - should see only uq_student_date_period
SHOW INDEX FROM student_attendance_records WHERE Key_name LIKE 'uq_%';

