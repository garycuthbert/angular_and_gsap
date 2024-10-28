import { Injectable } from '@angular/core';
import mapsJSON from '../../assets/maps.json';
import { IMapDetails, INodeDetails } from '../model/map.model';

@Injectable({
  providedIn: 'root'
})
export class MapsContentService {

  public maps: IMapDetails[] = <IMapDetails[]>mapsJSON;

  constructor() { }

  public getMapNames(): string[] {
    return this.maps.map(map => map.name);
  }

  public getMapDetails(mapName: string): INodeDetails[] {
    let details = this.maps.find(map => map.name === mapName);
    if (!details) {
      return [];
    }

    return details.nodes;
  }
}
