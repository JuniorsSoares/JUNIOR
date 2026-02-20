
import React, { useRef, useState } from 'react';
import { LogEntry, Student } from '../types';
import { ACTIVITIES, UNITS } from '../constants';
import { FileSpreadsheet, Download, Table, Users, BarChart, Database, Upload, Save, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportsProps {
  entries: LogEntry[];
  students: Student[];
  onImport: (students: Student[], entries: LogEntry[]) => void;
}

export const Reports: React.FC<ReportsProps> = ({ entries, students, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const getActivityLabel = (id: string) => {
    if (id === 'redemption') return 'Resgate de Brinde';
    if (id === 'withdrawal') return 'Retirada de Pontos (Ajuste)';
    return ACTIVITIES.find(a => a.id === id)?.label || 'Atividade';
  };

  const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(";"),
      ...rows.map(r => r.map(field => {
        // Escapa aspas duplas e envolve o campo em aspas se for string
        const stringified = String(field ?? '').replace(/"/g, '""');
        return `"${stringified}"`;
      }).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFullBackup = () => {
    const headers = ["TIPO_REGISTRO", "ID", "NOME_STUDENT", "UNIDADE", "FUNCAO_ROLE", "DATA_ISO", "ATIVIDADE_ID", "PONTOS", "QUANTIDADE", "STUDENT_ID_REF", "NOTAS"];
    
    const studentRows = students.map(s => [
      "ESTUDANTE",
      s.id,
      s.name,
      s.unitName,
      s.role,
      "", "", "", "", "", ""
    ]);

    const entryRows = entries.map(e => [
      "LANCAMENTO",
      e.id,
      e.studentName,
      e.unitName,
      "",
      e.date,
      e.activityId,
      e.points,
      e.quantity,
      e.studentId || "",
      (e.notes || '').replace(/\n/g, ' ')
    ]);

    downloadCSV("BACKUP_ALUNO_NOTA10", headers, [...studentRows, ...entryRows]);
  };

  // Função robusta para ler CSV lidando com campos entre aspas que contém o delimitador
  const parseCSVLine = (line: string) => {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ';' && !inQuote) {
        result.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let text = event.target?.result as string;
        
        // Remove Byte Order Mark (BOM) se presente
        if (text.startsWith('\ufeff')) {
          text = text.substring(1);
        }

        const lines = text.split(/\r?\n/);
        if (lines.length < 2) throw new Error("Arquivo vazio ou inválido.");

        const importedStudents: Student[] = [];
        const importedEntries: LogEntry[] = [];

        // Começamos do índice 1 para pular o cabeçalho
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const parts = parseCSVLine(line);
          const type = parts[0];

          if (type === "ESTUDANTE" && parts[1] && parts[2]) {
            importedStudents.push({
              id: parts[1],
              name: parts[2],
              unitName: parts[3],
              role: parts[4]
            });
          } else if (type === "LANCAMENTO" && parts[1] && parts[5]) {
            importedEntries.push({
              id: parts[1],
              studentName: parts[2],
              unitName: parts[3],
              date: parts[5],
              activityId: parts[6],
              points: parseInt(parts[7]) || 0,
              quantity: parseInt(parts[8]) || 0,
              studentId: parts[9],
              notes: parts[10]
            });
          }
        }

        if (importedStudents.length === 0 && importedEntries.length === 0) {
          throw new Error("Nenhum dado válido encontrado no CSV.");
        }

        const msg = `Deseja restaurar este backup?\n\nAlunos: ${importedStudents.length}\nLançamentos: ${importedEntries.length}\n\nISSO SUBSTITUIRÁ TODOS OS DADOS ATUAIS.`;
        
        if (window.confirm(msg)) {
          setStatus('loading');
          // Pequeno timeout para garantir que o loading apareça
          setTimeout(() => {
            onImport(importedStudents, importedEntries);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
          }, 600);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Erro desconhecido ao ler CSV.");
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overlay de Status */}
      {status !== 'idle' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md">
           <div className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in duration-300 max-w-sm text-center">
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                  <h3 className="text-2xl font-black text-slate-800">Restaurando Dados...</h3>
                </>
              ) : status === 'success' ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">Backup Aplicado!</h3>
                  <p className="text-slate-500 font-medium text-sm">O sistema foi atualizado com sucesso.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">Falha no Import</h3>
                  <p className="text-red-500 font-medium text-sm">{errorMessage}</p>
                  <button onClick={() => setStatus('idle')} className="mt-4 px-6 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">Fechar</button>
                </>
              )}
           </div>
        </div>
      )}

      <div className="bg-blue-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileSpreadsheet className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-blue-400" />
            Central de Dados e Backup
          </h2>
          <p className="text-blue-100/80 leading-relaxed font-medium">
            Gerencie o histórico e a segurança da gincana. Baixe backups em formato CSV para portabilidade total dos dados.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-dashed border-indigo-200">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="p-6 bg-indigo-50 rounded-[2rem] shrink-0 border border-indigo-100">
            <Database className="w-12 h-12 text-indigo-600" />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-xl font-black text-slate-800 mb-2">Segurança Total em CSV</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              O backup contém todos os participantes e lançamentos. É a forma mais segura de migrar entre computadores ou salvar o progresso semanal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <button 
              onClick={exportFullBackup}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-indigo-200 group"
            >
              <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Baixar Backup
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white border-2 border-indigo-600 text-indigo-600 font-black px-10 py-5 rounded-2xl hover:bg-indigo-50 transition-all shadow-sm"
            >
              <Upload className="w-6 h-6" />
              Restaurar Dados
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv" 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between group overflow-hidden relative">
          <BarChart className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <h4 className="text-lg font-black mb-2">Status do Banco</h4>
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Participantes:</span>
                <span className="font-black text-indigo-400">{students.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Lançamentos:</span>
                <span className="font-black text-indigo-400">{entries.length}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Última Sincronização: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white group cursor-pointer hover:bg-indigo-700 transition-colors" onClick={exportFullBackup}>
          <h4 className="text-lg font-black mb-4">Dica de Segurança</h4>
          <p className="text-indigo-100 text-sm leading-relaxed mb-6">
            Sempre baixe um backup após realizar os lançamentos de sábado. Assim, caso o navegador limpe o cache, você não perderá o histórico da gincana.
          </p>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            Fazer Backup Agora <Save className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
