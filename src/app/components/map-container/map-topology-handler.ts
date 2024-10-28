import { IDraggableMapNode, IMapDetails, INodeDetails } from "../../model/map.model";
import { MapContainerComponent } from "./map-container.component"
import mapsJSON from '../../../assets/maps.json';
import { MapsContentService } from "../../services/maps-content.service";
import { ElementRef, QueryList } from "@angular/core";
import { gsap, Draggable } from "gsap/all";

gsap.registerPlugin(Draggable);

export class MapTopologyHandler {

  public maps: IMapDetails[] = <IMapDetails[]>mapsJSON;

  //private timer1: NodeJS.Timer | undefined;

  constructor(
    private mapsContentService: MapsContentService,
    private mapName: string,
    private mapNodes: IDraggableMapNode[],
    private parentComponent: MapContainerComponent,
  ){

  }

  public onDestroy(): void {
    // if (this.timer1 != null) {
    //   clearTimeout(this.timer1);
    // }
  }

  public addNodesToModel(mapName: string, domNodes: QueryList<ElementRef>): void {

    // Clear out any previous content
    this.deleteAllDraggableNodes();

    // Build from our data source
    let nodes = this.mapsContentService.getMapDetails(mapName);
    nodes.forEach(node => {
      this.addNodeToModel(node);
    });

    setTimeout(() => {
      this.setAllDomDefaultPositions(domNodes);
    }, 10);
  }

  public makeNodeDraggable(domNodes: QueryList<ElementRef>, mapNodeIndex: number): void {
    if (mapNodeIndex < 0 || mapNodeIndex >= this.mapNodes.length) {
      console.error(`Invalid map node index ${mapNodeIndex} for map ${this.mapName}`);
      return;
    }

    const node = this.mapNodes[mapNodeIndex];
    if (node.draggable == null) {
      if (domNodes) {
        const domNode = domNodes.find((domNode: ElementRef) => domNode.nativeElement.id === node.id);
        if (!domNode) {
          console.error(`DOM node ${node.id} not found for map ${this.mapName} unable to make node draggable`);
          return;
        }

        // Make the node draggable
        node.draggable = Draggable.create(domNode.nativeElement, {
          type: 'x,y',
          minDuration: 6,
          onDragStart: this.onNodeDragStart,
          onDragStartParams: [node.id],
          onDrag: this.onNodeDrag,
          onDragParams: [node.id],
          onDragEnd: this.onNodeDragEnd,
          onDragEndParams: [node.id],
          callbackScope: this
        })[0];

        node.draggable.update();
      } else {
        console.error(`DOM nodes not found for map ${this.mapName} unable to make node ${node.id} draggable`);
      }
    }
  }

  private addNodeToModel(node: INodeDetails): void {
    this.mapNodes.push({
      ...node,
      draggable: null,
        outerWidth: 0,
        outerHeight: 0,
        coreWidth: 0,
        coreHeight: 0
    });
  }

  private onNodeDragStart(id: string): void {
    console.log(`Node ${id} drag started`);
  }

  private onNodeDrag(id: string): void {
    console.log(`Node ${id} dragging in progress`);
  }

  private onNodeDragEnd(id: string): void {
    console.log(`Node ${id} drag ended`);
  }

  private deleteAllDraggableNodes(): void {
    // Check for Draggable instances and kill them
    for (let i = 0; i < this.mapNodes.length; i++) {
      this.mapNodes[i].draggable?.kill();
    }

    // Clear the collection
    this.mapNodes.length = 0;
  }

  private setAllDomDefaultPositions(domeNodes: QueryList<ElementRef>): void {
    for (let i = 0; i < this.mapNodes.length; i++) {
      this.setNodeDomDefaultPosition(domeNodes, this.mapNodes[i].id);
    }
  }

  private setNodeDomDefaultPosition(domNodes: QueryList<ElementRef>, nodeId: string) {
    const domNode = domNodes.find(node => node.nativeElement.id === nodeId);
    if (domNode == null) {
      console.error(`Node with id ${nodeId} not found in the DOM`);
      return;
    }

    const nodeIndex = this.mapNodes.findIndex(node => node.id === nodeId);
    if (nodeIndex < 0) {
      console.error(`Node with id ${nodeId} not found in the model`);
      return;
    }

    const mapNode = this.mapNodes[nodeIndex];

    gsap.to(
      domNode.nativeElement,
      {
        x: mapNode.xPos,
        y: mapNode.yPos,
        duration: 0
      }
    );
  }

}
