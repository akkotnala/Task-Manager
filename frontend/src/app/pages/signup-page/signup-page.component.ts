import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-signip-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSignupButtonClicked(email:string, password: string){
    this.authService.signup(email,password).subscribe((res:HttpResponse<any>)=>{
      console.log(res);
    });
  }

}
