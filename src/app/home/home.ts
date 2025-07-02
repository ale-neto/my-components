import { Component } from '@angular/core';
import { ANCalendarioModule } from 'src/components/calendar';

@Component({
  selector: 'app-home',
  imports: [ANCalendarioModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {}
