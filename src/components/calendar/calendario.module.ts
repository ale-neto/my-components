import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarioComponent } from './calendario.component';
import { VisualizacaoMensalComponent } from './mes';
import { VisualizacaoSemanalComponent } from './semana';
import { CalendarioHeaderComponent } from './header';

@NgModule({
  declarations: [
    CalendarioComponent,
    VisualizacaoMensalComponent,
    VisualizacaoSemanalComponent,
    CalendarioHeaderComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [CalendarioComponent],
})
export class GfcCalendarioModule {}
