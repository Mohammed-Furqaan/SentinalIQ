import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, Plus, Calendar, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog', color: 'bg-slate-500' },
  { id: 'TODO', title: 'To Do', color: 'bg-blue-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'TESTING', title: 'Testing', color: 'bg-purple-500' },
  { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-500' },
];

const SortableTaskItem = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'HIGH': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'MEDIUM': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`bg-white/5 border border-white/10 p-4 rounded-xl shadow-lg backdrop-blur-sm cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors mb-3 group ${isDragging ? 'ring-2 ring-blue-500 shadow-blue-500/20' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="flex items-center text-[11px] text-slate-400 font-medium">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <h4 className="text-slate-100 font-medium text-sm leading-tight mb-3 group-hover:text-blue-300 transition-colors">{task.title}</h4>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold shadow-inner" title={task.assignee.username}>
              {task.assignee.username.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500" title="Unassigned">
              ?
            </div>
          )}
          <span className="text-xs text-slate-500 truncate max-w-[100px]" title={task.project?.name}>
            {task.project?.name}
          </span>
        </div>
        <span className="text-[10px] text-slate-600 font-bold tracking-wider uppercase">TSK-{task.id}</span>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    projectId: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, projectId: response.data[0].id }));
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setIsModalOpen(false);
      setFormData({ 
        title: '', 
        description: '', 
        priority: 'MEDIUM', 
        status: 'TODO', 
        projectId: projects[0]?.id || '' 
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status?status=${newStatus}`);
    } catch (error) {
      console.error("Failed to update status on server:", error);
      fetchTasks(); // Revert local state on failure
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find(t => t.id === overId);
    const isOverAColumn = COLUMNS.some(c => c.id === overId);
    
    if (overTask && activeTask.status !== overTask.status) {
      setTasks((prev) => {
        const newTasks = [...prev];
        const index = newTasks.findIndex(t => t.id === activeId);
        newTasks[index] = { ...newTasks[index], status: overTask.status };
        return newTasks;
      });
    } else if (isOverAColumn && activeTask.status !== overId) {
      setTasks((prev) => {
        const newTasks = [...prev];
        const index = newTasks.findIndex(t => t.id === activeId);
        newTasks[index] = { ...newTasks[index], status: overId };
        return newTasks;
      });
    }
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate && taskToUpdate.status !== newStatus) {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      
      try {
        await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      } catch (error) {
        console.error("Failed to update task status:", error);
        // Revert on error
        fetchTasks();
      }
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20">
        <Loader2 className="w-12 h-12 text-blue-500 mb-4 animate-spin" />
        <p className="text-lg font-medium animate-pulse">Loading Sprint Board...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Kanban Board</h1>
          <p className="text-slate-400 mt-1">Manage project workflows and track progress.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start">
            {COLUMNS.map(column => {
              const columnTasks = tasks.filter(task => task.status === column.id);
              return (
                <div key={column.id} className="w-[320px] flex-shrink-0 flex flex-col h-full bg-slate-900/60 rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${column.color} shadow-${column.color.split('-')[1]}-500/50`} />
                      <h2 className="font-semibold text-slate-200 tracking-wide">{column.title}</h2>
                    </div>
                    <span className="text-xs font-bold bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full border border-white/5">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <SortableContext id={column.id} items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="min-h-[150px] h-full flex flex-col">
                        {columnTasks.map(task => (
                          <SortableTaskItem key={task.id} task={task} />
                        ))}
                        {columnTasks.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-700/50 rounded-xl py-8 mt-2">
                            <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                            <span className="text-sm font-medium">Drop tasks here</span>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeId ? <SortableTaskItem task={tasks.find(t => t.id === activeId)} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Task Title</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="e.g., Implement login form"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
              placeholder="Provide technical details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Project</label>
              <select 
                required
                value={formData.projectId}
                onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
              >
                {projects.length === 0 && <option value="">No projects available</option>}
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="TESTING">Testing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
              <input 
                type="date" 
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-500/25"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KanbanBoard;
