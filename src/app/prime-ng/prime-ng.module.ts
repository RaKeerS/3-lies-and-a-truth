import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputOtpModule } from 'primeng/inputotp';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MenubarModule } from 'primeng/menubar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepperModule } from 'primeng/stepper';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';


@NgModule({
  exports: [
    CommonModule,
    ConfirmDialogModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    DividerModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    SelectButtonModule,
    StepperModule,
    ToastModule,
    TooltipModule,
    KeyFilterModule,
    InputOtpModule,
    InputSwitchModule,
    CheckboxModule,
    RadioButtonModule,
    ToggleButtonModule,
    MenubarModule,
    AvatarModule
  ]
})
export class PrimeNgModule { }
