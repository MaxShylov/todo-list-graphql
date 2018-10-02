import React from "react";
import { SortableContainer } from "react-sortable-hoc";
import TaskItem from "../TaskItem/TaskItem";


const SortableList = SortableContainer(({ tasks }) => (
  <ul>
    {tasks.map((task, i) => (<TaskItem key={i} index={i} {...task} />))}
  </ul>
));


export default SortableList;
