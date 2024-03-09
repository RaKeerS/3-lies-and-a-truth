import { Component, HostBinding } from '@angular/core';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';
import { APP_CONTAINER_FLEX_CLASS } from '../../types/app-types';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent {

  @HostBinding(APP_CONTAINER_FLEX_CLASS)
  protected readonly containerFlex = true;

}
