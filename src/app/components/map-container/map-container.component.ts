import { AfterViewInit, Component, ElementRef, inject, Input, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap, Draggable } from 'gsap/all';
import { IDraggableMapNode } from '../../model/map.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MapNodeComponent } from '../map-node/map-node.component';
import { MapTopologyPan } from './map-topology-pan';
import { MapTopologyHandler } from './map-topology-handler';
import { MapsContentService } from '../../services/maps-content.service';

// Necessary for greensock api use.
gsap.registerPlugin(Draggable);

@Component({
  selector: 'app-map-container',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MapNodeComponent
  ],
  templateUrl: './map-container.component.html',
  styleUrl: './map-container.component.css'
})
export class MapContainerComponent implements OnInit, AfterViewInit, OnDestroy {

  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;

  // Helper class instances
  public mapTopologyPan?: MapTopologyPan;
  public mapTopologyNodeHandler?: MapTopologyHandler;

  // DOM element access
  @ViewChild('mapTopologyZone', { read: ElementRef, static: true}) mapTopologyZone: ElementRef;
  @ViewChild('proxy', { read: ElementRef, static: true }) proxyDomElement: ElementRef;
  @ViewChildren('node', { read: ElementRef }) domNodes: QueryList<ElementRef>;

  @Input() mapName: string;
  @Input() tabIndex: number;

  public readonly mapNodes: IDraggableMapNode[] = [];

  public mapGridEnabled: boolean = true;

  private proxyDraggable: Draggable | null = null;
  private transformedProxyStartingPoint?: SVGPoint;
  private proxyClickInsideNodeBounds: boolean = false;

  constructor(
    private mapsContentService: MapsContentService
  ) {
    this.mapName = 'default';
    this.tabIndex = -1;

    this.mapTopologyZone = new ElementRef(null);
    this.proxyDomElement = new ElementRef(null);
    this.domNodes = new QueryList<ElementRef>();
  }

  ngOnInit(): void {
    //console.log(`Map ${this.mapName} initialized`);

    this.mapTopologyPan = new MapTopologyPan(
      this.mapName,
      this
    );

    this.mapTopologyNodeHandler = new MapTopologyHandler(
      this.mapsContentService,
      this.mapName,
      this.mapNodes,
      this
    );

    // console.log('Map Topology Component initialised for map: ' + this.mapName + ', domNodes = ', this.domNodes);
    // let delay = 100;
    // setTimeout(() => {
    //   console.log(`Map Topology Component initialised (after ${delay} ms) for map: ${this.mapName}, domNodes = `, this.domNodes);
    // }, delay);
  }

  ngAfterViewInit(): void {

    this.mapTopologyPan?.initSvgItems(this.mapTopologyZone);

    this.rebuildTopology(this.mapName);

    this.createDraggableProxy();
  }

  ngOnDestroy(): void {

    // Draggables
    this.deleteDraggableProxy();
    //this.deleteDraggableMapNodes();
  }

  public onMapBackgroundDoubleClick(event: MouseEvent): void {
    console.log(`Map ${this.mapName} background double clicked`);
  }

  public onMapNodeClick(event: MouseEvent, id: string): void {
    console.log(`Map ${this.mapName} node ${id} clicked`);

    this.mapNodes.find((node: IDraggableMapNode) => {
      node.selected = (node.id === id) ? true:  false;
      // if (node.selected) {
      //   console.log(`Node ${id} selected: ${node.selected}`);
      // }
    });
  }

  public onMapNodeDblClick(event: MouseEvent, id: string): void {
    console.log(`Map ${this.mapName} node ${id} double clicked`);

    this.openSnackBar(`Node ${id} double clicked`);
  }

  public onNodePointerOver(event: MouseEvent, id: string): void {
    const index = this.mapNodes.findIndex((node: IDraggableMapNode) => node.id === id);
    if (index < 0) {
      console.error(`Node ${id} not found in map ${this.mapName} unable to process pointer over event`);
      return;
    }

    // In our main application we support drag for moving items around, i have disabled this in this example
    // as it is not required to reproduce the issue.
    //this.mapTopologyNodeHandler?.makeNodeDraggable(this.domNodes, index);
    //console.log(`Map ${this.mapName} node ${id} pointer over`);
  }

  private rebuildTopology(mapName: string): void {
    this.mapTopologyNodeHandler?.addNodesToModel(mapName, this.domNodes);
  }

  private processMapBackgroundClick(): void {
    // clear any node selections
    for (let i = 0; i < this.mapNodes.length; i++) {
      this.mapNodes[i].selected = false;
    }
  }

  private createDraggableProxy(): void {

    // Create SVG point in the user coordinate system
    this.transformedProxyStartingPoint = this.mapTopologyPan?.svgNativeElement.createSVGPoint();

    this.proxyDraggable = Draggable.create(this.proxyDomElement.nativeElement, {
      type: "x,y",
      trigger: this.mapTopologyPan?.svgNativeElement,
      onPress: this.onPressProxy,
      onDrag: this.onDragProxy,
      onRelease: this.onReleaseProxy,
      callbackScope: this
    })[0];

    this.proxyDraggable.update();

    //console.log(`Proxy draggable created`);
  }


  private onPressProxy() {
    const draggable: Draggable = this.proxyDraggable as Draggable;

    if (draggable == null) {
      console.error(`Proxy draggable not found`);
      return;
    }

    // This method determines if the press is inside a node or not - in our main applcation we have draggable support to move
    // nodes (not included in this example for simplicilty).
    // It is the hit test code called from this method that calls getBBox triggers changes in the DOM that
    // is losing our angular boudn dblClick event handler on the node.
    this.proxyClickInsideNodeBounds = this.isClickInsideNodeBounds(draggable.pointerX, draggable.pointerY);

    if (!this.proxyClickInsideNodeBounds) {
      // Keep track of the starting point so we can calculate panning attributes during the proxy drag operation
      this.transformedProxyStartingPoint = this.screenToSVG(this.mapTopologyZone, draggable.pointerX, draggable.pointerY);

      // Initiate the panning
      gsap.set(this.proxyDomElement.nativeElement, { x: draggable.pointerX, y: draggable.pointerY });
      draggable.enable().update();

      // Cache the current viewbox attributes for later use
      this.mapTopologyPan?.cacheInitialViewboxPosition(this.mapTopologyPan);
    }
  }

  private onDragProxy() {
    const draggable: Draggable = this.proxyDraggable as Draggable;

    if (draggable == null) {
      console.error(`Proxy draggable not found`);
      return;
    }

    if (!this.proxyClickInsideNodeBounds && this.transformedProxyStartingPoint != null) {
      // Update panning attributes of the SVG Viewbox
      const currentPoint = this.screenToSVG(this.mapTopologyZone, draggable.pointerX, draggable.pointerY);
      const deltaX = currentPoint.x - this.transformedProxyStartingPoint.x;
      const deltaY = currentPoint.y - this.transformedProxyStartingPoint.y;

      // Update the background grid to match SVG Viewbox
      this.mapTopologyPan?.cacheViewoxAttributres(this.mapTopologyPan, deltaX, deltaY);
    }
  }

  private onReleaseProxy() {
    if (!this.proxyClickInsideNodeBounds) {

      if (!this.mapTopologyPan?.hasPanned(this.mapTopologyPan)) {
        // We didn't pan, so process the click as a background click
        this.processMapBackgroundClick();
      } else {
        console.log(`onReleaseProxy: Panning completed`);
      }

    }
  }

  private deleteDraggableProxy(): void {
    this.proxyDraggable?.kill();
  }

  private isClickInsideNodeBounds(pointerX: number, pointerY: number): boolean {
    const nodes = this.domNodes.toArray();
    //console.log(`isClickInsideNodeBounds: called! pointerX = ${pointerX}, pointerY = ${pointerY}`);

    for (let i = 0; i < nodes.length; i++) {
      if (this.elementRectHitTest(nodes[i], pointerX, pointerY)) {
        //console.log(`isClickInsideNodeBounds: Node hit detected at ${pointerX}, ${pointerY}`);
        return true;
      }
    }

    return false;
  }

  private elementRectHitTest(element: ElementRef, pointerX: number, pointerY: number): boolean {
    let result = false;

    if (element != null) {

      //console.log(`elementRectHitTest: x = ${pointerX}, y = ${pointerY}`);

      // In our main app we need to use getBBox due to an issue with FireFox and getBoundingClientRect in that it
      // returns the dimensions of the SVG object rather than the inner dimensions of the contained rect.
      // We alos have a zoom factor to consider in our main app so the logic to resolve the dimensions is more complex
      // than this example (and this method will not be acurate in FireFox).

      // The issue we are seeing is the call to getBBox is calling through to the CSSPlugin override which appears to
      // do its own DOM manipulation during which we effectively lose our original element which had our binding to
      // ondblclick through angular binding.

      const domRect = element.nativeElement.getBoundingClientRect();

      // This is the call that is causing the issue when the gsap version of getBBox is in effect!
      const svgRect = element.nativeElement.getBBox();

      // This is the workaround - check for the gsap backup of the native call and call that instead if present!
      // let svgRect = null;
      // if (element.nativeElement._gsapBBox != null && typeof element.nativeElement._gsapBBox === 'function') {
      //   svgRect = element.nativeElement._gsapBBox();
      //   console.log(`elementRectHitTest: _gsapBBox returned`, svgRect);
      // } else {
      //   svgRect = element.nativeElement.getBBox();
      //   console.log(`elementRectHitTest: getBBox returned`, svgRect);
      // }

      //console.log(`elementRectHitTest: getBoundingClientRect`, domRect);
      //console.log(`elementRectHitTest: getBBoxRect`, svgRect);

      result = (pointerX >= domRect.left && pointerX <= domRect.right && pointerY >= domRect.top && pointerY <= domRect.bottom);
    }

    return result;
  }

  // Convert screen coordinates to SVG coordinates
  // See: https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
  private screenToSVG(elementRef: ElementRef, x: number, y: number): any {
    if (!elementRef || !elementRef.nativeElement) {
      console.error(`Invalid element reference provided for screen to SVG conversion`);
      return null;
    }

    const point = elementRef.nativeElement.createSVGPoint();
    point.x = x;
    point.y = y;

    return point.matrixTransform(elementRef.nativeElement.getScreenCTM()?.inverse());
  }

  private openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      duration: this.durationInSeconds * 1000,
    });
  }
}
