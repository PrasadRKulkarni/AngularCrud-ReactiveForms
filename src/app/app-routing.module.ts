import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Import the components so they can be referenced in routes
import { CreateEmployeeComponent } from './employee/create-employee.component';
import { EditEmployeeComponent } from './employee/edit-employee.component';
import { ListEmployeesComponent } from './employee/list-employee.component';
import { HomeComponent } from './home.component';
import { PageNotFoundComponent } from './page-not-found.component';

// The last route is the empty path route. This specifies
// the route to redirect to if the client side path is empty.
const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'list', component: ListEmployeesComponent },
  { path: 'create', component: CreateEmployeeComponent },
  { path: 'edit/:id', component: EditEmployeeComponent },
  // redirect to the home route if the client side route path is empty
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
