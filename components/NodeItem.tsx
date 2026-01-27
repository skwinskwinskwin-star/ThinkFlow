
import React, { useState, useRef, useEffect } from 'react';
import { Node } from '../types';

interface NodeItemProps {
  node: Node;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Node>) => void;
  onExpand: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NodeItem: React.FC<NodeItemProps> = ({ 
  node, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onExpand,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const nodeStartPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    onSelect(node.id);
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    nodeStartPos.current = { x: node.x, y: node.y };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') return;
    e.stopPropagation();
    handleStart(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') return;
    e.stopPropagation();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const dx = clientX - dragStartPos.current.x;
      const dy = clientY - dragStartPos.current.y;
      onUpdate(node.id, {
        x: nodeStartPos.current.x + dx,
        y: nodeStartPos.current.y + dy
      });
    };

    const mouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const touchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const stopDragging = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', touchMove, { passive: false });
      window.addEventListener('touchend', stopDragging);
    }

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging, node.id, onUpdate]);

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute cursor-grab active:cursor-grabbing select-none rounded-[1.5rem] p-4 shadow-2xl border-2 transition-transform duration-200 ${
        isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/20 z-30 scale-105' : 'border-white/10 z-20'
      } ${node.color} text-white flex flex-col items-center min-w-[200px] max-w-[300px]`}
      style={{
        left: node.x,
        top: node.y,
        touchAction: 'none'
      }}
    >
      {node.isGenerating && (
        <div className="absolute inset-0 bg-white/10 animate-pulse rounded-[1.5rem]" />
      )}
      
      <textarea
        className="bg-transparent border-none outline-none text-center font-bold w-full resize-none placeholder-white/30 text-sm py-2"
        value={node.text}
        onChange={(e) => onUpdate(node.id, { text: e.target.value })}
        rows={2}
        placeholder="Type a thought..."
      />

      <div className="flex gap-2 mt-2 pt-2 border-t border-white/10 w-full justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); onExpand(node.id); }}
          className="p-1.5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
          disabled={node.isGenerating}
        >
          {node.isGenerating ? 'Thinking...' : 'Expand'}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
          className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};
