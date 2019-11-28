import { createStore } from "create-react-store";

export type Filter = "all" | "active" | "completed";

export default createStore<{ value: Filter }>({
  value: "all"
});
