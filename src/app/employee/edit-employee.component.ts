import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IEmployee } from './models/IEmployee';
import { ISkill } from './models/ISkill';
import { EmployeeService } from './services/employee.service';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  fullNameLength: Number = 0;
  id: number;
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
    private _activatedRoute: ActivatedRoute,
    private _empService: EmployeeService,
    private _router: Router) {

    this.id = +this._activatedRoute.snapshot.paramMap.get('id');
    this.getEmployee(this.id);
  }

  ngOnInit(): void {

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

    this._empService.updateEmployee(this.employee).subscribe(
      () => this._router.navigate(['list']),
      (err: any) => console.log(err)
    );
  }

  getEmployee(id: number) {
    this._empService.getEmployee(id)
      .subscribe(
        (employee: IEmployee) => {
          // Store the employee object returned by the
          // REST API in the employee property
          this.employee = employee;
          this.editEmployee(employee);
        },
        (err: any) => console.log(err)
      );
  }

  editEmployee(employee: IEmployee) {
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });

    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }

  setExistingSkills(skillSets: ISkill[]): FormArray {
    const formArray = new FormArray([]);
    skillSets.forEach(s => {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears: s.experienceInYears,
        proficiency: s.proficiency
      }));
    });

    return formArray;
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
      // abstractControl.value !== '' (This condition ensures if there is a value in the
      // form control and it is not valid, then display the validation error)
      if (abstractControl && !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty || abstractControl.value !== '')) {
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

    const domain = emailControl.value.substring(emailControl.value.lastIndexOf('@') + 1);
    //console.log(domain)

    // If confirm email control value is not an empty string, and if the value
    // does not match with email control value, then the validation fails
    if (emailControl.value === confirmEmailControl.value
      || (confirmEmailControl.pristine && confirmEmailControl.value === '')) {
      return null;
    }
    else {
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
    // (<FormArray>this.employeeForm.get('skills')).removeAt(skillGroupIndex);

    const skillsFormArray = <FormArray>this.employeeForm.get('skills');
    skillsFormArray.removeAt(skillGroupIndex);
    skillsFormArray.markAsDirty();
    skillsFormArray.markAsTouched();
  }

}
