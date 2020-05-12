import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/task.models';
import { List } from 'src/app/models/list.model';


@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

lists: List[];
tasks: Task[];

selectedListId: string;

  constructor(private taskService:TaskService, private route:ActivatedRoute,private router: Router) { }

  ngOnInit(){
    this.route.params.subscribe(
      (params: Params)=>{
        if(params.listId){
          this.selectedListId = params.listId;
          this.taskService.getTasks(params.listId).subscribe((tasks:Task[]) =>{
            this.tasks = tasks;
          })
        }else{
          this.tasks = undefined;
        }
      }
    )

    this.taskService.getLists().subscribe((lists: List[])=>{
    this.lists=lists;
    })

  }

    onTaskClick(task: Task){
      this.taskService.complete(task).subscribe(()=>{
        console.log("completed successfully");
        // if completed
        task.completed = !task.completed;
      })
    }
 
    onDeleteListClick(){
      this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
        this.router.navigate(['/lists']);
        console.log('deleted list',res);
      });
    }

    onDeleteTaskClick(id: string){
      this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any) => {
        // this.router.navigate([`/lists/${id}`]);
        this.tasks = this.tasks.filter(val => val._id !== id);
        console.log('deleted task',res);
      });
    }
    
    signOut(){
      this.router.navigate(['/login']);
     }
}
