import { Component } from '@angular/core';
import { User, UserLogin } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public user: User;
  constructor(private authService: AuthService){
    this.user = {name: '', rol: '', exp: 0 };
  }

  async ngOnInit(){
    const userLogin: UserLogin = { name: 'Administrador', password: 'admin' }
    this.user = await this.authService.login(userLogin);
    console.log('user', this.user)
  }
}
