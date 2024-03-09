import { Component } from '@angular/core';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent {

}
