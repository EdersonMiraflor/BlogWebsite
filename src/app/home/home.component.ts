import { CommonModule } from '@angular/common';
import { SupabaseService } from '../supabase.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  blogTitle: string = '';
  blogContent: string = '';
  imageUrl: string = '';
  blogs: any[] = [];
  isLoading: boolean = true; 

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadBlogs();
    console.log('<br>');
  }

  async loadBlogs() {
    try {
      this.blogs = await this.supabaseService.getAllBlogs();
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      this.isLoading = false; 
    }
  }
}
