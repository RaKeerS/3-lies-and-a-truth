import { Component, Input } from '@angular/core';

import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-void-zone',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './void-zone.component.html',
  styleUrl: './void-zone.component.scss'
})
export class VoidZoneComponent {

  @Input() playgroundModel!: PlaygroundModel;

  inspectVoidedCards(): void {
    this.playgroundModel.showVoidedCards();
  }

}
