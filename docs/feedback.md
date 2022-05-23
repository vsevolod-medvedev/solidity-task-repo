# Feedback

## 2022.04.29

1. События не имеют индексированных полей. Индексация позволяет выполнять поиск событий
   по теме после их отправки.

2. Функции createTask() getTask() listTasks() changeTaskStatus() deleteTask() может быть объявлен внешним для экономии газа

3. userToTasksCompletedInTimePercent - в данной переменной не учтено, что в solidity только целые числа, можно было добавить разрядность до сотых значений
4. нужно добавить проверку require вместо данной проверки.

```
if (_status == task.status) {
    return;
}
```

5. Комментарии https://docs.soliditylang.org/en/v0.5.10/natspec-format.html#natspec-format
