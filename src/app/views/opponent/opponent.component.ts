import { Component, Input } from '@angular/core';

import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-opponent',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './opponent.component.html',
  styleUrl: './opponent.component.scss',
})
export class OpponentComponent {

  @Input() playgroundModel!: PlaygroundModel;
}
