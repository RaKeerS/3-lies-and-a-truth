import { Component, Input } from '@angular/core';

import { PlaygroundGameStageEnum } from '../../enums/playground.enum';
import { PlaygroundModel } from '../../models/playground.model';
import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-mid-zone',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './mid-zone.component.html',
  styleUrl: './mid-zone.component.scss'
})
export class MidZoneComponent {
  @Input() playgroundModel!: PlaygroundModel;

  public PlaygroundGameStage: typeof PlaygroundGameStageEnum = PlaygroundGameStageEnum;
}
