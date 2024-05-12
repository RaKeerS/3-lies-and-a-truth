import { Component, Input } from '@angular/core';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent {
  @Input() playerName: string = 'Player 1';
  @Input() increaseZIndexCards: boolean = false;
  @Input() increaseZIndexPicker: boolean = false;
}
