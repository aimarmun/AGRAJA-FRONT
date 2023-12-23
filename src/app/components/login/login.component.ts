import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User, UserLogin } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public user: User | null;
  public form: FormGroup;
  public errorMsg: string | null;
  public isLoading: boolean;

  constructor(
      private authService: AuthService,
      private router: Router
    ){
    this.user = {name: '', rol: '', exp: 0 };
    this.errorMsg = null;
    this.isLoading = false;

    this.form = new FormGroup({
      user: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      save: new FormControl(false, [])
    }, []);
  }

  async ngOnInit(){
    this.user = this.authService.getUser();
    console.log('usuario logeado', this.user);
  }

  async onSubmit(): Promise<void> {
    const user: string = this.form.get('user')?.value || '';
    const password: string = this.form.get('password')?.value || '';
    const saveToken: boolean = this.form.get('save')?.value;
    const userLogin: UserLogin = { name: user, password: password }
    this.errorMsg = null;
    this.isLoading = true;
    try{
      this.user = await this.authService.login(userLogin, saveToken);
      this.router.navigateByUrl('/home');
    } catch(error) {
      if (error instanceof HttpErrorResponse)
        this.errorMsg = "Usuario o contraseña incorrectos";
      else
        this.errorMsg = `Error desconocido: ${error}` 
    } finally {
      this.isLoading = false;
    }
    console.log('user', this.user)
  }

  onExit(): void {
    this.authService.logoOff();
    this.user = null;
  }
}
