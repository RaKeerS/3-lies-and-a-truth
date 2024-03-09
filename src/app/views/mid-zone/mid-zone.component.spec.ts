import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidZoneComponent } from './mid-zone.component';

describe('MidZoneComponent', () => {
  let component: MidZoneComponent;
  let fixture: ComponentFixture<MidZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MidZoneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MidZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
