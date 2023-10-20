<?php

namespace App\Http\Controllers;

use App\Models\WorkTime;
use App\Models\Work;
use Illuminate\Support\Facades\File as FileFacade;
use App\Traits\File;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\PermissionRegistrar;

class ImportantController extends Controller
{
    use File;
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //production mode this must be uncommented, if you want to make any changes you have to comment below 2 lines
        if(env('APP_ENV') === 'production'){
            echo json_encode(['status'=>false, 'message'=>'Bad request. Please contact with administrator.']);
            exit;
        }
    }

    public function clearPermissionsCache(): JsonResponse
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        return response()->json([
            'status' => true,
            'message' => __('success')
        ]);
    }

    public function createResizedAvatars(): JsonResponse
    {
        $publicDir = 'public/images/avatars';
        $dir = storage_path('app/' . $publicDir);
        foreach (scandir($dir) as $userDir) {
            if ($userDir !== '.' && $userDir !== '..') {
                if (FileFacade::isDirectory($dir . '/' . $userDir)) {
                    foreach (scandir($dir . '/' . $userDir) as $img) {
                        if ($img !== '.' && $img !== '..') {
                            $realPath = $dir . '/' . $userDir . '/' . $img;
                            if (!FileFacade::isDirectory($realPath)) {

                                $mdRealPath = $dir . '/' . $userDir . '/' . str_replace('.', '_md.', $img);
                                $countOf = substr_count(str_replace('.', '_md.', $img),'_');
                                if ($countOf === 1 && !FileFacade::exists($mdRealPath)) {
                                    $this->resizeImage($realPath, $publicDir . '/' . $userDir . '/', $img, $sfx = 'md');
                                }

                                $smRealPath = $dir . '/' . $userDir . '/' . str_replace('.', '_sm.', $img);
                                $countOf = substr_count(str_replace('.', '_sm.', $img),'_');
                                if ($countOf === 1 && !FileFacade::exists($smRealPath)) {
                                    $this->resizeImage($realPath, $publicDir . '/' . $userDir . '/', $img, $sfx = 'sm');
                                }

                                $avatarRealPath = $dir . '/' . $userDir . '/' . str_replace('.', '_avatar.', $img);
                                $countOf = substr_count(str_replace('.', '_avatar.', $img),'_');
                                if ($countOf === 1 && !FileFacade::exists($avatarRealPath)) {
                                    $this->resizeImage($realPath, $publicDir . '/' . $userDir . '/', $img, $sfx = 'avatar');
                                }
                            }
                        }
                    }
                }

            }
        }
        return response()->json([
            'status' => true,
            'message' => __('success')
        ]);
    }

    public function fixDuplicateWorks(): JsonResponse
    {
        $userId = request()->user_id;
        if(empty($userId)) {
            return response()->json([
                'status' => false,
                'message' => __('invalid user id param')
            ]);
        }

        $items = \DB::table('works')
            ->select([
                'user_id',
                'project_id',
                'name',
                \DB::raw('count(*) as no_of_records')
            ])
            ->where('user_id', $userId)
//            ->whereNotNull('user_id')
            ->groupBy(\DB::raw('user_id, name, project_id'))
            ->having('no_of_records', '>', 1)
            ->get();

//        $duplicateWorks = [];
        foreach ($items as $k=>$item) {
            $duplicateWorks[$k] = [];
            $queryWorks = Work::where([
                ['user_id', '=', $item->user_id],
                ['name', '=', $item->name],
            ]);
            if(!empty($item->project_id)){
                $queryWorks->where('project_id', '=', $item->project_id);
            } else {
                $queryWorks->whereNull('project_id');
            }
            $workIds = $queryWorks->pluck('id')->toArray();
            $mainWorkId = $workIds[0];
            array_shift($workIds); // removing first main id from array

            $updated = WorkTime::whereIn('work_id', $workIds)
                ->update(['work_id' => $mainWorkId]);
//            $duplicateWorks[$k]['updated'] = $updated;
//            $duplicateWorks[$k]['deleted'] = Work::whereIn('id', $workIds)->delete();
//            $duplicateWorks[$k]['mainWorkId'] = $mainWorkId;
//            $duplicateWorks[$k]['works_count'] = count($workIds) + 1;
//            $duplicateWorks[$k]['workIds'] = $workIds;
        }


        return response()->json([
            'status' => true,
            'message' => __('success'),
//            'duplicateWorks' => $duplicateWorks,
        ]);
    }
}
