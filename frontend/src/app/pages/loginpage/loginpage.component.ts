import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.scss']
})
export class LoginpageComponent implements OnInit {

  constructor(private authService: AuthService, private router:Router) { }

  ngOnInit(): void {
  }

  onLoginButtonClicked(email:string, password: string){
    this.authService.login(email,password).subscribe((res:HttpResponse<any>)=>{
      if(res.status === 200){
      //we have logged in successfully
        this.router.navigate(['/lists']);
      }
      console.log(res);

    });
  }

}
