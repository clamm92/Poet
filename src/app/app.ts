import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Poem { // structure for each poem, expanded reveals whole poem
  author: string;
  title: string;
  lines: string[];
  expanded?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true, // no NgModule
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container mt-5">
    <h1>Poetry Explorer</h1>
    <p class="subtitle">Search poems by <strong>author</strong> and/or <strong>title</strong></p>

    <div class="search-bar">
      <input [(ngModel)]="authorQuery" placeholder="Author..." />
      <input [(ngModel)]="titleQuery" placeholder="Title..." />
      <button (click)="fetchPoems()">Search</button> <!-- onClick -->
    </div>

    <div *ngIf="loading" class="loading">Loading poems...</div> <!-- if loading or error, show -->
    <div *ngIf="error" class="error">{{ error }}</div>

    <div class="poem-list" *ngIf="!loading && poems.length > 0"> <!-- Show poems if not loading and exists -->
      <div *ngFor="let poem of poems.slice(0, visibleCount)" class="poem-card"> <!-- show visibleCount poems (set to 10)-->
        <h3>{{ poem.title }}</h3>
        <h4>by {{ poem.author }}</h4>

        <pre *ngIf="!poem.expanded">{{ poem.lines.slice(0, 4).join('\n') }}</pre> <!-- show 4 lines if not expanded-->
        <pre *ngIf="poem.expanded">{{ poem.lines.join('\n') }}</pre>

        <button class="toggle-btn" (click)="poem.expanded = !poem.expanded">
          {{ poem.expanded ? "Show less ▲" : "Show more ▼" }}
        </button>
      </div>

      <button *ngIf="visibleCount < poems.length" class="show-more" (click)="showMore()">
        Show more ({{ poems.length - visibleCount }} remaining)
      </button>
    </div>
  </div>
  `,
  styleUrls: ['./app.css']
})
export class App {
  poems: Poem[] = [];
  authorQuery = '';
  titleQuery = '';
  loading = false;
  error = '';
  visibleCount = 10; // default value of 10 poems

  async fetchPoems() {
    this.loading = true;
    this.error = '';
    this.poems = [];
    this.visibleCount = 10; // resets pagination

    const author = this.authorQuery.trim();
    const title = this.titleQuery.trim();

    let url = '';
    if (author && title) url = `https://poetrydb.org/author,title/${author};${title}`;
    else if (author) url = `https://poetrydb.org/author/${author}`;
    else if (title) url = `https://poetrydb.org/title/${title}`;
    else {
      this.loading = false;
      this.error = 'Please enter at least an author or title.';
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch poems');
      const data = await response.json();
      const poemsArray = Array.isArray(data) ? data : [data]; //make sure data is array
      const updatedPoems =
        poemsArray.filter(p => p.title && p.author && p.lines) // only keep real poems
        .map(p => {
        return {
          ...p, 
          expanded: false // add expanded field to each poem
        };
    });

    this.poems = updatedPoems;
      if (this.poems.length === 0) this.error = 'No poems found.';
    } catch (err) {
      console.error(err);
      this.error = 'Error fetching poems. Try another search!';
    } finally {
      this.loading = false;
    }
  }

  showMore() {
    this.visibleCount += 10;
  }
}
