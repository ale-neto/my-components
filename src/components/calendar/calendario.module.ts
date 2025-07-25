import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarioComponent } from './calendario.component';
import { CalendarioHeaderComponent } from './header';
import { MonthViewComponent } from './mes';
import { WeekViewComponent } from './semana';

@NgModule({
  declarations: [CalendarioComponent],
  imports: [
    CommonModule,
    FormsModule,
    CalendarioHeaderComponent,
    WeekViewComponent,
    MonthViewComponent,
  ],
  exports: [CalendarioComponent],
})
export class ANCalendarioModule {}
