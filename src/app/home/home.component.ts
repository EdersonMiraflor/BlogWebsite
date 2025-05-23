import { Component, ViewChildren, QueryList, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../supabase.service';
import { TechStackComponent } from '../tech-stack/tech-stack.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, TechStackComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  blogTitle: string = '';         // Placeholder for blog title input (not used in this version)
  blogDate: string = '';          // Placeholder for blog date input (not used in this version)
  blogContent: string = '';       // Placeholder for blog content input (not used in this version)
  imageUrl: string = '';          // Placeholder for image URL input (not used in this version)
  blogs: any[] = [];              // Array to store all blogs fetched from Supabase
  isLoading: boolean = true;      // Flag to show loading spinner
  currentCenteredIndex: number = -1; // Index of the blog currently centered in the viewport

  // Pagination variables
  itemsPerPage: number = 5;       // Number of blogs to display per page
  currentPage: number = 1;        // Current page number (starts at 1)
  totalPages: number = 0;         // Total number of pages (calculated based on blog count)
  currentBlogs: any[] = [];       // Array to store blogs displayed on the current page

  // Sorting filter
  sortOrder: 'oldest' | 'newest' = 'oldest'; // Default to oldest-to-newest

  @ViewChildren('blogContainer') blogContainers!: QueryList<ElementRef>;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadBlogs(); // Fetch blogs when the component initializes
  }

  ngAfterViewInit() {
    // Ensure the scroll handler runs after the view is rendered
    setTimeout(() => this.onScroll(), 0);
  }

  // Fetch all blogs from Supabase, sort by date, and set up pagination
  async loadBlogs() {
    try {
      this.blogs = await this.supabaseService.getAllBlogs(); // Fetch blogs from my_blogs table
      this.sortBlogs(); // Sort blogs based on current sortOrder
      this.totalPages = Math.ceil(this.blogs.length / this.itemsPerPage); // Calculate total pages
      this.setCurrentBlogs(); // Display the first page of blogs
    } catch (error) {
      console.error('Error fetching blogs:', error); // Log any errors
    } finally {
      this.isLoading = false; // Hide loading spinner
      setTimeout(() => this.onScroll(), 0); // Update centered blog index
    }
  }

  // Sort blogs based on the selected sortOrder
  sortBlogs() {
    this.blogs.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return this.sortOrder === 'oldest'
        ? dateA.getTime() - dateB.getTime() // Oldest to newest
        : dateB.getTime() - dateA.getTime(); // Newest to oldest
    });
    this.currentPage = 1; // Reset to first page after sorting
    this.setCurrentBlogs(); // Update displayed blogs
  }

  // Handle sort order change from dropdown
  onSortChange(order: 'oldest' | 'newest') {
    this.sortOrder = order;
    this.sortBlogs();
  }

  // Format date from YYYY-MM-DD to "Month DD, YYYY"
  formatDate(dateStr: string): string {
    if (!dateStr) return 'Unknown Date';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  // Update the currentBlogs array based on the current page
  setCurrentBlogs() {
    const start = (this.currentPage - 1) * this.itemsPerPage; // Starting index
    const end = start + this.itemsPerPage;                    // Ending index
    this.currentBlogs = this.blogs.slice(start, end);         // Slice blogs for the current page
  }

  // Navigate to the previous page
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.setCurrentBlogs();
    }
  }

  // Navigate to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      this.setCurrentBlogs();
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.blogContainers) return; // Exit if blog containers aren't available

    const viewportCenter = window.innerHeight / 2; // Middle of the viewport
    let centeredIndex = -1;

    this.blogContainers.forEach((container, index) => {
      const rect = container.nativeElement.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        centeredIndex = index; // Set the index of the centered blog
      }
    });

    this.currentCenteredIndex = centeredIndex; // Update the centered index
  }
}