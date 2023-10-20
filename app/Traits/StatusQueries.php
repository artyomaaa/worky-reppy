<?php

namespace App\Traits;

trait StatusQueries
{
    /**
     * @param $query
     * @return mixed
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE['value'] ?? self::ACTIVE);
    }

    /**
     * @param $query
     * @return mixed
     */
    public function scopeInactive($query)
    {
        return $query->where('status', self::INACTIVE['value'] ?? self::INACTIVE);
    }

    /**
     * @param $query
     * @return mixed
     */
    public function scopeArchived($query)
    {
        return $query->where('status', self::ARCHIVED['value'] ?? self::ARCHIVED);
    }
}
