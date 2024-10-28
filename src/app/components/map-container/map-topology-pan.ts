import { gsap, Draggable } from 'gsap/all';
import { MapContainerComponent } from './map-container.component';
import { ElementRef } from '@angular/core';
import { IRectangleAttributes } from '../../model/map.model';

gsap.registerPlugin(Draggable);

export class MapTopologyPan {

  // Map SVG Attributes
  private _svgNativeElement: any;
  public get svgNativeElement(): any {
    return this._svgNativeElement;
  }

  private _svgViewBox: IRectangleAttributes = { x: 0, y: 0, width: 0, height: 0 };
  public get svgViewBox(): IRectangleAttributes {
    return this._svgViewBox;
  }

  private svgInitialProxyViewBox: IRectangleAttributes = { x: 0, y: 0, width: 0, height: 0 };

  constructor(
    private mapName: string,
    private parentComponent: MapContainerComponent
  ) {

  }

  public initSvgItems(mapTopologyZone: ElementRef): void {
    this._svgNativeElement = mapTopologyZone.nativeElement;
    this._svgViewBox = this._svgNativeElement.viewBox.baseVal;
  }

  public hasPanned(that: MapTopologyPan): boolean {
    return !((that._svgViewBox.x === that.svgInitialProxyViewBox.x) &&
            (that._svgViewBox.y === that.svgInitialProxyViewBox.y) &&
            (that._svgViewBox.width === that.svgInitialProxyViewBox.width) &&
            (that._svgViewBox.height === that.svgInitialProxyViewBox.height));
  }

  // Callback function
  // When the map has started to pan cache its initial position
  public cacheInitialViewboxPosition(that: MapTopologyPan): void {
    that.svgInitialProxyViewBox = {
      x: that._svgViewBox.x,
      y: that._svgViewBox.y,
      width: that._svgViewBox.width,
      height: that._svgViewBox.height
    };
  }

  // Callback function
  // When the map has panned adjust its position
  public cacheViewoxAttributres(that: MapTopologyPan, deltaX: number, deltaY: number): void {
    that._svgViewBox.x -= deltaX;
    that._svgViewBox.y -= deltaY;
  }
}
