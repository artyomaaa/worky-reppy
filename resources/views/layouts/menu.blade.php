<ul>
    <li><a href="{{url('/')}}">{{__('Home')}}</a></li>
    @can('view users')
        <li><a href="{{url('/users')}}">{{__('Users')}}</a></li>
    @endcan
    <li><a href="{{url('/projects')}}">{{__('Projects')}}</a></li>
    <li><a href="{{url('/reports')}}">{{__('Reports')}}</a></li>
    <li><a href="{{url('/teams')}}">{{__('Teams')}}</a></li>
</ul>
