import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [],
  exports: [
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    InputTextModule
  ]
})
export class PrimeNgModule { }
