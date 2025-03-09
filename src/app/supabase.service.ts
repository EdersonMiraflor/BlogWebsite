import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // Insert data into the blog table
  async insertData(title: string, content: string, date: string, imageUrl: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('my_blogs') // Ensure the table name is correct
      .insert([{ blog_title: title, blog_content: content, date: date, image_url: imageUrl }]); // Use correct column names
  
    if (error) {
      console.error('Error inserting data:', error);
      return false; // ❌ Return false if insertion failed
    }
    return true; // ✅ Return true if insertion was successful
  }
  
  // Upload image to Supabase Storage
  async uploadImage(filePath: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from('blog-images')  // Use the correct bucket name here
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return { publicUrl: null, error };
    }

    // Retrieve the public URL correctly
    const { data: urlData } = this.supabase.storage
      .from('blog-images') // Ensure the correct bucket name is used here
      .getPublicUrl(filePath);

    return { publicUrl: urlData.publicUrl };
  }

  async getAllBlogs() {
    const { data, error } = await this.supabase
      .from('my_blogs') // Ensure table name is correct
      .select('*') // Fetch all records
  
    if (error) {
      console.error('Error fetching data:', error);
      return [];
    }
    return data;
  }
  
}
