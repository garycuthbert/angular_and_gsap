import { IDraggableMapNode, IMapDetails, INodeDetails } from "../../model/map.model";
import { MapContainerComponent } from "./map-container.component"
import mapsJSON from '../../../assets/maps.json';
import { MapsContentService } from "../../services/maps-content.service";
import { ElementRef, QueryList } from "@angular/core";
import { gsap, Draggable } from "gsap/all";

gsap.registerPlugin(Draggable);

export class MapTopologyHandler {

  public maps: IMapDetails[] = <IMapDetails[]>mapsJSON;

  constructor(
    private mapsContentService: MapsContentService,
    private mapName: string,
    private mapNodes: IDraggableMapNode[],
    private parentComponent: MapContainerComponent,
  ){

  }

  public addNodesToModel(mapName: string, domNodes: QueryList<ElementRef>): void {

    // Build from our data source
    let nodes = this.mapsContentService.getMapDetails(mapName);
    nodes.forEach(node => {
      this.addNodeToModel(node);
    });


    setTimeout(() => {
      // We position the nodes to information read from elsewhere after they have been added to the DOM
      this.setAllDomDefaultPositions(domNodes);
    }, 10);
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

    // Position the node to its required position - in this example it is just part of the model data - in our main application
    // it is retrieved from elswhere.

    // It looks like this is the call that mutates the elements on our tab(s) not currently visible with the overridden getBBox method
    // The initial active tab node elements do have gsap content but not the overridden getBBox method - not sure why this is the case.
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
