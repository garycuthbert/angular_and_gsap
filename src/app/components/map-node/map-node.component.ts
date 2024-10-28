import { CommonModule } from '@angular/common';
import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { NodeHighlightType, INodeDetails } from '../../model/map.model';

@Component({
  selector: '[app-map-node]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-node.component.html',
  styleUrl: './map-node.component.css'
})
export class MapNodeComponent implements OnInit, DoCheck {
  @Input() node: INodeDetails;
  @Input() tabIndex: number = 0;

  nodeWidth?: number;
  nodeHeight?: number;
  nodeViewBox?: string;
  coreWidth?: number;
  coreHeight?: number;
  coreViewBox?: string;
  readonly nodePrimaryColor: string = "#564E7A";
  readonly accentColor: string = "#455A64";
  headerPath?: string;
  isHovering:boolean = false;

  NodeHighlightType = NodeHighlightType; // This allows the use of the enum in the template
  nodeHighlightFilterUrl: string = "";
  nodeHighlightState = NodeHighlightType.None;

  constructor() {
    this.node = {
      name: 'default',
      id: "",
      xPos: 0,
      yPos: 0,
      selected: false,
      disabled: false
    };
  }

  ngOnInit(): void {
    this.nodeWidth = 160;
    this.nodeHeight = 160;
    this.nodeViewBox = `0 0 ${this.nodeWidth} ${this.nodeHeight}`;

    this.coreWidth = 110;
    this.coreHeight = 110;
    this.coreViewBox = `0 0 ${this.coreWidth} ${this.coreHeight}`;

    this.nodeHighlightFilterUrl = `url(#node-icon-map-highlight-${this.node.id})`;

    this.headerPath= `M0 ` +
                     `21` +
                     `h110
                      v-16
                      q0 -5, -5 -5
                      h-100
                      q-5 0, -5 5
                      Z`;
  }

  ngDoCheck(): void {
    this.updateHighlightState();
  }

  private updateHighlightState(): void {
    if (this.node.selected) {
      this.nodeHighlightState = NodeHighlightType.Selected;
    }
    else if (this.isHovering) {
      this.nodeHighlightState = NodeHighlightType.Focussed;
    } else {
      this.nodeHighlightState = NodeHighlightType.None;
    }
  }
}
