import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ModalData {
  title?: string;
  date?: Date | string;
  startTime?: string;
  endTime?: string;
  description?: string;
  color?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-event-modal',
  templateUrl: './event-modal.html',
})
export class EventModalComponent {
  @Input() show = false;
  @Input() modalData: ModalData = {};
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<MouseEvent>();

  closeEventModal() {
    this.close.emit();
  }

  editEvent(event: MouseEvent) {
    this.edit.emit(event);
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
