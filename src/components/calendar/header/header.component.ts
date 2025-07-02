import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class CalendarioHeaderComponent {
  @Input() viewMode: 'mes' | 'semana' = 'semana';
  @Input() mesAtual = '';
  @Input() anoAtual: number = new Date().getFullYear();

  @Output() changeView = new EventEmitter<'mes' | 'semana'>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() current = new EventEmitter<void>();

  toggleView(mode: 'mes' | 'semana') {
    this.changeView.emit(mode);
  }
}
