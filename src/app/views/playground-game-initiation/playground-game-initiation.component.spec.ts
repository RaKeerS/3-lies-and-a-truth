import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaygroundGameInitiationComponent } from './playground-game-initiation.component';

describe('PlaygroundGameInitiationComponent', () => {
  let component: PlaygroundGameInitiationComponent;
  let fixture: ComponentFixture<PlaygroundGameInitiationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundGameInitiationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlaygroundGameInitiationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
