<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

use App\Http\Controllers\TodosController;
use App\Http\Controllers\UserRolesController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\ImportantController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\WorksController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\TeamsController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\VerificationController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('auth/registration', [AuthController::class, 'registration'])->name('auth.registration');

Route::post('password/email', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');
Route::post('password/reset', [ResetPasswordController::class, 'reset'])->name('password.reset');


// Important controller
Route::post('important/createResizedAvatars', [ImportantController::class, 'createResizedAvatars'])->name('important.createResizedAvatars');
Route::get('important/clearPermissionsCache', [ImportantController::class, 'clearPermissionsCache'])->name('important.clearPermissionsCache');
Route::post('important/fixDuplicateWorks', [ImportantController::class, 'fixDuplicateWorks'])->name('important.fixDuplicateWorks');

Route::group(['middleware' => ['auth:api']], function () {
    Route::get('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/user', [UsersController::class, 'index'])->name('users.index');

    Route::get('email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');
    Route::post('email/resend', [VerificationController::class, 'resend'])->name('verification.resend');

    Route::group(['middleware' => ['active.user']], function () {
        Route::get('home', [HomeController::class, 'index'])->name('home');

        // Users
        Route::get('users/userRoles', [UsersController::class, 'userRoles'])->name('user.userRoles');
        Route::get('users/userSkills', [UsersController::class, 'userSkills'])->name('user.userSkills');
        Route::get('users/userSoftSkills', [UsersController::class, 'userSoftSkills'])->name('user.userSoftSkills');
        Route::get('users/teamIds', [UsersController::class, 'teamIds'])->name('user.teamIds');
        Route::get('users/userPositions',  [UsersController::class, 'userPositions'])->name('user.userPositions');
        Route::put('users/userSalary', [UsersController::class, 'userSalary'])->name('user.userSalary'); // TODO the action doesn't exist
        Route::get('users/list', [UsersController::class, 'list'])->name('users.list');
        Route::get('users/{id}', [UsersController::class, 'show'])->where('id', '[0-9]+')->name('users.show');
        Route::get('users/{id}/selectedDayNote', [UsersController::class, 'getSelectedDayNote'])->where('id', '[0-9]+')->name('user.getSelectedDayNote');
        Route::get('users/{id}/selectedMonthNotes', [UsersController::class, 'getSelectedMonthNotes'])->where('id', '[0-9]+')->name('user.getSelectedMonthNotes');
        Route::get('users/{id}/headerInfo', [UsersController::class, 'getUserDetailsHeaderInfo'])->where('id', '[0-9]+')->name('users.getUserDetailsHeaderInfo');
        Route::get('users/{id}/personalInfo', [UsersController::class, 'getPersonalInformation'])->where('id', '[0-9]+')->name('users.getPersonalInformation');
        Route::get('users/{id}/jobInfo', [UsersController::class, 'getJobInformation'])->where('id', '[0-9]+')->name('users.getJobInformation');
        Route::get('users/{id}/remuneration', [UsersController::class, 'getRemuneration'])->where('id', '[0-9]+')->name('users.getRemuneration');
        Route::get('users/{id}/eduInfo', [UsersController::class, 'getEducationInformation'])->where('id', '[0-9]+')->name('users.getEducationInformation');
        Route::get('users/{id}/files', [UsersController::class, 'getUserDocuments'])->where('id', '[0-9]+')->name('users.getUserDocuments');
        Route::get('users/{id}/moreInfo', [UsersController::class, 'getMoreInfo'])->where('id', '[0-9]+')->name('users.getMoreInfo');
        Route::get('users/{id}/contactInfo', [UsersController::class, 'getContactInformation'])->where('id', '[0-9]+')->name('users.getContactInformation');
        Route::post('users/collegeInformation', [UsersController::class, 'createOrUpdateCollegeInformation'])->name('users.createOrUpdateCollegeInformation');
        Route::post('users/schoolInformation', [UsersController::class, 'createOrUpdateSchoolInformation'])->name('users.createOrUpdateSchoolInformation');
        Route::post('users/universityInformation', [UsersController::class, 'createOrUpdateUniversityInformation'])->name('users.createOrUpdateUniversityInformation');
        Route::post('users/languageInformation', [UsersController::class, 'updateLanguageInformation'])->name('users.updateLanguageInformation');
        Route::post('users/militaryInformation', [UsersController::class, 'createOrUpdateMilitaryInformation'])->name('users.createOrUpdateMilitaryInformation');
        Route::delete('users/removeEducation', [UsersController::class, 'removeEducation'])->name('users.removeEducation');
        Route::delete('users/removeDocument', [UsersController::class, 'removeDocument'])->name('users.removeDocument');
        Route::post('users/addSocialNetwork', [UsersController::class, 'addSocialNetwork'])->name('users.addSocialNetwork');
        Route::post('users/addWebSite', [UsersController::class, 'addWebSite'])->name('users.addWebSite');
        Route::post('users/updateUserContactInformation', [UsersController::class, 'updateUserContactInformation'])->name('users.updateUserContactInformation');
        Route::delete('users/deleteItemContactInfo', [UsersController::class, 'deleteItemContactInfo'])->name('users.deleteItemContactInfo');
        Route::get('users/{id}/contactInfo', [UsersController::class,'getContactInformation'])->where('id', '[0-9]+')->name('users.getContactInformation');
        Route::post('users/userNotesInformation', [UsersController::class,'updateOrCreateNotesInformation'])->name('users.updateOrCreateNotesInformation');
        Route::post('users/{id}/notesInfo', [UsersController::class,'getNotesInformation'])->name('users.getNotesInformation');
        Route::get('users/queryForNoteActiveUsers', [UsersController::class,'queryForNoteActiveUsers'])->name('users.queryForNoteActiveUsers');
        Route::get('users/getCasualInformation', [UsersController::class, 'getCasualInformation'])->name('users.getCasualInformation');
        Route::post('users/createOrUpdateCasualInformation', [UsersController::class, 'createOrUpdateCasualInformation'])->name('users.createOrUpdateCasualInformation');
        Route::delete('users/removeCasualInformation', [UsersController::class, 'removeCasualInformation'])->name('users.removeCasualInformation');
        Route::delete('users/removeNote', [UsersController::class,'removeNote'])->name('users.removeNote');
        Route::post('users/details', [UsersController::class, 'updateDetails'])->name('users.updateDetails');
        Route::post('users/uploadAvatar', [UsersController::class, 'uploadAvatar'])->name('users.uploadAvatar');
        Route::post('users/personalInformation', [UsersController::class, 'updatePersonalInformation'])->name('users.updatePersonalInformation');
        Route::delete('users/removeJobInformation', [UsersController::class, 'removeJobInformation'])->name('users.removeJobInformation');
        Route::post('users/jobInformation', [UsersController::class, 'updateJobInformation'])->name('users.updateJobInformation');
        Route::post('users/updateRemuneration', [UsersController::class, 'updateRemuneration'])->name('users.updateRemuneration');
        Route::post('users/updateJobType', [UsersController::class, 'updateJobType'])->name('users.updateJobType');
        Route::post('users/updateUserSalary', [UsersController::class, 'updateUserSalary'])->name('users.updateUserSalary');
        Route::post('users/addUserSalary', [UsersController::class, 'addUserSalary'])->name('users.addUserSalary');
        Route::post('users/addUserBonus', [UsersController::class, 'addUserBonus'])->name('users.addUserBonus');
        Route::post('users/updateUserBonus', [UsersController::class, 'updateUserBonus'])->name('users.updateUserBonus');
        Route::delete('user/deleteUserBonus', [UsersController::class, 'deleteUserBonus'])->name('users.deleteUserBonus');
        Route::post('users/files', [UsersController::class, 'updateUserDocuments'])->name('users.updateUserDocuments');
        Route::post('users/vacation', [UsersController::class, 'createVacation'])->name('users.createVacation');
        Route::post('users/updateVacation', [UsersController::class, 'updateVacation'])->name('users.updateVacation');
        Route::delete('users/removeVacation', [UsersController::class, 'removeVacation'])->name('users.removeVacation');
        Route::post('users/workHistory', [UsersController::class, 'createWorkHistory'])->name('users.createUserWorkHistory');
        Route::get('users/export', [UsersController::class, 'export'])->name('users.export');
        Route::post('users/contactInformation', [UsersController::class,'updateContactInformation'])->name('users.updateContactInformation');
        Route::get('users/fullCalendar', [UsersController::class,'fullCalendar'])->name('users.fullCalendar');
        Route::put('users/updateUserEmail', [UsersController::class, 'updateUserEmail'])->name('user.updateUserEmail');
        Route::delete('user/deleteUserSalary', [UsersController::class, 'deleteUserSalary'])->name('users.deleteUserSalary');
        // Projects
        Route::get('projects/users', [ProjectsController::class, 'users'])->name('projects.users');
        Route::get('projects/userRoles', [ProjectsController::class, 'userRoles'])->name('projects.userRoles');
        Route::get('projects/technologies', [ProjectsController::class, 'technologies'])->name('projects.technologies');
        Route::get('projects/list', [ProjectsController::class, 'list'])->name('projects.list');
        Route::get('projects/{id}', [ProjectsController::class, 'show'])->where('id', '[0-9]+')->name('projects.show');
        Route::get('projects/export', [ProjectsController::class, 'export'])->name('projects.export');
        Route::get('projects/projectMembers', [ProjectsController::class, 'projectMembers'])->name('projects.projectMembers');
        Route::get('projects/projectMemberHistory', [ProjectsController::class, 'projectMemberHistory'])->name('projects.projectMemberHistory');
        Route::post('projects/updateProjectMemberHistory', [ProjectsController::class, 'updateProjectMemberHistory'])->name('projects.updateProjectMemberHistory');
        Route::delete('projects/removeProjectMemberHistory', [ProjectsController::class, 'removeProjectMemberHistory'])->name('projects.removeProjectMemberHistory');
        Route::put('projects/unassignedMemberFromProject', [ProjectsController::class, 'unassignedMemberFromProject'])->name('projects.unassignedMemberFromProject');
        // Works
        Route::get('tasks/projectList', [WorksController::class, 'projectList'])->name('tasks.projectList');
        Route::get('tasks/tagsList', [WorksController::class, 'tagsList'])->name('tasks.tagsList');
        Route::delete('tasks/removeWorkTime', [WorksController::class, 'removeWorkTime'])->name('tasks.removeWorkTime');
        Route::post('tasks/stop', [WorksController::class, 'stop'])->name('tasks.stop');
        Route::post('tasks/startNewWork', [WorksController::class, 'startNewWork'])->name('tasks.startNewWork');
        Route::post('tasks/startWorkFromTodo', [WorksController::class, 'startWorkFromTodo'])->name('tasks.startWorkFromTodo');
        Route::post('tasks/start', [WorksController::class, 'start'])->name('tasks.start');
        Route::get('tasks/list', [WorksController::class, 'list'])->name('tasks.list');
        Route::post('tasks', [WorksController::class, 'store'])->name('tasks.store');
        Route::get('tasks/{id}', [WorksController::class, 'show'])->where('id', '[0-9]+')->name('tasks.show');
        Route::put('tasks/{work}', [WorksController::class, 'update'])->name('tasks.update');
        Route::patch('tasks/submitOrResetDayReports', [WorksController::class, 'submitOrResetDayReports'])->name('tasks.submitOrResetDayReports');
        Route::delete('tasks/{work}', [WorksController::class, 'destroy'])->name('tasks.destroy');
        Route::post('tasks/delete', [WorksController::class, 'delete'])->name('tasks.delete'); // TODO the action doesn't exist
        Route::get('tasks/works', [WorksController::class, 'getWorks'])->name('tasks.getWorks');
        Route::get('tasks/search', [WorksController::class, 'search'])->name('tasks.search');
        Route::get('tasks/getTags', [WorksController::class, 'getTags'])->name('tasks.getTags');
        Route::post('tasks/createTag', [WorksController::class, 'createTag'])->name('tasks.createTag');
        Route::delete('tasks/tags/{id}', [WorksController::class, 'deleteTag'])->where('id', '[0-9]+')->name('tasks.deleteTag');
        Route::patch('tasks/tags/{id}', [WorksController::class, 'updateTag'])->name('tasks.updateTag');
        Route::post('tasks/searchTask', [WorksController::class, 'searchTask'])->name('tasks.searchTask');
        Route::post('tasks/updateActiveTask', [WorksController::class, 'updateActiveTask'])->name('tasks.updateActiveTask');
        Route::post('tasks/startWorkFromFullCalendar', [WorksController::class, 'startWorkFromFullCalendar'])->name('tasks.startWorkFromFullCalendar');
        Route::post('tasks/stopWorkFromFullCalendar', [WorksController::class, 'stopWorkFromFullCalendar'])->name('tasks.stopWorkFromFullCalendar');
        Route::post('tasks/addEventForFullCalendar', [WorksController::class, 'addEventForFullCalendar'])->name('tasks.addEventForFullCalendar');
        Route::post('tasks/updateEventForFullCalendar', [WorksController::class, 'updateEventForFullCalendar'])->name('tasks.updateEventForFullCalendar');


        // Reports
        Route::get('reports/users', [ReportsController::class, 'users'])->name('reports.users');
        Route::get('reports/projectWorkList', [ReportsController::class, 'projectWorkList'])->name('reports.projectWorkList');
        Route::get('reports/projectMemberList', [ReportsController::class, 'projectMemberList'])->name('reports.projectMemberList');
        Route::get('reports/projects', [ReportsController::class, 'projects'])->name('reports.projects');
        Route::get('reports/teams', [ReportsController::class, 'teams'])->name('reports.teams');
        Route::get('reports/list', [ReportsController::class, 'list'])->name('reports.list');
        Route::get('reports/projectsList', [ReportsController::class, 'projectsList'])->name('reports.projectsList');
        Route::get('/reports/details/list', [ReportsController::class, 'detailsList'])->name('reports.detailsList');
        Route::get('/reports/financial/list', [ReportsController::class, 'financialList'])->name('reports.financialList');
        Route::get('/reports/userReport/list', [ReportsController::class, 'userReportList'])->name('reports.userReportList');
        Route::get('/reports/projectTimeList', [ReportsController::class, 'projectTimeList'])->name('reports.projectTimeList');
        Route::get('/reports/projectTimeExportData', [ReportsController::class, 'projectTimeExportData'])->name('reports.projectTimeExportData');
        Route::get('/reports/financial/export', [ReportsController::class, 'exportFinancialList'])->name('reports.exportFinancialList');
        Route::get('/reports/summary/export', [ReportsController::class, 'exportSummaryList'])->name('reports.exportSummaryList');
        Route::get('/reports/details/export', [ReportsController::class, 'exportDetailsList'])->name('reports.exportDetailsList');
        Route::get('/reports/nowWorkingOnTasks', [ReportsController::class, 'nowWorkingOnTasks'])->name('reports.nowWorkingOnTasks');
        Route::get('/reports/efforts', [ReportsController::class, 'efforts'])->name('reports.efforts');

        // Teams
        Route::get('teams/users', [TeamsController::class, 'users'])->name('teams.users');
        Route::get('teams/projects', [TeamsController::class, 'projects'])->name('teams.projects');
        Route::get('teams/list', [TeamsController::class, 'list'])->name('teams.list');
        Route::post('teams', [TeamsController::class, 'store'])->name('teams.store');
        Route::get('teams/{id}', [TeamsController::class, 'show'])->where('id', '[0-9]+')->name('teams.show');
        Route::put('teams/{team}', [TeamsController::class, 'update'])->name('teams.update');
        Route::patch('teams/{team}', [TeamsController::class, 'update'])->name('teams.update_patch');
        Route::post('teams/changeTeamStatus', [TeamsController::class, 'changeTeamStatus'])->name('teams.changeTeamStatus');
        Route::delete('teams/{team}', [TeamsController::class, 'destroy'])->name('teams.destroy');
        Route::post('teams/delete', [TeamsController::class, 'delete'])->name('teams.delete');
        Route::get('teams/memberRoles', [TeamsController::class, 'memberRoles'])->name('teams.memberRoles');
        Route::get('teams/export', [TeamsController::class, 'export'])->name('teams.export');

        // Dashboard
        Route::get('dashboard/reportList', [DashboardController::class, 'reportList'])->name('dashboard.reportList');
        Route::get('dashboard/mostTracked/{id}', [DashboardController::class, 'mostTracked'])->where('id', '[0-9]+')->name('dashboard.mostTracked');
        Route::get('dashboard/activities', [DashboardController::class, 'activities'])->name('dashboard.activities');
        Route::get('dashboard/weeklyActivity', [DashboardController::class, 'weeklyActivity'])->name('dashboard.weeklyActivity');
        Route::get('dashboard/getUserProjects', [DashboardController::class, 'getUserProjects'])->name('dashboard.userProjects');

        Route::get('comments/getComments', [CommentsController::class, 'getComments'])->name('comments.getComments');
        Route::post('comments/store', [CommentsController::class, 'store'])->name('comments.store');
        Route::post('comments/edit', [CommentsController::class, 'edit'])->name('comments.edit');
        Route::delete('comments/delete', [CommentsController::class, 'delete'])->name('comments.delete');

        // Google
        Route::get('google/checkCalendarConnection/{userId}', [GoogleController::class, 'checkCalendarConnection'])->where('userId', '[0-9]+')->name('google.checkCalendarConnection');
        Route::get('google/authUrl/{userId}', [GoogleController::class, 'authUrl'])->where('userId', '[0-9]+')->name('google.authUrl');
        Route::post('google/addCalendarToken/{userId}', [GoogleController::class, 'addCalendarToken'])->where('userId', '[0-9]+')->name('google.addCalendarToken');
        Route::post('google/removeCalendarToken/{userId}', [GoogleController::class, 'removeCalendarToken'])->where('userId', '[0-9]+')->name('google.removeCalendarToken');

        // Todos
        Route::get('todos/list', [TodosController::class, 'list'])->name('todos.list');
        Route::post('todos', [TodosController::class, 'store'])->name('todos.store');
        Route::get('todos/{id}', [TodosController::class, 'show'])->where('id', '[0-9]+')->name('todos.show');
        Route::put('todos/{id}', [TodosController::class, 'update'])->where('id', '[0-9]+')->name('todos.update');
        Route::delete('todos/{id}', [TodosController::class, 'destroy'])->where('id', '[0-9]+')->name('todos.destroy');
        Route::get('todos/totalTodos', [TodosController::class, 'totalTodos'])->name('todos.totalTodos');

        // Users
        Route::get('users', [UsersController::class, 'index'])->name('users.index_list');
        Route::post('users', [UsersController::class, 'store'])->name('users.store');
        Route::post('users/update', [UsersController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UsersController::class, 'destroy'])->name('users.destroy');


        // Projects
        Route::post('projects', [ProjectsController::class, 'store'])->name('projects.store');
        Route::put('projects/{id}', [ProjectsController::class, 'update'])->where('id', '[0-9]+')->name('projects.update');
        Route::patch('projects/{id}', [ProjectsController::class, 'update'])->where('id', '[0-9]+')->name('projects.update_patch'); // TODO maybe no need
        Route::delete('projects/{id}', [ProjectsController::class, 'destroy'])->where('id', '[0-9]+')->name('projects.destroy');
    });

    // now only administrator can do this
    Route::group(['middleware' => ['role:Administrator']], function () {
        Route::get('userRoles/getAllUserList', [UserRolesController::class, 'getAllUserList'])->name('userRoles.getAllUserList');
        Route::get('userRoles/roles', [UserRolesController::class, 'roles'])->name('userRoles.roles');
        Route::get('userRoles/show', [UserRolesController::class, 'show'])->name('userRoles.show');
        Route::post('userRoles/roles', [UserRolesController::class, 'store'])->name('userRoles.store');
        Route::put('userRoles/roles/{id}', [UserRolesController::class, 'update'])->where('id', '[0-9]+')->name('userRoles.update');
        Route::delete('userRoles/roles/{id}', [UserRolesController::class, 'destroy'])->where('id', '[0-9]+')->name('userRoles.destroy');
        Route::post('userRoles/addPermissionToRole', [UserRolesController::class, 'addPermissionToRole'])->name('userRoles.addPermissionToRole');
        Route::post('userRoles/removePermissionFromRole', [UserRolesController::class, 'removePermissionFromRole'])->name('userRoles.removePermissionFromRole');
        Route::post('userRoles/addDefaultPermissionsToRole', [UserRolesController::class, 'addDefaultPermissionsToRole'])->name('userRoles.addDefaultPermissionsToRole');
        Route::post('userRoles/assignUsersToRole', [UserRolesController::class, 'assignUsersToRole'])->name('userRoles.assignUsersToRole');
    });
});

// Example of usage
//Route::group(['middleware' => ['permission:publish articles|edit articles']], function () {
//    //
//});
//
//Route::group(['middleware' => ['role_or_permission:super-admin|edit articles']], function () {
//    //
//});
