<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\CustomVerifyEmailQueued;
use App\Notifications\MailResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Passport\HasApiTokens;
use App\Traits\StatusQueries;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasRoles, Notifiable, HasFactory, StatusQueries;

    const ACTIVE = ['text' => 'Active', 'value' => 1],
          INACTIVE = ['text' => 'Inactive', 'value' => 0],
          ARCHIVED = ['text' => 'Archived', 'value' => 2],
          SHARED =['text'=> 'Shared', 'value'=> 1],
          PRIVATE =['text'=> 'Private', 'value'=> 0];

    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'status',
        'type',
        'avatar',
        'surname',
        'patronymic',
        'birthday',
        'notes',
        'time_offset',
        'amountOfKids',
        'about',
        'nationality',
        'gender',
        'birthday',
        'family_status',
        'nickname',
        'tin',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'status' => 'integer',
    ];

    /**
     * Mutator that appends in query result sets as though it is part of db table
     *
     * @var array
     */
    protected $appends = ['user_role', 'salary','permission','position'];

    /**
     * User salary Accessor.
     *
     * @return mixed
     */
    function getSalaryAttribute()
    {
        //  comment out, because in the network they were visible user salary
//        $userSalaryObject = $this->UserSalary()->where('status', '=', 1)->first('salary');
//        return $userSalaryObject ? $userSalaryObject->salary : null;
        return null;
    }

    function getPositionAttribute()
    {
        $userPositionObject = $this->userJobInformation()->first('position');

        return $userPositionObject ? $userPositionObject->position : null;
    }

    function getPermissionAttribute()
    {
        return $this->permissions()->pluck('name')->ToArray();
    }

    /**
     * User Skills Accessor.
     *
     * @return object
     */
    function getUserSkillsAttribute()
    {
        return $this->skills()->pluck('name');
    }

    /**
     * Add select role_name in query.
     * @param $query
     * @return mixed
     */
    public function scopeRoleName($query)
    {
        return $query->join('model_has_roles', 'model_has_roles.model_id', '=', 'users.id')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->selectRaw('users.*, roles.name as role_name');
    }

    /**
     * User Role Accessor.
     *
     * @return mixed
     */
    function getUserRoleAttribute()
    {
        return !empty($this->roles[0]) ? $this->roles[0] : [];
    }

    /**
     * Get the documents for the user.
     */
    public function documents()
    {
        return $this->hasMany(UserDocument::class);
    }

    /**
     * Get the works for the user.
     */
    public function works()
    {
        return $this->hasMany(Work::class);
    }

    /**
     * Get the educations for the user.
     */
    public function educations()
    {
        return $this->hasMany(UserEducation::class);
    }
    /**
     * Get the languages for the user.
     */
    public function languages()
    {
        return $this->hasMany(UserLanguage::class);
    }
    /**
     * Get the user added documents.
     */
    public function addedDocuments()
    {
        return $this->hasMany(UserDocument::class, 'uploader_id');
    }

    /**
     * Get the contacts for the user.
     */
    public function contacts()
    {
        return $this->hasMany(UserContact::class);
    }

    /**
     * Get the vacations for the user.
     */
    public function vacations()
    {
        return $this->hasMany(UserVacation::class);
    }

    /**
     * Get user work history.
     */
    public function workHistory()
    {
        return $this->hasMany(UserWorkHistory::class);
    }

    /**
     * Get the bonuses history for the user.
     */
    public function bonuses()
    {
        return $this->hasMany(UserBonus::class)->orderByDesc('date');
    }

    /**
     * Get the assigned projects.
     */
    public function projects()
    {
        return $this->allProjects()->wherePivot('status', '=', '1');
    }

    /**
     * Get the assigned projects.
     */
    public function allProjects()
    {
        return $this->belongsToMany(Project::class, 'user_projects', 'user_id', 'project_id');
    }

    /**
     * A role may be given various permissions.
     */
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members', 'user_id', 'team_id')
            ->withPivot('team_id', 'user_id', 'status');
    }
    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'user_skills', 'user_id', 'skill_id')
            ->withPivot('skill_id', 'user_id');
    }
    public function softSkills()
    {
        return $this->belongsToMany(SoftSkill::class, 'user_soft_skills', 'user_id', 'soft_skill_id')
            ->withPivot('soft_skill_id', 'user_id');
    }

    public function UserSalary()
    {
        return $this->hasMany(UserSalary::class)->orderByDesc('start_date');
    }

    public function UserRelative()
    {
        return $this->hasMany(UserRelative::class);
    }

    public function userJobInformation()
    {
        return $this->hasMany(UserJobInformation::class);
    }

    public function UserNote()
    {
        $request = request();
        $loggedUser = auth()->user();
        return $this->hasMany(UserNote::class)
            ->join('users', 'users.id', '=', 'user_notes.author_of_notes')
            ->selectRaw('users.*, user_notes.*')
            ->where('user_notes.author_of_notes', '=', $loggedUser->id)
            ->where('user_notes.owner_user_id', '=', $request->id)
            ->orWhere('user_notes.owner_user_id', '=', $request->input('id'))
            ->where('notes_type', '=', self::SHARED['value'])
            ->whereJsonContains('shared_users', $loggedUser->id)
            ->orderByDesc('user_notes.created_at');
    }
    public function oauthAccessTokens(){
        return $this->hasMany(OauthAccessToken::class);
    }


    public function scopeNotRole(Builder $query, $roles, $guard = null): Builder
    {
        if ($roles instanceof Collection) {
            $roles = $roles->all();
        }

        if (! is_array($roles)) {
            $roles = [$roles];
        }

        $roles = array_map(function ($role) use ($guard) {
            if ($role instanceof Role) {
                return $role;
            }

            $method = is_numeric($role) ? 'findById' : 'findByName';
            $guard = $guard ?: $this->getDefaultGuardName();

            return $this->getRoleClass()->{$method}($role, $guard);
        }, $roles);

        return $query->whereHas('roles', function ($query) use ($roles) {
            $query->where(function ($query) use ($roles) {
                foreach ($roles as $role) {
                    $query->where(config('permission.table_names.roles').'.id', '!=' , $role->id);
                }
            });
        });
    }

    /**
     * @param $role
     * @return bool
     */
    public function hasOnlyRole($role)
    {
        $roleNames = $this->getRoleNames()->toArray();
        if (count($roleNames) > 1) {
            return false;
        }

        return in_array($role, $roleNames);
    }

    /**
     * @return array
     */
    public function getTeamMemberIds(): array
    {
        $teamIds = $this->getTeamIds();
        if (empty($teamIds)) {
            return [];
        }
        return TeamMember::whereIn('team_id', $teamIds)->pluck('user_id')->toArray();
    }

    /**
     * @return array
     */
    public function getTeamIds(): array
    {
        if ($this->can('view teams')) {
            return Team::get('id')->pluck('id')->toArray();
        }
        return $this->teams()->pluck('teams.id')->toArray();
    }

    /**
     * @return array
     */
    public function getProjectIds(): array
    {
        if ($this->can('view projects')) {
            return Project::get('id')->pluck('id')->toArray();
        }
        return $this->projects()->pluck('projects.id')->toArray();
    }

    public function priorityLessOrEqualRoles()
    {
        $priorityLessOrEqualRoles = [];
        $userRoles = $this->getRoleNames()->toArray();
        $roles = Role::pluck('priority', 'name')
            ->sortBy(function ($priority, $name) {
                return $priority;
            });
        $rolePriority = 0;
        foreach ($roles as $role => $priority) {
            if ($rolePriority === 0 && in_array($role, $userRoles)) {
                $rolePriority = $priority;
                $priorityLessOrEqualRoles[] = $role;
            }
            if ($rolePriority !== 0 && $rolePriority <= $priority) {
                $priorityLessOrEqualRoles[] = $role;
            }
        }
        return $priorityLessOrEqualRoles;
    }

    public function priorityHigherRoles()
    {
        $priorityHigherRoles = [];
        $userRoles = $this->getRoleNames()->toArray();
        $roles = Role::pluck('priority', 'name')
            ->sortBy(function ($priority, $name) {
                return $priority;
            });
        foreach ($roles as $role => $priority) {
            if ($priority === 0) {
                continue;
            }
            if (!in_array($role, $userRoles)) {
                $priorityHigherRoles[] = $role;
            } else if (in_array($role, $userRoles)) {
                break;
            }
        }
        return $priorityHigherRoles;
    }

    public function hasLowestPriorityRole($isOnly = false)
    {
        $userRoles = $this->getRoleNames()->toArray();
        $lowestRole = Role::orderBy('priority', 'desc')->first('name');
        if (!$isOnly) {
            return !empty($lowestRole->name) ? in_array($lowestRole->name, $userRoles) : false;
        }
        return !empty($lowestRole->name) ? count($userRoles) === 1 && in_array($lowestRole->name, $userRoles) : false;
    }

    public function hasHighestRole(): bool
    {
        $userRoles = $this->getRoleNames()->toArray();
        $highestRole = Role::orderBy('priority')->first('name');
        return !empty($highestRole->name) && in_array($highestRole->name, $userRoles);
    }

    /**
     * @param array|null $teamIds
     * @return array
     */
    public function teamMembersRolePermissions(array $teamIds = null): array
    {
        return TeamMemberRole::teamMembersRolePermissions($this->id, $teamIds);
    }

    /**
     * @param array|null $projectIds
     * @return array
     */
    public function userProjectsRolePermissions(array $projectIds = null): array
    {
        return UserProjectRole::userProjectsRolePermissions($this->id, $projectIds);
    }

    /**
     * @param string $token
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new MailResetPasswordNotification($token));
    }

    /**
     *
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmailQueued);
    }

    /**
     * @param string $email
     * @return bool
     */
    public function checkActiveUserByEmail(string $email): bool
    {
        return self::where('email', $email)->active()->exists();
    }

    /**
     * @param object $data
     * @return object
     */
    public function userRegistration(object $data): object
    {
        $user = self::create([
            'name' => $data->name,
            'surname' => $data->surname,
            'email' => $data->email,
            'password' => bcrypt($data->password),
        ]);

        $user->contacts()->saveMany([
            new UserContact([
                'type' => 'mobile',
                'name' => 'phoneNumber',
                'value' => $data->phoneNumber,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ])
        ]);
        $user->assignRole(Role::STAFF);
        $user->sendEmailVerificationNotification();

        return $user;
    }

    /**
     * @param int $userId
     * @param string $userEmail
     * @return bool
     */
    public function updateUserEmail(int $userId, string $userEmail): bool
    {
        $userData = tap(self::where('id', $userId))->update(['email' => $userEmail, 'email_verified_at' => null])->first();
        if ($userData) {
            $userData->sendEmailVerificationNotification();
            return true;
        }
        return false;
    }
}
