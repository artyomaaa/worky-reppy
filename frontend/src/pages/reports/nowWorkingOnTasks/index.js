import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { checkLoggedUserPermission, router } from 'utils';
import {connect} from 'dva';
import {withI18n} from '@lingui/react';
import {Page} from 'components';
import {stringify} from 'qs';
import List from './components/List';
import globalStyles from "themes/global.less";
import Filter from "./components/Filter";
import moment from 'utils/moment';
import store from 'store';
import {PERMISSIONS, DATE_FORMAT} from 'utils/constant';

@withI18n()
@connect(({reportsNowWorkingOnTasks, loading}) => ({reportsNowWorkingOnTasks, loading}))
class NowWorkingOnTasks extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      today: moment().utcOffset(store.get('user')?.time_offset || '+00:00').format(DATE_FORMAT)
    }
  }
  handleRefresh = newQuery => {
    const {location} = this.props;
    const {query, pathname} = location;
    query.page = 1;
    router.push({
      pathname,
      search: stringify(
        {
          ...query,
          ...newQuery,
        },
        {arrayFormat: 'repeat'}
      ),
    })
  };

  get listProps() {
    const {reportsNowWorkingOnTasks} = this.props;
    const {list, workTimeTags} = reportsNowWorkingOnTasks;
    const dataSource = list && list.data ? [...list.data].map(item => {
      item.tags = [];
      for (let i = 0; i < workTimeTags.length; i++){
        if (item.work_time_id === workTimeTags[i].work_time_id) {
          item.tags.push({
            name: workTimeTags[i].name,
            id: workTimeTags[i].tag_id,
            color: workTimeTags[i].color
          });
        }
      }
      return item;
    }) : [];
    return {
      pagination: {
        current: list.current_page,
        total: list.total,
        pageSize: parseInt(list.per_page),
      },
      dataSource: dataSource,
      onChange: page => {
        this.handleRefresh({
          page: page.current,
          pageSize: parseInt(page.pageSize),
        })
      }
    }
  }

  get filterProps() {
    const {location, reportsNowWorkingOnTasks} = this.props;
    const {query} = location;
    const {teams, projects, users} = reportsNowWorkingOnTasks;
    return {
      filter: {
        ...query,
      },
      teams,
      projects,
      users,
      onFilterChange: value => {
        this.handleRefresh({
          ...value,
          page: 1,
          pageSize: 10,
        })
      }
    }
  }
  get permissions() {
    return {
      canViewNowWorkingOnTasks: checkLoggedUserPermission(PERMISSIONS.VIEW_NOW_WORKING_ON_TASKS.name, PERMISSIONS.VIEW_NOW_WORKING_ON_TASKS.guard_name)
    }
  }

  render() {
    const {i18n} = this.props;
    const {canViewNowWorkingOnTasks} = this.permissions;
    if (!canViewNowWorkingOnTasks) {
      return <>
        <h1>{i18n.t`Access Denied`}</h1>
      </>
    }

    return (
      <Page inner>
        <Page.Head>
          <Filter {...this.filterProps} />
        </Page.Head>
        <Page.Head>
          <h2 className={'text-center'}>{this.state.today}</h2>
        </Page.Head>
        <div className={`${globalStyles['table-align-left']} ${globalStyles['global-table']}`}>
          <List {...this.listProps} />
        </div>
      </Page>
    )
  }
}

NowWorkingOnTasks.propTypes = {
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
};

export default NowWorkingOnTasks;
