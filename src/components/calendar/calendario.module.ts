import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarioComponent } from './calendario.component';
import { VisualizacaoMensalComponent } from './mes';
import { VisualizacaoSemanalComponent } from './semana';
import { CalendarioHeaderComponent } from './header';

@NgModule({
  declarations: [CalendarioComponent],
  imports: [
    CommonModule,
    FormsModule,
    CalendarioHeaderComponent,
    VisualizacaoSemanalComponent,
    VisualizacaoMensalComponent
  ],
  exports: [CalendarioComponent],
})
export class ANCalendarioModule {}
