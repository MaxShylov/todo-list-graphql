import React, { Component } from "react";
import { SortableElement } from "react-sortable-hoc";


const SortableItem = SortableElement(({value}) =>
  <li>{value}</li>
);


export default SortableItem;
