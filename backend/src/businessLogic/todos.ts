import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoAccess } from '../dataLayer/todosAccess'
import { parseUserId } from '../auth/utils'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await todoAccess.createTodo({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest,
  jwtToken: string
): Promise<void> {
  const userId = parseUserId(jwtToken)

  return await todoAccess.updateTodo(todoId, updateTodoRequest, userId)
}

export async function deleteTodo(
  todoId: string,
  jwtToken: string
): Promise<void> {
  const userId = parseUserId(jwtToken)

  return await todoAccess.deleteTodo(todoId, userId)
}

export async function addImage(
  todoId: string,
  jwtToken: string
): Promise<void> {
  const userId = parseUserId(jwtToken)

  return await todoAccess.addImage(todoId, userId)
}
