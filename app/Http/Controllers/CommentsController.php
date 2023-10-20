<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentsDeleteRequest;
use App\Http\Requests\CommentsEditRequest;
use App\Http\Requests\CommentsGetCommentsRequest;
use App\Http\Requests\CommentsStoreRequest;
use App\Models\Comment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class CommentsController extends Controller
{
    /**
     * @param CommentsGetCommentsRequest $request
     * @return JsonResponse
     */
    public function getComments(CommentsGetCommentsRequest $request)
    {
        // TODO should we add permission check?
        $comments = Comment::where('work_time_id', '=', $request['work_time_id'])
            ->join('users', 'users.id', '=', 'comments.user_id')
            ->select(
                'comments.*',
                'users.name as username',
                'users.avatar as user_avatar'
            )->orderBy('created_at', 'desc')
            ->get();
        return response()->json(['status' => true, 'comments' => $comments]);
    }

    /**
     * @param CommentsStoreRequest $request
     * @return JsonResponse
     */
    public function store(CommentsStoreRequest $request)
    {
        // TODO should we add permission check?
        $loggedUser = auth()->user();
        if($request->user()['id'] === $request->user_id){
            $comment = new Comment();
            $comment->user_id = $request['user_id'];
            $comment->work_time_id = $request['work_time_id'];
            $comment->text = $request['text'];
            $comment->created_at = Carbon::now();
            $comment->updated_at = Carbon::now();
            if($request->parent_id){
                $comment->parent_id = $request->parent_id;
            }
            if($comment->save()) {
                return Comment::where('work_time_id', '=', $request['work_time_id'])
                    ->whereNull('parent_id')
                    ->join('users', 'users.id', '=', 'comments.user_id')
                    ->select(
                        'comments.*',
                        'users.name as username',
                        'users.avatar as user_avatar'
                    )
                    ->orderBy('created_at', 'desc')
                    ->limit(1)
                    ->get();
            }
        }
        return response()->json(['status' => false, 'message'=> __('messages.Something went wrong')]);
    }

    /**
     * @param CommentsEditRequest $request
     * @return JsonResponse
     */
    public function edit(CommentsEditRequest $request)
    {
        // TODO should we add permission check?
        $comment = Comment::where('id', '=', $request['id'])->first();
        if($comment->user_id === $request->user()['id']){
            $comment->text = $request['text'];
            if($comment->save()){
                $comments = Comment::where('id', '=', $request['id'])->get();
                return response()->json(['status' => true, 'comments' => $comments]);
            }
        }
        return response()->json(['status' => false, 'message'=> __('messages.Something went wrong')]);
    }

    /**
     * @param CommentsDeleteRequest $request
     * @return JsonResponse
     */
    public function delete(CommentsDeleteRequest $request)
    {
        // TODO should we add permission check?
        $comment = Comment::where('id', '=', $request['id'])->first('user_id', 'parent_id');
        if($comment->user_id === $request->user()['id']) {
            $remove = Comment::where('id', '=', $request['id']);
            if(!$comment->parent_id) {
                $remove->orWhere('parent_id', '=', $request['id']);
            }
            $remove->delete();
            if ($remove) {
                $comment = Comment::where('work_time_id', '=', $request['work_time_id'])
                    ->whereNull('parent_id')
                    ->join('users', 'users.id', '=', 'comments.user_id')
                    ->select(
                        'comments.*',
                        'users.name as username',
                        'users.avatar as user_avatar'
                    )->orderBy('created_at', 'desc')->limit(1)
                    ->get();
                return response()->json(['status' => true, 'comments' => $comment]);
            }
        }
        return response()->json(['status' => false, 'message'=> __('messges.Something went wrong')]);
    }
}
