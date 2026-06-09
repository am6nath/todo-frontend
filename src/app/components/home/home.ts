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

  // Pagination fields
  currentPage: number = 1;
  pageSize: number = 5;
  totalCount: number = 0;
  totalPages: number = 0;

  todoForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.todoService.getTodos(this.currentPage, this.pageSize).subscribe({
      next: data => {
        this.todos = data.items;
        this.totalCount = data.totalCount;
        this.totalPages = data.totalPages;
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
      next: () => {
        this.todoForm.reset();
        this.submitting = false;
        this.currentPage = 1; // Reset to page 1 to see the new task
        this.loadTodos();
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Failed to create task.';
      }
    });
  }

  toggleComplete(todo: Todo): void {
    const previousState = todo.isCompleted;
    todo.isCompleted = !todo.isCompleted;
    
    const updatePayload = {
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted
    };

    this.todoService.updateTodo(todo.id, updatePayload).subscribe({
      next: () => {
        this.loadTodos();
      },
      error: () => {
        todo.isCompleted = previousState;
        this.errorMessage = 'Failed to update task state.';
      }
    });
  }

  deleteTodo(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.todoService.deleteTodo(id).subscribe({
        next: () => {
          // If the last item on the page is deleted, go back a page
          if (this.todos.length === 1 && this.currentPage > 1) {
            this.currentPage--;
          }
          this.loadTodos();
        },
        error: () => {
          this.errorMessage = 'Failed to delete task.';
        }
      });
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTodos();
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
