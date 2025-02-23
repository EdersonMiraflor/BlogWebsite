import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-input',
  standalone: true,
  templateUrl: './user-input.component.html',
  styleUrls: ['./user-input.component.css'],
  imports: [FormsModule, CommonModule],
})
export class UserInputComponent implements OnInit {
  blogTitle: string = '';
  blogContent: string = '';
  imageUrl: string = '';
  blogs: any[] = [];
  isUploading: boolean = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadBlogs();
  }

  async loadBlogs() {
    this.blogs = await this.supabaseService.getAllBlogs();
  }

  get isFormValid(): boolean {
    return this.blogTitle.trim() !== '' && this.blogContent.trim() !== '' && this.imageUrl.trim() !== '';
  }

  async saveInput() {
    if (!this.isFormValid) {
      alert('Please fill in the title, content, and image.');
      return;
    }
  
    const success = await this.supabaseService.insertData(
      this.blogTitle,
      this.blogContent,
      this.imageUrl
    );
  
    if (success) {
      alert('Vlog has been posted!');
  
      // ✅ Reset input fields
      this.blogTitle = '';
      this.blogContent = '';
      this.imageUrl = '';
  
      // ✅ Reload blogs to update UI
      this.loadBlogs();
    } else {
      alert('Failed to post the vlog. Please try again.'); 
    }
  }
  
  async uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];

      this.isUploading = true;

      const uniqueFileName = `${Date.now()}-${file.name}`;
      const result = await this.supabaseService.uploadImage(uniqueFileName, file);

      if (result.publicUrl) {
        this.imageUrl = result.publicUrl;
        alert('Image uploaded successfully!');
      } else {
        console.error('Error uploading image:', result.error);
      }

      this.isUploading = false;
    }
  }
}
