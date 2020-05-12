import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Task } from './models/task.models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  createList(title: String){
    // we will send a web request to create a list
    return this.webReqService.post('lists', { title });
  }

  getLists(){
    return this.webReqService.get('lists');
  }

  deleteTask(listId: string, taskId: string){
    return this.webReqService.delete(`lists/${listId}/tasks/${taskId}`);
  }

  deleteList(id: string){
    return this.webReqService.delete(`lists/${id}`);
  }

  updateList(id: String, title:string){
    // we will send a web request to create a list
    return this.webReqService.patch(`lists/${id}`, { title });
  }

  updateTask(listId:string, taskId: String, title:string){
    // we will send a web request to create a list
    return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`, { title });
  }

  getTasks(listId: string){
    return this.webReqService.get(`lists/${listId}/tasks`);
  }

  createTask(title: String, listId: string){
    // we will send a web request to create a list
    return this.webReqService.post(`lists/${listId}/tasks`, { title });
  }

  complete(task: Task){
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`, { 
    completed: !task.completed  
    });

  }
}
