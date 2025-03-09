import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  blogTitle: string = '';
  blogContent: string = '';
  imageUrl: string = '';
  blogs: any[] = [];
  isLoading: boolean = true;
  currentCenteredIndex: number = -1;

  @ViewChildren('blogContainer') blogContainers!: QueryList<ElementRef>;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadBlogs();
  }

  ngAfterViewInit() {
    // Initial call to set the centered container after view renders
    setTimeout(() => this.onScroll(), 0);
  }

  async loadBlogs() {
    try {
      this.blogs = await this.supabaseService.getAllBlogs();
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      this.isLoading = false;
      // Call onScroll after blogs are loaded to ensure DOM is updated
      setTimeout(() => this.onScroll(), 0);
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.blogContainers) return;

    const viewportCenter = window.innerHeight / 2; // Middle of the viewport
    let centeredIndex = -1;

    this.blogContainers.forEach((container, index) => {
      const rect = container.nativeElement.getBoundingClientRect();
      // Check if the viewport center is within the container's bounds
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        centeredIndex = index;
      }
    });

    this.currentCenteredIndex = centeredIndex;
  }
}