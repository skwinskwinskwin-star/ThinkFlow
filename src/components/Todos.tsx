import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface Todo {
  id: number;
  name: string;
  is_completed: boolean;
}

export const Todos: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setIsAdding(true);
    const { error } = await supabase
      .from('todos')
      .insert([{ name: newTodo.trim(), is_completed: false }]);

    if (error) {
      console.error('Error adding todo:', error);
    } else {
      setNewTodo('');
      fetchTodos();
    }
    setIsAdding(false);
  };

  const toggleTodo = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      fetchTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      fetchTodos();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={addTodo} className="flex gap-3">
        <input 
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Add a new goal..."
          className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-[var(--text)] font-bold shadow-lg"
        />
        <motion.button
          whileHover={{ scale: 1.05, translateY: -2 }}
          whileTap={{ scale: 0.95 }}
          disabled={isAdding || !newTodo.trim()}
          className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-500/20 disabled:opacity-50"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
        <AnimatePresence mode="popLayout">
          {todos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12 opacity-30"
            >
              <p className="text-xs font-black uppercase tracking-widest">No goals set yet.</p>
            </motion.div>
          ) : (
            todos.map((todo, index) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 20, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                whileHover={{ 
                  translateY: -8,
                  rotateX: 5,
                  rotateY: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ delay: index * 0.05 }}
                className={`group relative p-6 rounded-[2rem] border border-[var(--border)] transition-all duration-300 cursor-pointer overflow-hidden ${
                  todo.is_completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[var(--card)]'
                }`}
                onClick={() => toggleTodo(todo.id, todo.is_completed)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {todo.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--muted)]" />
                      )}
                      <span className={`text-sm font-black uppercase tracking-tight ${todo.is_completed ? 'text-emerald-600 line-through' : 'text-[var(--text)]'}`}>
                        {todo.name}
                      </span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.2, color: '#ef4444' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(todo.id);
                    }}
                    className="text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* 3D Reflection Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
