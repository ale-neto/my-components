import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarioComponent } from './calendario.component';
import { VisualizacaoMensalComponent } from './mes';
import { CalendarioHeaderComponent } from './header';
import { WeekViewComponent } from './semana';

@NgModule({
  declarations: [CalendarioComponent],
  imports: [
    CommonModule,
    FormsModule,
    CalendarioHeaderComponent,
    WeekViewComponent,
    VisualizacaoMensalComponent
  ],
  exports: [CalendarioComponent],
})
export class ANCalendarioModule {}
