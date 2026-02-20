
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UNITS } from '../constants';
import {
    Users, UserPlus, Trash2, Mail, Lock, User, Shield, MapPin,
    Loader2, Eye, EyeOff, Crown, BookOpen, Pencil, X, Check
} from 'lucide-react';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    unit_name: string;
    role: 'admin' | 'professor';
    created_at: string;
}

export const UserManager: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Edição
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState<'admin' | 'professor'>('professor');
    const [editUnit, setEditUnit] = useState('');
    const [saving, setSaving] = useState(false);

    // Form state (criação)
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [unitName, setUnitName] = useState(UNITS[0]);
    const [role, setRole] = useState<'admin' | 'professor'>('professor');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!fullName.trim()) { setError('Informe o nome completo.'); return; }
        if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }

        setCreating(true);
        const finalUnit = role === 'admin' ? 'all' : unitName;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setError('Sessão expirada. Faça login novamente.');
            setCreating(false);
            return;
        }

        const { data, error: fnError } = await supabase.functions.invoke('create-user', {
            body: { email, password, fullName, unitName: finalUnit, role },
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (fnError || (data && data.error)) {
            setError(data?.error || fnError?.message || 'Erro ao criar usuário.');
            setCreating(false);
            return;
        }

        setSuccess(`Usuário "${fullName}" criado com sucesso! Ele já pode fazer login.`);
        setFullName(''); setEmail(''); setPassword('');
        setUnitName(UNITS[0]); setRole('professor');
        setShowForm(false);
        loadUsers();
        setCreating(false);
    };

    const startEdit = (user: UserProfile) => {
        setEditingId(user.id);
        setEditName(user.full_name);
        setEditRole(user.role);
        setEditUnit(user.unit_name);
        setError('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setError('');
    };

    const handleSaveEdit = async (userId: string) => {
        if (!editName.trim()) { setError('Informe o nome completo.'); return; }
        setSaving(true);
        setError('');

        const finalUnit = editRole === 'admin' ? 'all' : editUnit;

        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ full_name: editName, role: editRole, unit_name: finalUnit })
            .eq('id', userId);

        if (updateError) {
            setError('Erro ao salvar alterações: ' + updateError.message);
        } else {
            setSuccess('Usuário atualizado com sucesso!');
            setEditingId(null);
            loadUsers();
        }
        setSaving(false);
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!window.confirm(`Remover o usuário "${userName}"? Esta ação não pode ser desfeita.`)) return;
        await supabase.from('user_profiles').delete().eq('id', userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        setSuccess(`Usuário "${userName}" removido.`);
    };

    const roleLabel = (r: string) => r === 'admin' ? 'Administrador' : 'Professor';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-2xl">
                        <Users className="w-6 h-6 text-indigo-700" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Gerenciar Usuários</h3>
                        <p className="text-xs text-slate-500">Cadastre professores e defina o nível de acesso</p>
                    </div>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md text-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Novo Usuário
                </button>
            </div>

            {/* Mensagens */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 font-medium text-sm flex items-center justify-between">
                    <span>✅ {success}</span>
                    <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && !editingId && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-medium text-sm flex items-center justify-between">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Formulário de Criação */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-6">
                    <h4 className="font-black text-slate-800 text-base mb-5 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-600" />
                        Cadastrar Novo Usuário
                    </h4>

                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nome */}
                        <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                                    placeholder="Ex: Maria Silva"
                                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    placeholder="email@exemplo.com"
                                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Papel */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nível de Acesso</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={role} onChange={e => setRole(e.target.value as any)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all appearance-none cursor-pointer"
                                >
                                    <option value="professor">Professor (vê só sua unidade)</option>
                                    <option value="admin">Administrador (acesso total)</option>
                                </select>
                            </div>
                        </div>

                        {/* Unidade (só para professor) */}
                        {role === 'professor' && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unidade / Classe</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={unitName} onChange={e => setUnitName(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Erro no form */}
                        {error && (
                            <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Botões */}
                        <div className="md:col-span-2 flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setError(''); }}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit" disabled={creating}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                {creating ? 'Criando...' : 'Criar Usuário'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Usuários */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {users.length} usuário(s) cadastrado(s)
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Nenhum usuário cadastrado
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {users.map(user => (
                            <div key={user.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                                {editingId === user.id ? (
                                    /* ── MODO EDIÇÃO ── */
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">✏️ Editando usuário</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {/* Nome */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                    <input
                                                        type="text" value={editName} onChange={e => setEditName(e.target.value)}
                                                        className="w-full pl-8 pr-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50"
                                                    />
                                                </div>
                                            </div>

                                            {/* Role */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nível de Acesso</label>
                                                <div className="relative">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                    <select
                                                        value={editRole} onChange={e => setEditRole(e.target.value as any)}
                                                        className="w-full pl-8 pr-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50 appearance-none cursor-pointer"
                                                    >
                                                        <option value="professor">Professor</option>
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Unidade */}
                                            {editRole === 'professor' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unidade</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                        <select
                                                            value={editUnit} onChange={e => setEditUnit(e.target.value)}
                                                            className="w-full pl-8 pr-3 py-2 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50 appearance-none cursor-pointer"
                                                        >
                                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {error && editingId === user.id && (
                                            <p className="text-red-600 text-xs font-medium">⚠️ {error}</p>
                                        )}

                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => handleSaveEdit(user.id)}
                                                disabled={saving}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all"
                                            >
                                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                Salvar
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-xs transition-all"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── MODO VISUALIZAÇÃO ── */
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${user.role === 'admin' ? 'bg-indigo-100' : 'bg-sky-100'}`}>
                                            {user.role === 'admin' ? <Crown className="w-6 h-6 text-indigo-600" /> : <BookOpen className="w-6 h-6 text-sky-600" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-black text-slate-800 text-sm truncate">{user.full_name || '(sem nome)'}</h4>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'}`}>
                                                    {roleLabel(user.role)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                            {user.role === 'professor' && (
                                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {user.unit_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() => startEdit(user)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Editar usuário"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id, user.full_name)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remover usuário"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
