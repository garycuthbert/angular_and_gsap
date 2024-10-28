import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapNodeComponent } from './map-node.component';

describe('MapNodeComponent', () => {
  let component: MapNodeComponent;
  let fixture: ComponentFixture<MapNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapNodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
