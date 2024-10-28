import { Component } from '@angular/core';
import { MapsViewComponent } from "../maps-view/maps-view.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapsViewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
