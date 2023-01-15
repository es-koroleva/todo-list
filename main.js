let addInput = document.querySelector('.add-input');
let addBtn = document.querySelector('.add-btn');
let todo = document.querySelector('.process');
const PROCESS = 'process';
const COMPLETED = 'completed';
const DELETED = 'deleted';

let todoList = [];                                                                  //задаем массив для хранения задач

if (localStorage.getItem('todo')) {                                             //выводим ранее сохраненный список из localStorage
    todoList = JSON.parse(localStorage.getItem('todo'));
    render();
}

function addAction() {                                                              //метод добавления новой задачи
    if (!addInput.value) return;                                                    //проверка на пустое название
    if (getTask(addInput.value)) {                                                  //проверка на дубль, иначе alert
        alert('Уже есть. Исправь!');
        return;
    }
    let newTodo = {                                                                 //новый объект задачи
        todo: addInput.value,
        checked: false,
        important: false,
        status: PROCESS
    }
    todoList.push(newTodo);                                                         //поместили новую задачу в массив
    render();
    localStorage.setItem('todo', JSON.stringify(todoList));                         //обновление списка в localStorage
    addInput.value = '';                                                            //очистка строки в инпуте
}

addBtn.addEventListener('click', addAction);                                    //добавление задачи при клике на кнопку Добавить
addInput.addEventListener('keyup', event => {                            //добавление задачи при нажатии на enter
    if (event.keyCode === 13) {
        addAction();
    }
})

function getFilteredTasks(status) {                                                 //отбор задач по статусу
    return todoList.filter(item => item.status === status);
}

function fillList(status) {                                                         //заполение списка на странице
    let html = '';
    let block = document.querySelector(`.${status}`);                       //ищем элемент для заполнения
    let items = getFilteredTasks(status);                                           //получаем список задач
    if (items.length === 0) block.innerHTML = '';
    items.forEach(function (item, i) {                                      //заполнение элемента данными
        html += `
    <li>
    <div class="${item.important ? 'important' : ''} todo-item" data-name="${item.todo}">
        ${i+1}. ${item.todo}
    </div>
     ${getPopUp(status, i, item)}
    </li>
    `;
    })
    block.innerHTML = html;                                                         //выводим список на страницу
}

function getPopUp(status, i, item) {                                                //формирование списка кнопок всплывающего меню
    switch (status) {
        case PROCESS:
            return `            
            <div class="popUp process" data-id="${i}">
                <div class="action a-important">${item.important ? 'Не важно' : 'Сделать важным'}</div>
                <div class="action a-complete">Завершить</div>
                <div class="action a-delete">Удалить</div>
            </div>`;
        case COMPLETED:
            return `            
            <div class="popUp complated" data-id="${i}">
                <div class="action a-back">Вернуть</div>
                <div class="action a-delete">Удалить</div>
            </div>`;
        case DELETED:
            return `            
            <div class="popUp deleted" data-id="${i}">
                <div class="action a-back">Вернуть</div>
                <div class="action a-delete-final">Удалить навсегда</div>
            </div>`;
    }
}

function render() {                                                                 //инициализания вывода на страницу списка задач по статусу
    fillList(PROCESS);
    fillList(COMPLETED);
    fillList(DELETED);
}

let visiblePopUp = null;                                                            //опредение переменной для открытого меню

//глобальный обработчик на отображение всплывающего меню задач
document.addEventListener('click', function (event) {
    event.preventDefault();

    let element = event.target;
    if (!element.classList.contains('todo-item')) {                                 //обработка клика вне меню, закрытие если открыто
        if (visiblePopUp) {
            visiblePopUp.classList.remove('show');
        }
        return;
    }
    //отображение всплывающего меню каждого элента задачи
    //поиск и отображение всплывающего меню, которое относится к задаче
    let parent = element.parentElement;
    let popUp = parent.querySelector('.popUp');
    if (visiblePopUp && popUp.dataset.id !== visiblePopUp.dataset.id) {             //если есть открытое меню другой задачи - закрываем его
        visiblePopUp.classList.remove('show');
    }
    popUp.classList.toggle('show');                                           //переключение открыто/закрыто для меню
    if (popUp.classList.contains('show')) {
        visiblePopUp = popUp;
    } else {
        visiblePopUp = null;
    }
})

//глобальный обработчик нажатия элементов меню задач
document.addEventListener('click', function (event) {
    event.preventDefault();

    let element = event.target;
    if (!element.classList.contains('action')) {                                    //пропуск, если начата не кнопка меню
        return;
    }
    //поиск элемента задачи
    let parent = element.parentElement.parentElement;
    let task = parent.querySelector('.todo-item');                          //html задача
    let findTask = getTask(task.dataset.name);                                      //задача в массиве
    if (!findTask) {
        return;
    }
    if (element.classList.contains('a-complete')) {
        findTask.status = COMPLETED;
        findTask.important = false;
    }
    if (element.classList.contains('a-important')) {
        findTask.important = !findTask.important;
    }
    if (element.classList.contains('a-delete')) {
        findTask.status = DELETED;
        findTask.important = false;
    }
    if (element.classList.contains('a-back')) {
        findTask.status = PROCESS;
    }
    if (element.classList.contains('a-delete-final')) {
        todoList.forEach(function (item, i) {
            if (item.todo === task.dataset.name) {
                todoList.splice(i, 1);
            }
        });
    }
    render();
    localStorage.setItem('todo', JSON.stringify(todoList));                         //обнавление данных в хранилище
})

function getTask(name) {                                                            //поиск задачи в массиве
    let result = null;
    todoList.forEach(function (item) {
        if (item.todo === name) {
            result = item;
        }
    })
    return result;
}

