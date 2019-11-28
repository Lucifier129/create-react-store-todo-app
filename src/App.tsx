import React, { FC } from "react";
import {
  useAction,
  Provider,
  remove,
  useReactive,
  enableTracing
} from "create-react-store";
import cx from "classnames";
import * as stores from "./stores";
import { Todo } from "./stores/todos";
import { Filter } from "./stores/filter";

if (process.env.NODE_ENV === "development") {
  enableTracing();
}

const App: React.FC = () => {
  return (
    <Provider stores={Object.values(stores)}>
      <section className="todoapp">
        <Header />
        <section className="main">
          <Toggler />
          <TodoList />
        </section>
        <Footer />
      </section>
      <Info />
    </Provider>
  );
};

const Header: React.FC = () => {
  let header = stores.header.useData();
  let todos = stores.todos.useData();

  let handleChange = useAction(({ target }) => {
    header.text = target.value;
  });

  let handleKeyUp = useAction(({ key }: React.KeyboardEvent) => {
    if (key !== "Enter") return;

    if (header.text === "") {
      alert("todo content is empty");
      return;
    }

    let todo: Todo = {
      id: Math.random(),
      content: header.text,
      completed: false
    };

    todos.push(todo);
    header.text = "";
  });

  return (
    <header className="header">
      <h1>todos</h1>
      <input
        className="new-todo"
        placeholder="What needs to be done?"
        value={header.text}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        autoFocus
      />
    </header>
  );
};

const TodoList: React.FC = () => {
  let todos = stores.todos.useData();
  let filter = stores.filter.useData();

  let list = todos.filter(todo => {
    if (filter.value === "all") {
      return true;
    }

    if (filter.value === "active") {
      return !todo.completed;
    }

    if (filter.value === "completed") {
      return todo.completed;
    }

    return false;
  });

  return (
    <ul className="todo-list">
      {list.map(todo => {
        return <TodoItem key={todo.id} todo={todo} />;
      })}
    </ul>
  );
};

const TodoItem: FC<{ todo: Todo }> = ({ todo }) => {
  let edit = useReactive({
    enable: false,
    content: ""
  });

  let handleEnableEditing = useAction(() => {
    edit.enable = true;
    edit.content = todo.content;
  });

  let handleDisableEditing = useAction(() => {
    edit.enable = false;
    edit.content = "";
  });

  let handleEditing = useAction(({ target }) => {
    edit.content = target.value;
  });

  let handleSubmit = useAction(() => {
    if (edit.content === "") {
      handleRemove();
      return;
    }
    todo.content = edit.content;
    handleDisableEditing();
  });

  let handleKeyUp: React.KeyboardEventHandler = useAction(event => {
    if (event.key === "Enter") {
      handleSubmit();
    }
    if (event.key === "Escape") {
      handleDisableEditing();
    }
  });

  let handleToggle = useAction(() => {
    todo.completed = !todo.completed;
  });

  let handleRemove = useAction(() => {
    remove(todo);
  });

  return (
    <li className={cx({ completed: todo.completed, editing: edit.enable })}>
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onClick={handleToggle}
          onChange={() => {}}
        />
        <label onDoubleClick={handleEnableEditing}>{todo.content}</label>
        <button className="destroy" onClick={handleRemove}></button>
      </div>
      {edit.enable && (
        <input
          className="edit"
          value={edit.content}
          onChange={handleEditing}
          onBlur={handleSubmit}
          onKeyUp={handleKeyUp}
          autoFocus
        />
      )}
    </li>
  );
};

const Toggler: React.FC = () => {
  let todos = stores.todos.useData();

  let isAllCompleted = todos.every(todo => todo.completed);

  let handleToggleAll = useAction(() => {
    todos.forEach(todo => {
      todo.completed = !isAllCompleted;
    });
  });

  if (todos.length === 0) {
    return null;
  }

  return (
    <>
      <input
        className="toggle-all"
        checked={isAllCompleted}
        type="checkbox"
        onChange={() => {}}
      />
      <label onClick={handleToggleAll}>Mark all as complete</label>
    </>
  );
};

const Footer: React.FC = () => {
  let filter = stores.filter.useData();
  let todos = stores.todos.useData();

  let activeTodos = todos.filter(todo => !todo.completed);
  let completedTodos = todos.filter(todo => todo.completed);

  let handleFilterChange = useAction((selectedFilter: Filter) => {
    filter.value = selectedFilter;
  });

  let handleClearCompleted = useAction(() => {
    todos.length = 0;
    todos.push(...activeTodos);
  });

  if (todos.length === 0) {
    return null;
  }

  let aLen = activeTodos.length;
  let cLen = completedTodos.length;

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{aLen}</strong> {aLen === 1 ? "item" : "items"} left
      </span>
      <ul className="filters">
        <FilterItem
          selected={filter.value === "all"}
          onClick={() => handleFilterChange("all")}
        >
          All
        </FilterItem>
        <FilterItem
          selected={filter.value === "active"}
          onClick={() => handleFilterChange("active")}
        >
          Active
        </FilterItem>
        <FilterItem
          selected={filter.value === "completed"}
          onClick={() => handleFilterChange("completed")}
        >
          Completed
        </FilterItem>
      </ul>
      {cLen > 0 && (
        <button className="clear-completed" onClick={handleClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
};

interface FilterItemProps {
  onClick: React.MouseEventHandler;
  selected: boolean;
}

const FilterItem: FC<FilterItemProps> = ({ children, onClick, selected }) => {
  let handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onClick) onClick(event);
  };
  return (
    <li>
      <a className={selected ? "selected" : ""} onClick={handleClick}>
        {children}
      </a>
    </li>
  );
};

const Info: FC = () => {
  return (
    <footer className="info">
      <p>Double-click to edit a todo</p>
      <p>
        Github{" "}
        <a href="https://github.com/Lucifier129/create-react-store-todo-app">
          create-react-store-todo-app
        </a>
      </p>
      <p>
        Powerd by{" "}
        <a href="https://github.com/Lucifier129/create-react-store">
          create-react-store
        </a>
      </p>
    </footer>
  );
};

export default App;
