import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Import the components so they can be referenced in routes
import { CreateEmployeeComponent } from './employee/create-employee.component';
import { EditEmployeeComponent } from './employee/edit-employee.component';
import { ListEmployeesComponent } from './employee/list-employee.component';


// The last route is the empty path route. This specifies
// the route to redirect to if the client side path is empty.
const appRoutes: Routes = [
  { path: 'list', component: ListEmployeesComponent },
  { path: 'create', component: CreateEmployeeComponent },
  { path: 'edit/:id', component: EditEmployeeComponent },
  { path: '', redirectTo: '/list', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
