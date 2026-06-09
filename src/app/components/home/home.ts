import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TodoService, Todo } from '../../services/todo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private fb = inject(FormBuilder);
  private todoService = inject(TodoService);

  todos: Todo[] = [];
  loading: boolean = true;
  submitting: boolean = false;
  errorMessage: string | null = null;

  todoForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.todoService.getTodos().subscribe({
      next: data => {
        this.todos = data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.errorMessage = 'Failed to load tasks. Please try again later.';
      }
    });
  }

  onSubmit(): void {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    this.todoService.createTodo(this.todoForm.value).subscribe({
      next: newTodo => {
        this.todos.unshift(newTodo); // Add to the top
        this.todoForm.reset();
        this.submitting = false;
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to create task.';
      }
    });
  }

  toggleComplete(todo: Todo): void {
    // Optimistic UI update
    const previousState = todo.isCompleted;
    todo.isCompleted = !todo.isCompleted;
    
    const updatePayload = {
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted
    };

    this.todoService.updateTodo(todo.id, updatePayload).subscribe({
      next: () => {
        // Reload list to get updated completed timestamps from DB
        this.loadTodos();
      },
      error: () => {
        // Revert on error
        todo.isCompleted = previousState;
        this.errorMessage = 'Failed to update task state.';
      }
    });
  }

  deleteTodo(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      const originalTodos = [...this.todos];
      this.todos = this.todos.filter(t => t.id !== id);

      this.todoService.deleteTodo(id).subscribe({
        error: () => {
          // Revert on error
          this.todos = originalTodos;
          this.errorMessage = 'Failed to delete task.';
        }
      });
    }
  }

  get activeTodos(): Todo[] {
    return this.todos.filter(t => !t.isCompleted);
  }

  get completedTodos(): Todo[] {
    return this.todos.filter(t => t.isCompleted);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.todoForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
