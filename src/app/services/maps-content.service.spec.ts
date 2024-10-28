import { TestBed } from '@angular/core/testing';

import { MapsContentService } from './maps-content.service';

describe('MapsContentService', () => {
  let service: MapsContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapsContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
