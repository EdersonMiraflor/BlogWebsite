import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  attempts = 0;
  cooldown = false;
  cooldownTimeLeft = 0;
  hasAccess = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkCooldownStatus(); 
  
    
    if (!this.hasAccess) {
      this.router.navigate(['/home']);
    }
  }
  

  checkPassword(event: Event) {
    event.preventDefault();
  
    if (this.cooldown) return alert(`Wait ${this.cooldownTimeLeft} seconds.`);
  
    if (this.hasAccess) return; 
  
    for (let i = 0; i < 5; i++) {
      const password = prompt('Enter password:');
      if (!password) {
        this.router.navigate(['/home']); 
        return;
      }
  // I Know Pretty Well That This Should Be In Backend Since it is not safe for frontend to have confidential data
  // But This is for Viewing Purpose Only So Its Fine I Allow It :))
      if (password === 'blog2025') {
        this.hasAccess = true;
        return this.router.navigate(['/user-input']);
      }
  
      alert(`Wrong password! Attempts left: ${4 - i}`);
    }
  
    this.startCooldown(30000); 
  

    this.router.navigate(['/home']);
  }
  
  

  checkCooldownStatus() {
    const cooldownTime = Number(localStorage.getItem('cooldownTime')) || 0;
    const timeLeft = cooldownTime - Date.now();
    if (timeLeft > 0) this.startCooldown(timeLeft);
  }

  startCooldown(timeLeft: number) {
    this.cooldown = true;
    this.cooldownTimeLeft = Math.ceil(timeLeft / 1000);

    const countdown = setInterval(() => {
      if (--this.cooldownTimeLeft <= 0) {
        clearInterval(countdown);
        this.cooldown = false;
        localStorage.removeItem('cooldownTime');
      }
    }, 1000);

    localStorage.setItem('cooldownTime', (Date.now() + timeLeft).toString());
  }
}