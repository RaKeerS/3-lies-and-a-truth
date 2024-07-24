import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaygroundGameRulesDialogComponent } from './playground-game-rules-dialog.component';

describe('PlaygroundGameRulesComponent', () => {
  let component: PlaygroundGameRulesDialogComponent;
  let fixture: ComponentFixture<PlaygroundGameRulesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundGameRulesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaygroundGameRulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
