import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaygroundGameRulesComponent } from './playground-game-rules.component';

describe('PlaygroundGameRulesComponent', () => {
  let component: PlaygroundGameRulesComponent;
  let fixture: ComponentFixture<PlaygroundGameRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundGameRulesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlaygroundGameRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
