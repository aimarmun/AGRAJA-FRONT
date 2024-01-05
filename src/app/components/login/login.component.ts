import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User, UserLogin, UserNewPassword } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

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
  public formNewPass: FormGroup;
  public errorMsg: string | null;
  public errorRoleMsg: string | null;
  public isLoading: boolean;
  public changePassOk: boolean;
  public showPassReq: boolean;

  constructor(
    private authService: AuthService,
    private breadcrumbService: BreadcrumbService,
    private activeRoute: ActivatedRoute,
    private location: Location
  ) {
    this.user = { name: '', rol: '', exp: 0 };
    this.errorMsg = null;
    this.isLoading = false;
    this.changePassOk = false;
    this.errorRoleMsg = null;
    this.showPassReq = false;

    this.form = new FormGroup({
      user: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      save: new FormControl(false, [Validators.required])
    }, []);

    this.formNewPass = new FormGroup({
      password: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
      ]),
      newPasswordR: new FormControl('', [
        Validators.required
      ])
    }, [this.passwordCompare]);
  }

  async ngOnInit() {
    this.breadcrumbService.setActiveRoute(this.activeRoute)
    this.user = this.authService.getUser();
    this.authService.suscribeExp(() => this.user = null);
    console.log('usuario logeado', this.user);

    this.activeRoute.queryParams.subscribe((value) => {
      this.errorRoleMsg = (value as { errorMsg: string }).errorMsg;
      console.log('error de rol:', this.errorRoleMsg)
    });
  }

  async onSubmit(): Promise<void> {
    const saveToken: boolean = this.form.get('save')?.value;
    const userLogin: UserLogin = this.getUserLogin();
    this.errorMsg = null;
    this.isLoading = true;
    try {
      this.user = await this.authService.login(userLogin, saveToken);
      //this.router.navigateByUrl('/home');
      this.location.back();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.log(error.status)
        if(error.status === 404)
          this.errorMsg = "Usuario o contraseña incorrectos";
        else
          this.errorMsg = `Error en servidor remoto: ${error.message}`;
      }
      else
        this.errorMsg = `Error desconocido: ${error}`
    } finally {
      this.isLoading = false;
    }
    console.log('user', this.user)
  }

  async onSubmitNewPass(): Promise<void> {

    const userLogin: UserNewPassword = this.getNewUserCred()

    this.errorMsg = null;
    this.isLoading = true;
    this.changePassOk = false;
    try {
      this.user = await this.authService.changePasswor(userLogin);
      this.changePassOk = true;
    } catch (error) {
      if (error instanceof HttpErrorResponse)
        this.errorMsg = "Usuario o contraseña incorrectos";
      else
        this.errorMsg = `Error desconocido: ${error}`
    } finally {
      this.isLoading = false;
    }

    this.formNewPass.reset();
  }

  async onExit(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.revoke();
    } catch (error){
      console.log(error);
    } finally {
      this.authService.logoOff();
      this.user = null;
      this.isLoading = false;
    }
  }

  private getUserLogin(): UserLogin {
    const name: string = this.form.get('user')?.value || '';
    const password: string = this.form.get('password')?.value || '';
    return { name, password };
  }

  private getNewUserCred(): UserNewPassword {
    const name: string = this.user?.name || '';
    const password: string = this.formNewPass.get('password')?.value || '';
    const newPassword: string = this.formNewPass.get('newPassword')?.value || '';
    return { name, password, newPassword };
  }

  passwordCompare(form: AbstractControl): any {
    const password = form.get('newPassword')?.value;

    const repeatPass = form.get('newPasswordR')?.value;

    if (password != repeatPass) {
      return { passwordCompare: true };
    }
    return null;
  }
  back(): void{
    this.location.back();
  }

  showPassToast(): void {
    this.showPassReq = true;
  }
}
