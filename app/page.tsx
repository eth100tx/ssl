'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (res.ok) {
        setNewTaskTitle('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const toggleTask = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'PATCH' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Task Manager
        </h1>

        {/* Create Task Form */}
        <form onSubmit={createTask} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add
            </button>
          </div>
        </form>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center text-gray-600">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No tasks yet. Create one above!
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span
                  className={`flex-1 text-gray-800 ${
                    task.completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            {tasks.filter((t) => t.completed).length} of {tasks.length} tasks
            completed
          </div>
        )}
      </div>
    </div>
  );
}
