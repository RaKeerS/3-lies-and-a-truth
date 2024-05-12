import { Component, Input } from '@angular/core';

import { PrimeNgModule } from '../../prime-ng/prime-ng.module';

@Component({
  selector: 'app-mid-zone',
  standalone: true,
  imports: [PrimeNgModule],
  templateUrl: './mid-zone.component.html',
  styleUrl: './mid-zone.component.scss'
})
export class MidZoneComponent {
  @Input() midSegwayMessages: string = '';
}
