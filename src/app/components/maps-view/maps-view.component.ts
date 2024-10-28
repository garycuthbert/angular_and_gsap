import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MapContainerComponent } from '../map-container/map-container.component';
import { MapsContentService } from '../../services/maps-content.service';

@Component({
  selector: 'app-maps-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MapContainerComponent
  ],
  templateUrl: './maps-view.component.html',
  styleUrl: './maps-view.component.css'
})
export class MapsViewComponent implements OnInit {

  //public maps: IMapDetails[] = <IMapDetails[]>mapsJSON;
  public mapNames: string[] = [];

  constructor(
    private mapsContentService: MapsContentService
  ) {

  }

  ngOnInit(): void {
    this.mapNames = this.mapsContentService.getMapNames();
  }
}
