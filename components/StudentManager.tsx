
import React, { useState } from 'react';
import { UNITS, ROLES } from '../constants';
import { Student } from '../types';
import { UserPlus, Trash2, Users, Briefcase, Pencil, Check, X } from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onRemoveStudent: (id: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ students, onAddStudent, onUpdateStudent, onRemoveStudent }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [role, setRole] = useState(ROLES[2]); // Default to 'Aluno'

  // Estados para Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editRole, setEditRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: name.trim(),
      unitName: unit,
      role: role
    };

    onAddStudent(newStudent);
    setName('');
  };

  const startEditing = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditUnit(student.unitName);
    setEditRole(student.role);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;

    const updatedStudent: Student = {
      id,
      name: editName.trim(),
      unitName: editUnit,
      role: editRole
    };

    onUpdateStudent(updatedStudent);
    setEditingId(null);
  };

  const handleRemoveClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveStudent(id);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-600" />
          Cadastrar Novo Participante
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unidade / Classe</label>
            <select 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button 
            type="submit"
            className="md:col-span-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md flex items-center justify-center gap-2"
          >
            Cadastrar no Sistema
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-800">Participantes Cadastrados ({students.length})</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Unidade</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Função</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Nenhum participante cadastrado.</td>
                </tr>
              ) : (
                [...students].sort((a, b) => a.name.localeCompare(b.name)).map(student => (
                  <tr key={student.id} className={`hover:bg-slate-50 transition-colors ${editingId === student.id ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {editingId === student.id ? (
                        <input 
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      ) : (
                        student.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {editingId === student.id ? (
                        <select 
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          className="w-full p-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">{student.unitName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {editingId === student.id ? (
                        <select 
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full p-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {student.role}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === student.id ? (
                          <>
                            <button 
                              onClick={() => saveEdit(student.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Salvar Alterações"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEditing(student)}
                              className="p-2 text-slate-300 hover:text-indigo-600 transition-colors group"
                              title="Editar Participante"
                            >
                              <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button 
                              onClick={(e) => handleRemoveClick(e, student.id)}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors group"
                              title="Remover Participante"
                            >
                              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
