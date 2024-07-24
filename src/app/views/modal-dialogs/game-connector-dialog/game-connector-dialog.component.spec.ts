import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameConnectorDialogComponent } from './game-connector-dialog.component';

describe('GameConnectorComponent', () => {
  let component: GameConnectorDialogComponent;
  let fixture: ComponentFixture<GameConnectorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameConnectorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameConnectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
