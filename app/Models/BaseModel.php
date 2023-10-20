<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class BaseModel extends Model
{
    /**
     * If Carbon - then move to UTC timezone before saving
     * Assuming all dates are saved in UTC only
     *
     * @param mixed $value
     *
     * @return Carbon|mixed
     */
    protected function asDateTime($value)
    {
        //
        // any Carbon instance is going to be translated to UTC before saving
        //
        if($value instanceof Carbon) {
            $value->timezone('UTC');
        }

        return parent::asDateTime($value);
    }
}
