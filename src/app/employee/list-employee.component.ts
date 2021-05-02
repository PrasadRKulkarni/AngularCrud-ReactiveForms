import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IEmployee } from './models/IEmployee';
import { EmployeeService } from './services/employee.service';

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.css']
})
export class ListEmployeesComponent implements OnInit {

  employees: IEmployee[];

  constructor(private _employeeService: EmployeeService,
    private _router: Router) { }

  ngOnInit(): void {

    this._employeeService.getEmployees().subscribe(
      (employeeList) => this.employees = employeeList,
      (err) => console.log(err)
    );

  }

  editButtonClick(employeeId: number) {
    this._router.navigateByUrl('/edit/' + employeeId);
  }


}
