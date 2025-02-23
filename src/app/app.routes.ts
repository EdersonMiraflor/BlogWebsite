import { Routes } from '@angular/router';
import { UserInputComponent } from './user-input/user-input.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component:HomeComponent
    },
    {
        path: 'user-input',
        component:UserInputComponent
    },
    {
        path: 'about',
        component:ContactComponent
    }
];
