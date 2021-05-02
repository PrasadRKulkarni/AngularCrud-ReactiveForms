import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IEmployee } from './models/IEmployee';
import { EmployeeService } from './services/employee.service';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  fullNameLength: Number = 0;
  employee: IEmployee;

  // This object will hold the messages to be displayed to the user
  // Notice, each key in this object has the same name as the
  // corresponding form control
  formErrors = {
    'fullName': '',
    'email': '',
    'confirmEmail': '',
    'emailGroup': '',
    'phone': ''
  };

  // This object contains all the validation messages for this form
  validationMessages = {
    'fullName': {
      'required': 'Full Name is required.',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 10 characters.'
    },
    'email': {
      'required': 'Email is required.',
      'emailDomain': 'Email domian should be gmail.com'
    },
    'confirmEmail': {
      'required': 'Confirm Email is required.'
    },
    'emailGroup': {
      'emailMismatch': 'Email and Confirm Email do not match.'
    },
    'phone': {
      'required': 'Phone is required.'
    }
  };


  constructor(private fb: FormBuilder,
    private _empService: EmployeeService,
    private _router: Router) { }

  ngOnInit(): void {

    this.employee = {
      id: null,
      fullName: '',
      contactPreference: '',
      email: '',
      phone: null,
      skills: []
    };

    //Using Form Builder method:
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],

      contactPreference: ['email'],

      emailGroup: this.fb.group({
        email: ['', [Validators.required, this.emailDomain('gmail.com')]],
        confirmEmail: ['', [Validators.required]],
      }, { validator: this.matchEmails }),

      phone: [''], //Dynamic Validation

      // Create skills FormArray using the injected FormBuilder
      // class array() method. At the moment, in the created
      // FormArray we only have one FormGroup instance that is
      // returned by addSkillFormGroup() method
      skills: this.fb.array([
        this.addSkillsFormGroup()
      ]),
    });


    // When any of the form control value in employee form changes
    // our validation function logValidationErrors() is called
    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm.get('contactPreference')
      .valueChanges.subscribe((data: string) => {
        this.onContactPrefernceChange(data);
      });
  }



  onSubmit(): void {
    this.mapFormValuesToEmployeeModel();

    this._empService.addEmployee(this.employee).subscribe(
      () => this._router.navigate(['list']),
      (err: any) => console.log(err)
    );
  }

  mapFormValuesToEmployeeModel() {
    this.employee.fullName = this.employeeForm.value.fullName;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email = this.employeeForm.value.emailGroup.email;
    this.employee.phone = this.employeeForm.value.phone;
    this.employee.skills = this.employeeForm.value.skills;
  }

  //Log Validation messages to console.
  onLoadDataClick(): void {

  }

  logValidationErrors(group: FormGroup = this.employeeForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      this.formErrors[key] = '';
      // Loop through nested form groups and form controls to check
      // for validation errors. For the form groups and form controls
      // that have failed validation, retrieve the corresponding
      // validation message from validationMessages object and store
      // it in the formErrors object. The UI binds to the formErrors
      // object properties to display the validation errors.
      if (abstractControl && !abstractControl.valid
        && (abstractControl.touched || abstractControl.dirty)) {
        const messages = this.validationMessages[key];
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + ' ';
          }
        }
      }

      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }

    });
  }

  // If the Selected Radio Button value is "phone", then add the
  // required validator function otherwise remove it
  onContactPrefernceChange(selectedValue: string) {
    const phoneFormControl = this.employeeForm.get('phone');
    const emailFormControl = this.employeeForm.get('emailGroup').get('email');
    const confirmEmailFormControl = this.employeeForm.get('emailGroup').get('confirmEmail');

    if (selectedValue === 'phone') {
      phoneFormControl.setValidators(Validators.required);
      emailFormControl.clearValidators();
      confirmEmailFormControl.clearValidators();
    } else {
      phoneFormControl.clearValidators();
      emailFormControl.setValidators(Validators.required);
      confirmEmailFormControl.setValidators(Validators.required);
    }
    phoneFormControl.updateValueAndValidity();
    emailFormControl.updateValueAndValidity();
    confirmEmailFormControl.updateValueAndValidity();
  }

  //Create the custom validator function
  emailDomain(domainName: string) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const email: string = control.value;
      const domain = email.substring(email.lastIndexOf('@') + 1);
      if (email === '' || domain.toLowerCase() === domainName.toLowerCase()) {
        return null;
      } else {
        return { 'emailDomain': true };
      }
    };
  }

  // Nested form group (emailGroup) is passed as a parameter. Retrieve email and
  // confirmEmail form controls. If the values are equal return null to indicate
  // validation passed otherwise an object with emailMismatch key. Please note we
  // used this same key in the validationMessages object against emailGroup
  // property to store the corresponding validation error message
  matchEmails(group: AbstractControl): { [key: string]: any } | null {
    const emailControl = group.get('email');
    const confirmEmailControl = group.get('confirmEmail');

    if (emailControl.value === confirmEmailControl.value || confirmEmailControl.pristine) {
      return null;
    } else {
      return { 'emailMismatch': true };
    }
  }

  addSkillsFormGroup(): FormGroup {
    return this.fb.group({
      skillName: ['', Validators.required],
      experienceInYears: ['', Validators.required],
      proficiency: ['', Validators.required]
    });
  }

  addSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillsFormGroup());
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
    (<FormArray>this.employeeForm.get('skills')).removeAt(skillGroupIndex);
  }

  //SetValue() - To update all values in a form
  // setValueExample() {
  //   this.employeeForm.setValue({
  //     fullName: 'Pragim Technologies',
  //     email: 'pragim@pragimtech.com',
  //     skills: {
  //       skillName: 'C#',
  //       experienceInYears: 5,
  //       proficiency: 'beginner'
  //     }
  //   });
  // }

  //PatchValue() - To update any one values in a form
  // patchValueExample() {
  //   this.employeeForm.patchValue({
  //     fullName: 'Prasad Technologies',
  //     email: 'PrasadRKulkarni@GMAIL.com'
  //   });
  // }

}
