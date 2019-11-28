import { createStore } from "create-react-store";

export type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

export type Todos = Todo[];

export default createStore<Todos>([]);
