import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarioComponent } from './calendario.component';
import { CalendarioHeaderComponent } from './header';
import { VisualizacaoMensalComponent } from './mes';
import { VisualizacaoSemanalComponent } from './semana';

@NgModule({
  declarations: [
    CalendarioComponent,
    VisualizacaoMensalComponent,
    VisualizacaoSemanalComponent,
    CalendarioHeaderComponent
  ],
  imports: [CommonModule, FormsModule],
  exports: [CalendarioComponent]
})
export class GfcCalendarioModule {}
