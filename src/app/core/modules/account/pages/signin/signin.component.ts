import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  private fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  public signinForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get email() {
    return this.signinForm.get('email');
  }

  get password() {
    return this.signinForm.get('password');
  }

  public submitSignin() {
    const email = this.email?.value;
    const password = this.password?.value;

    if (email && password) {
      this.userService.login(email, password).subscribe();
    }
  }
}
