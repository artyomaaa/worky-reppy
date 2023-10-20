import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {ConfigProvider, Modal, Form, Row, Col, Button, Input, List, Typography, Menu, Dropdown} from 'antd';
import {I18n, Trans} from '@lingui/react';
import Icons from 'icons/icon';
import {EditItemBtn, PlayBtn, RemoveItemBtn} from '../TasksTable/TaskActionsBtns';
import {checkLoggedUserPermission} from 'utils';
import {PERMISSIONS} from 'utils/constant';
import styles from './TodoModal.less';
import PropTypes from "prop-types";

const AddTodoForm = Form.create()(({sendValue, form}) => {

  const [errorMessage, setErrorMessage] = useState("");
  const {getFieldDecorator, setFieldsValue, getFieldsValue} = form;

  const canAddTodos = checkLoggedUserPermission(PERMISSIONS.ADD_TODOS.name, PERMISSIONS.ADD_TODOS.guard_name);

  const handleSubmit = e => {
    e.preventDefault();
    const values = getFieldsValue();

    if (values.name === '' || !values.name.trim()) {
      setErrorMessage({error: true,});
    } else if (values.name.length >= 191 || !values.name.trim()) {
      setErrorMessage({error: true});
    } else {
      values.name && sendValue(values.name);
      setErrorMessage("");
      setFieldsValue({name: ''});
    }
  };

  if(!canAddTodos) {
    return null;
  }

  return (
    <I18n>
      {({i18n}) => (
        <Form onSubmit={handleSubmit} className="add-task-form">
          <Row type="flex" justify="space-between" align="middle">
            <Col>
              <ConfigProvider>
                <Form.Item>
                  {getFieldDecorator (`name`, {
                    initialValue: '',
                    rules: [
                      {
                        required: true,
                        message: i18n.t`This field is required`
                      },
                      {
                        max: 191,
                        message: i18n.t`Field name is too long!`,
                      },
                    ]
                  }) (<Input
                      type="text"
                      placeholder={i18n.t`Add to do`}
                      autoFocus={true}
                    />)
                  }
                </Form.Item>
              </ConfigProvider>
              <p style={{
                color: "red",
                position: "absolute",
                margin: 0
              }}>{errorMessage.error ? errorMessage.setErrorMessage : null}</p>
            </Col>
            <Col>
              <Button className="app-btn primary-btn" htmlType="submit" block>
                <span>{i18n.t`Add`}</span>
                <Icons name="plus"/>
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </I18n>
  );
})

const TodoModal = (
  {
    showTodoMore,
    show,
    onClose,
    toDoList,
    addTodo,
    deleteTodo,
    updateTodo,
    startTodo,
    fetchMoreTodos,
    toDoTotal,
    addResponse,
    todoLoading
  }) => {
  const [todoEditable, setTodoEditable] = useState({});
  const [newTodoName, setNewTodoName] = useState("");
  const [toDoListItems, setToDoListItems] = useState([]);
  const [toDoListCount, setToDoListCount] = useState(0);
  const [newToDo, setNewToDo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const ref = React.createRef();

  const canEditTodos = checkLoggedUserPermission(PERMISSIONS.EDIT_TODOS.name, PERMISSIONS.EDIT_TODOS.guard_name);
  const canDeleteTodos = checkLoggedUserPermission(PERMISSIONS.DELETE_TODOS.name, PERMISSIONS.DELETE_TODOS.guard_name)

  const handleClick = useCallback(e => {
    if (ref?.current) {
      if (e.target.id === 'edit-save-btn') return;
      if (!ref.current.classList.contains("edit-form") && !e.target.classList.contains("ant-input")) {
        setTodoEditable({});
      }
    }
  }, [ref]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [handleClick]);

  useEffect(() => {
    setNewToDo(addResponse)
  }, [addResponse]);

  useEffect(() => {
    newToDo && setToDoListItems(prevState => ([newToDo, ...prevState]));
    newToDo && setToDoListCount(prevState => ++prevState);
  }, [newToDo]);

  useEffect(() => {
    !toDoListItems && setToDoListItems(toDoList);
  }, [toDoList, toDoListItems]);

  useEffect(() => {
    setToDoListCount(toDoTotal);
  }, [toDoTotal]);

  useEffect(() => {
    !!toDoList && setToDoListItems(prevState => ([...prevState, ...toDoList]));
  }, [toDoList]);

  const handleGetValue = useCallback((value) => {
    addTodo(value);
    setToDoListCount(count => count++);
  }, [addTodo]);

  const isTodoEditable = useCallback((e, item) => {
    setErrorMessage({error: false, setErrorMessage: ''});
    let itemIndex = toDoListItems.findIndex(elem => elem.id === item);
    setTodoEditable({[itemIndex]: true});
  }, [toDoListItems]);

  const editTodo = useCallback((item) => {
    if (newTodoName === "" || newTodoName === item.name) {
      setTodoEditable({});
    }
    if ( !newTodoName.trim() ) {
      setErrorMessage({error: true, setErrorMessage: <Trans>This field is required</Trans>});
      return;
    }
    let itemIndex = toDoListItems.findIndex(elem => elem.id === item.id);
    updateTodo(item.id, newTodoName);
    setTodoEditable({[itemIndex]: false});
    item.name = newTodoName.replace(/  +/g, ' ');
    setNewTodoName('');
  }, [newTodoName, toDoListItems, updateTodo]);

  const removeTodo = useCallback((e, item) => {
    deleteTodo(item);
    setToDoListItems(prevState => ([...prevState.filter(elem => elem.id !== item)]));
    setToDoListCount(count => --count);
  }, [deleteTodo]);

  const playTodo = useCallback((e, todoId) => {
    startTodo(todoId);
    setToDoListItems(prevState => ([...prevState.filter(elem => elem.id !== todoId)]));
  }, [startTodo]);

  const loadMoreTodos = () => {
    fetchMoreTodos();
  }

  const loadMore =
    (showTodoMore &&
      <div className={styles['load-more']}>
        <Button
          onClick={() => loadMoreTodos()}
        >
          MORE
        </Button>
      </div>
    );

  return (
    <I18n>
      {({i18n}) => (
        <Modal
          closeIcon={
            <span className="close-icon" onClick={() => onClose()}>
              <Icons name="close"/>
            </span>
          }
          title={i18n.t`TO DO LIST`}
          centered
          visible={show}
          footer={null}
          className={styles['todo-modal']}
          onOk={onClose}
          onCancel={onClose}
          width="initial"
        >
          {show && <AddTodoForm sendValue={handleGetValue}/>}
          <List loadMore={(toDoListCount !== toDoListItems?.length && todoLoading ||  toDoListItems?.length > 10 ) ? loadMore : null}>
            {toDoListItems?.map((task, index) => (
              !!todoEditable[index] ?
                <React.Fragment key={`${task.id}_${index}`}>
                  <div ref={ref} key={`${task.id}_${index}`} className={styles['edit-form']}>
                    <Input
                      key={task.id}
                      defaultValue={task.name}
                      className={styles['edit-input']}
                      onChange={e => setNewTodoName(e.target.value)}
                      onKeyPress={e => e?.charCode === 13 ? editTodo(task) : null}
                      autoFocus={true}
                    />
                    <button
                      id='edit-save-btn'
                      className={styles['edit-save']}
                      onClick={() => editTodo(task)}
                    >
                      <Trans>Save</Trans>
                    </button>
                  </div>
                  <p style={{color: "red", margin: 0}}>{errorMessage.error ? errorMessage.setErrorMessage : null}</p>
                </React.Fragment>
                :
                <div key={index}>
                  <List.Item extra={<div className="row-actions">
                  <div className="play-task-icon">
                    {PlayBtn(task.id, playTodo, false)}
                  </div>
                  <Dropdown trigger={['click']} placement="bottomLeft" className="dots" overlay={<Menu className="dots-dropdown">
                    <Menu.Item onClick={(e) => isTodoEditable(e, task.id)}>Edit</Menu.Item>
                    <Menu.Item onClick={(e) => removeTodo(e, task.id)}>Delete</Menu.Item>
                  </Menu>}>
                    <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                      <Icons name="dots"/>
                    </a>
                  </Dropdown>
                  <div className="action-icons">
                    {canEditTodos && EditItemBtn(task.id, isTodoEditable, i18n)}
                    {canDeleteTodos && RemoveItemBtn(task.id, removeTodo, i18n)}
                  </div>
                </div>}>
                  <Typography className={styles['todo-name']}> {task.name} </Typography>
                </List.Item>
              <hr/>
                </div>

              ))}
          </List>
        </Modal>
      )}
    </I18n>
  )
}

TodoModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  toDoList: PropTypes.array,
  addTodo: PropTypes.func,
  deleteTodo: PropTypes.func,
  updateTodo: PropTypes.func,
  startTodo: PropTypes.func,
  fetchMoreTodos: PropTypes.func,
  toDoTotal: PropTypes.number,
  addResponse: PropTypes.object,
  todoLoading: PropTypes.bool
};

export default React.memo(TodoModal)
