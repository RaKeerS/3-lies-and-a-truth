import { Component, Input } from '@angular/core';

import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-deck',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './deck.component.html',
  styleUrl: './deck.component.scss'
})
export class DeckComponent {

  @Input() playgroundModel!: PlaygroundModel;
}
