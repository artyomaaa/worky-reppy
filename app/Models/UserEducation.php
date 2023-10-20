<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserEducation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'type',
        'education_institution',
        'faculty_and_department',
        'profession',
        'degree',
        'from',
        'to',
        'description',
        'another_education_institution'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function addEducation($fields)
    {
        $loggedUser = auth()->user();

        $newEducation = new self();
        $newEducation->user_id = $loggedUser['id'];
        $newEducation->education_institution = $fields['education_institution'];
        $newEducation->faculty_and_department = $fields['faculty_and_department'];
        $newEducation->another_education_institution = $fields['another_education_institution'];
        $newEducation->profession = $fields['profession'];
        $newEducation->degree = $fields['degree'];
        $newEducation->from = $fields['from'];
        $newEducation->to = $fields['to'];
        if ($newEducation->save()) {
            return true;
        }
        return false;
    }
    public function updateEducation($fields)
    {

    }
}



