import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

export interface ModalData {
  title?: string | null;
  date?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
  color?: string | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-event-modal',
  templateUrl: './event-modal.html',
})
export class EventModalComponent {
  @Input() show = false;
  @Input() modalData: ModalData = {};
  @Input() type: 'view' | 'edit' | 'add' = 'view';
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<ModalData>();

  form = new FormGroup({
    title: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    startTime: new FormControl('', Validators.required),
    endTime: new FormControl('', Validators.required),
    description: new FormControl(''),
    color: new FormControl('#007bff'),
  });

  closeEventModal() {
    this.close.emit();
  }

  editEvent() {
    this.edit.emit(this.form.value);
  }

  saveEvent() {
    if (this.form.invalid) {
      return;
    }

    this.edit.emit(this.form.value);
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
