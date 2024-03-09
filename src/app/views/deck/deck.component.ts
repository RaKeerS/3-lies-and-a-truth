import { Component } from '@angular/core';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-deck',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './deck.component.html',
  styleUrl: './deck.component.scss'
})
export class DeckComponent {

}
