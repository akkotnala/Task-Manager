import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

refreshingAccessToken: boolean;

accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any>{
    //handle the request
    request = this.addAuthHeader(request);

    //call next() to handle request
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse)=>{
        console.log(error);

        if(error.status === 401){
          //401 error
          //refresh the access token
          return this.refreshAccessToken()
            .pipe(
              switchMap(() => {
                request = this.addAuthHeader(request);
                return next.handle(request);
              }),
              catchError((err: any)=>{
                console.log(err);
                this.authService.logout();
                return empty();
              })
            )
        }
        return throwError(error);
      })
    )
  }

  refreshAccessToken(){

    if(this.refreshingAccessToken){
      return new Observable(observe =>{
        this.accessTokenRefreshed.subscribe(()=>{
          observe.next();
          observe.complete();
        })
      })

    }else{
      this.refreshingAccessToken = true;
      return this.authService.getNewAccessToken().pipe(
        tap(()=>{
          console.log("Access token Refreshed");
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next();
        })
      )
    }
  }

  addAuthHeader(request:HttpRequest<any>){
    //get accesstoken
    const token = this.authService.getAccessToken();
    if(token){
    //append the access token to request header
      return request.clone({
        setHeaders:{
          'x-access-token': token
        }
      })
    }
    return request;
  }
}
