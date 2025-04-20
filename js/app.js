// DOM要素
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskPriority = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const taskTemplate = document.getElementById('task-template');
const filterButtons = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskInput = document.getElementById('edit-task-input');
const editTaskDate = document.getElementById('edit-task-date');
const editTaskPriority = document.getElementById('edit-task-priority');
const cancelEditBtn = document.getElementById('cancel-edit');

// 状態管理
let tasks = [];
let currentFilter = 'all';
let currentEditId = null;

// ローカルストレージから取得
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// ローカルストレージに保存
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// タスク追加処理
function addTask(text, date, priority) {
    const newTask = {
        id: Date.now().toString(),
        text,
        date,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

// タスク編集処理
function updateTask(id, text, date, priority) {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks[index].text = text;
        tasks[index].date = date;
        tasks[index].priority = priority;
        saveTasks();
        renderTasks();
    }
}

// タスク削除処理
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// 完了状態の切り替え
function toggleTaskCompletion(id) {
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }
}

// タスクをフィルタリングして表示する
function filterTasks(filter) {
    currentFilter = filter;
    renderTasks();
    
    // アクティブフィルターボタンの更新
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
}

// 期限日の表示形式を整える
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
}

// 優先度を日本語で表示
function getPriorityLabel(priority) {
    switch(priority) {
        case 'high': return '高';
        case 'medium': return '中';
        case 'low': return '低';
        default: return '中';
    }
}

// タスクリストの表示
function renderTasks() {
    taskList.innerHTML = '';
    
    // フィルタリングされたタスクを取得
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });
    
    // 作成日時でソート（新しいものが上に）
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 各タスクをレンダリング
    filteredTasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true);
        const listItem = taskElement.querySelector('.task-item');
        const checkBox = taskElement.querySelector('.task-check');
        const taskText = taskElement.querySelector('.task-text');
        const taskDateElement = taskElement.querySelector('.task-date');
        const taskPriorityElement = taskElement.querySelector('.task-priority');
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        
        // データ属性を設定
        listItem.dataset.id = task.id;
        listItem.dataset.priority = task.priority;
        
        if (task.completed) {
            listItem.classList.add('completed');
            checkBox.checked = true;
        }
        
        // テキストなどの設定
        taskText.textContent = task.text;
        if (task.date) {
            taskDateElement.textContent = formatDate(task.date);
        } else {
            taskDateElement.remove();
        }
        
        taskPriorityElement.textContent = getPriorityLabel(task.priority);
        taskPriorityElement.dataset.priority = task.priority;
        
        // イベントリスナー設定
        checkBox.addEventListener('change', () => {
            toggleTaskCompletion(task.id);
        });
        
        editBtn.addEventListener('click', () => {
            openEditModal(task);
        });
        
        deleteBtn.addEventListener('click', () => {
            if (confirm('このタスクを削除してもよろしいですか？')) {
                deleteTask(task.id);
            }
        });
        
        taskList.appendChild(taskElement);
    });
}

// 編集モーダルを開く
function openEditModal(task) {
    currentEditId = task.id;
    editTaskInput.value = task.text;
    editTaskDate.value = task.date || '';
    editTaskPriority.value = task.priority;
    editModal.style.display = 'block';
}

// 編集モーダルを閉じる
function closeEditModal() {
    currentEditId = null;
    editModal.style.display = 'none';
}

// イベントリスナー設定
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const date = taskDate.value;
    const priority = taskPriority.value;
    
    if (text) {
        addTask(text, date, priority);
        taskInput.value = '';
        taskDate.value = '';
        taskPriority.value = 'medium';
    }
});

editForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = editTaskInput.value.trim();
    const date = editTaskDate.value;
    const priority = editTaskPriority.value;
    
    if (text && currentEditId) {
        updateTask(currentEditId, text, date, priority);
        closeEditModal();
    }
});

cancelEditBtn.addEventListener('click', () => {
    closeEditModal();
});

// フィルターボタンのイベント設定
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterTasks(btn.dataset.filter);
    });
});

// クリック以外でモーダルを閉じる
window.addEventListener('click', e => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

// アプリ起動時
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});