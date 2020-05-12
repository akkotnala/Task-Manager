import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTaskComponent } from './pages/new-task/new-task.component';
import { LoginpageComponent } from './pages/loginpage/loginpage.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';
import { EditTaskComponent } from './pages/edit-task/edit-task.component';


const routes: Routes = [
  {path: '',redirectTo:"lists", pathMatch:'full'},
  {path: 'login',component: LoginpageComponent },
  {path: 'edit-list/:listId',component: EditListComponent },
  {path: 'signup',component: SignupPageComponent},
  {path: 'new-list',component: NewListComponent },
  {path: 'lists/:listId/new-task',component: NewTaskComponent },
  {path: 'lists/:listId/edit-task/:taskId',component: EditTaskComponent },
  {path: 'lists',component: TaskViewComponent },
  {path: 'lists/:listId',component: TaskViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
