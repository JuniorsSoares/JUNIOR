
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Eye, EyeOff, Loader2, ChevronRight, BookOpen, Star } from 'lucide-react';

export const AuthScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const translateError = (msg: string): string => {
        if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
        if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
        if (msg.includes('Unable to validate email')) return 'E-mail inválido.';
        if (msg.includes('over_email_send_rate_limit')) return 'Muitas tentativas. Aguarde um momento.';
        return 'Ocorreu um erro. Tente novamente.';
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(translateError(error.message));
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', fontFamily: "'Inter', 'Segoe UI', sans-serif",
            position: 'relative', overflow: 'hidden',
        }}>

            {/* Efeitos de fundo */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Card */}
            <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', padding: '40px 36px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

                {/* Logo + identidade */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{ width: '90px', height: '90px', background: 'white', borderRadius: '22px', padding: '10px', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/logo.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                        Sistema de Gincanas
                    </h1>
                    <p style={{ color: '#818cf8', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>
                        IASD PLANALTO
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>E-mail</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '17px', height: '17px', color: '#64748b', pointerEvents: 'none' }} />
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                placeholder="seu@email.com"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Senha */}
                    <div>
                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Senha</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '17px', height: '17px', color: '#64748b', pointerEvents: 'none' }} />
                            <input
                                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                placeholder="••••••••"
                                style={{ ...inputStyle, paddingRight: '46px' }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex' }}>
                                {showPassword ? <EyeOff style={{ width: '17px', height: '17px' }} /> : <Eye style={{ width: '17px', height: '17px' }} />}
                            </button>
                        </div>
                    </div>

                    {/* Erro */}
                    {error && (
                        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', fontWeight: 500 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Botão */}
                    <button
                        type="submit" disabled={loading}
                        style={{
                            marginTop: '6px', padding: '14px',
                            background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                            border: 'none', borderRadius: '14px',
                            color: '#ffffff', fontSize: '15px', fontWeight: 800,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.4)',
                            transition: 'all 0.2s ease', letterSpacing: '0.3px',
                        }}
                    >
                        {loading ? (
                            <><Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Aguarde...</>
                        ) : (
                            <>Entrar no Sistema <ChevronRight style={{ width: '18px', height: '18px' }} /></>
                        )}
                    </button>
                </form>

                {/* Rodapé */}
                <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Star style={{ width: '13px', height: '13px', color: '#f59e0b', fill: '#f59e0b' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <BookOpen style={{ width: '13px', height: '13px', color: '#475569' }} />
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '0.5px' }}>
                            Sistema de Gincanas • IASD PLANALTO
                        </span>
                    </div>
                    <Star style={{ width: '13px', height: '13px', color: '#f59e0b', fill: '#f59e0b' }} />
                </div>

                <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          input::placeholder { color: #475569; }
          input:focus { outline: none; border-color: #6366f1 !important; background: rgba(99,102,241,0.08) !important; }
        `}</style>
            </div>
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px 13px 44px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
};
