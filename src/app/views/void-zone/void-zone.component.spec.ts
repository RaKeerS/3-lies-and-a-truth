import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoidZoneComponent } from './void-zone.component';

describe('VoidZoneComponent', () => {
  let component: VoidZoneComponent;
  let fixture: ComponentFixture<VoidZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoidZoneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoidZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
