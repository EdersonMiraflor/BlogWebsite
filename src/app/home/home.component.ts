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
  blogTitle: string = '';         // Placeholder for blog title input (not used in this version)
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

  // Reference to blog containers in the template for scroll detection
  @ViewChildren('blogContainer') blogContainers!: QueryList<ElementRef>;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadBlogs(); // Fetch blogs when the component initializes
  }

  ngAfterViewInit() {
    // Ensure the scroll handler runs after the view is rendered
    setTimeout(() => this.onScroll(), 0);
  }

  // Fetch all blogs from Supabase and set up pagination
  async loadBlogs() {
    try {
      this.blogs = await this.supabaseService.getAllBlogs(); // Fetch blogs
      this.totalPages = Math.ceil(this.blogs.length / this.itemsPerPage); // Calculate total pages
      this.setCurrentBlogs(); // Display the first page of blogs
    } catch (error) {
      console.error('Error fetching blogs:', error); // Log any errors
    } finally {
      this.isLoading = false; // Hide loading spinner
      setTimeout(() => this.onScroll(), 0); // Update centered blog index
    }
  }

  // Update the currentBlogs array based on the current page
  setCurrentBlogs() {
    const start = (this.currentPage - 1) * this.itemsPerPage; // Starting index
    const end = start + this.itemsPerPage;                    // Ending index
    this.currentBlogs = this.blogs.slice(start, end);         // Slice blogs for the current page
  }

  // Navigate to the previous page
  prevPage() {
    if (this.currentPage > 1) {         // Check if not on the first page
      this.currentPage = this.currentPage - 1; // Decrease page number
      this.setCurrentBlogs();           // Update displayed blogs
    }
  }

  // Navigate to the next page
  nextPage() {
    if (this.currentPage < this.totalPages) { // Check if not on the last page
      this.currentPage = this.currentPage + 1; // Increase page number
      this.setCurrentBlogs();                 // Update displayed blogs
    }
  }

  // Listen to scroll events to highlight the centered blog
  @HostListener('window:scroll')
  onScroll() {
    if (!this.blogContainers) return; // Exit if blog containers aren't available

    const viewportCenter = window.innerHeight / 2; // Middle of the viewport
    let centeredIndex = -1;

    // Check each blog container to find the one in the center
    this.blogContainers.forEach((container, index) => {
      const rect = container.nativeElement.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        centeredIndex = index; // Set the index of the centered blog
      }
    });

    this.currentCenteredIndex = centeredIndex; // Update the centered index
  }
}