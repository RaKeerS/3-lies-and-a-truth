import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaygroundGameInitiationDialogComponent } from './playground-game-initiation-dialog.component';

describe('PlaygroundGameInitiationComponent', () => {
  let component: PlaygroundGameInitiationDialogComponent;
  let fixture: ComponentFixture<PlaygroundGameInitiationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundGameInitiationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaygroundGameInitiationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
