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
  blogDate: string = '';
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
    return this.blogTitle.trim() !== '' && this.blogContent.trim() !== '' && this.imageUrl.trim() !== '' && this.blogDate.trim() !== '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  async saveInput() {
    if (!this.isFormValid) {
      alert('Please fill in the title, content, and image.');
      return;
    }

    const formattedDate = this.formatDate(this.blogDate);

    const success = await this.supabaseService.insertData(
      this.blogTitle,
      this.blogContent,
      formattedDate,
      this.imageUrl,
    );

    if (success) {
      alert('Blog has been posted!');

      // Reset input fields
      this.blogTitle = '';
      this.blogContent = '';
      this.blogDate = '';
      this.imageUrl = '';

      // Reload blogs to update UI
      this.loadBlogs();
    } else {
      alert('Failed to post the blog. Please try again.');
    }
  }

  async uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];

      this.isUploading = true;

      try {
        const targetWidth = 300; 
        const resizedBlob = await this.resizeImage(file, targetWidth);
        const uniqueFileName = `${Date.now()}-${file.name}`;
        const resizedFile = new File([resizedBlob], uniqueFileName, { type: file.type });
        const result = await this.supabaseService.uploadImage(uniqueFileName, resizedFile);

        if (result.publicUrl) {
          this.imageUrl = result.publicUrl;
          alert('Image uploaded successfully!');
        } else {
          console.error('Error uploading image:', result.error);
          alert('Failed to upload image. Please try again.');
        }
      } catch (error) {
        console.error('Error resizing or uploading image:', error);
        alert('Failed to process image. Please try again.');
      } finally {
        this.isUploading = false;
      }
    }
  }

  async resizeImage(file: File, targetWidth: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.height / img.width;
        const targetHeight = targetWidth * aspectRatio;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            file.type
          );
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}