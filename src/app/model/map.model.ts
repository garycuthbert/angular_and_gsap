import { Draggable } from "gsap/Draggable";

export interface INodeDetails {
  name: string;
  id: string;
  xPos: number;
  yPos: number;
  selected: boolean;
  disabled: boolean;
}

export interface IMapDetails {
  name: string;
  nodes: INodeDetails[];
}

export interface IRectangleAttributes {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IDraggableMapNode extends INodeDetails {
  draggable: Draggable | null; // The Draggable instance
  outerWidth: number;
  outerHeight: number;
  coreWidth: number;
  coreHeight: number;
}

export enum NodeHighlightType {
  None = "None",
  Selected = "Selected",
  Focussed = "Focussed"
}

