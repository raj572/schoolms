<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\DB;

class UniqueUsername implements Rule
{
    protected $excludeId;
    protected $excludeTable;
    protected $tables;

    /**
     * Create a new rule instance.
     *
     * @param int|null $excludeId ID to exclude from validation (for updates)
     * @param string|null $excludeTable Table to exclude the ID from (for updates)
     */
    public function __construct($excludeId = null, $excludeTable = null)
    {
        $this->excludeId = $excludeId;
        $this->excludeTable = $excludeTable;

        // All tables that have username field
        $this->tables = ['users', 'students', 'super_admins'];
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        if (empty($value)) {
            return true; // Allow empty, use 'required' rule separately if needed
        }

        foreach ($this->tables as $table) {
            $query = DB::table($table)->where('username', $value);

            // Exclude current record if updating
            if ($this->excludeId && $this->excludeTable === $table) {
                $query->where('id', '!=', $this->excludeId);
            }

            if ($query->exists()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The :attribute has already been taken.';
    }
}

