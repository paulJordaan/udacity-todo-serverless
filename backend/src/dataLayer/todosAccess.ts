import * as AWS from 'aws-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
const logger = createLogger('todosAccess')

import { TodoUpdate } from '../models/TodoUpdate'
import { TodoItem } from '../models/TodoItem'

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIdIndex = process.env.TODO_ID_INDEX
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    var params = {
      TableName: this.todosTable,
      IndexName: this.todoIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await this.docClient.query(params).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating todo')

    var params = {
      TableName: this.todosTable,
      Item: todo
    }

    await this.docClient.put(params).promise()

    return todo
  }

  async updateTodo(
    todoId: string,
    updateTodo: TodoUpdate,
    userId: string
  ): Promise<void> {
    logger.info('Updating todo')

    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression:
        'SET #todo_name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#todo_name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': updateTodo.name,
        ':dueDate': updateTodo.dueDate,
        ':done': updateTodo.done,
        ':userId': userId
      },
      IndexName: this.todoIdIndex,
      ConditionExpression: 'userId = :userId',
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(params).promise()

    return
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info('Deleting todo', { todoId, userId })
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ConditionExpression: 'userId = :userId'
    }

    await this.docClient.delete(params).promise()

    return
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}
