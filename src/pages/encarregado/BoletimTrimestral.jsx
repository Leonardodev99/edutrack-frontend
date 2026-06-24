import { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, Download, BookOpen, AlertCircle, CheckCircle, Award, Loader2 } from 'lucide-react';
import api from '../../services/api'; // Instância do Axios configurada
import '../../styles/BoletimTrimestral.css';
import html2pdf from 'html2pdf.js';

export default function BoletimTrimestral() {
  const [trimestreAtivo, setTrimestreAtivo] = useState(1);
  const [notasApi, setNotasApi] = useState([]);
  const [studentId, setStudentId] = useState(null); // Armazena o ID para o download
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // Estado de loading para o PDF
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarDadosBoletim() {
      try {
        setLoading(true);
        const token = localStorage.getItem("@EduTrack:token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Buscamos o perfil do encarregado para descobrir o ID do educando vinculado
        const responseGuardian = await api.get("/guardians/me", { headers });
        const meuPerfilGuardian = responseGuardian.data;

        if (!meuPerfilGuardian || !meuPerfilGuardian.students || meuPerfilGuardian.students.length === 0) {
          setErro("Nenhum educando vinculado a este encarregado.");
          setLoading(false);
          return;
        }

        // Captura o ID do primeiro estudante vinculado
        const idEstudante = meuPerfilGuardian.students[0].id;
        setStudentId(idEstudante);

        // 2. Busca as notas reais do estudante no backend avançado
        const responseGrades = await api.get(`/students/${idEstudante}/grades`, { headers });
        
        // Se a API retornar a propriedade .data dentro do corpo envelopado
        if (responseGrades.data && responseGrades.data.data) {
          setNotasApi(responseGrades.data.data);
        } else if (Array.isArray(responseGrades.data)) {
          setNotasApi(responseGrades.data);
        } else {
          setNotasApi([]);
        }
        
        setErro(null);
      } catch (err) {
        console.error("Erro ao buscar boletim:", err);
        setErro("Não foi possível carregar os dados de avaliação do educando.");
      } finally {
        setLoading(false);
      }
    }

    carregarDadosBoletim();
  }, []);

  // Mapeia e distribui dinamicamente os dados vindos da API para o formato esperado pela tabela
  const dadosBoletimProcessados = useMemo(() => {
    const estrutura = { 1: [], 2: [], 3: [] };

    if (!Array.isArray(notasApi) || notasApi.length === 0) return estrutura;

    notasApi.forEach((item) => {
      if (!item) return;
      const disciplinaNome = item.teacher?.disciplina || item.schedule?.disciplina || "Educação Tecnológica";
      const trimestreDaTask = item.submission?.task?.trimestre || item.trimestre || 1; 

      let linhaDisciplina = estrutura[trimestreDaTask].find(d => d.disciplina === disciplinaNome);

      if (!linhaDisciplina) {
        linhaDisciplina = {
          id: `grade-${item.id}`,
          disciplina: disciplinaNome,
          mac: 0,
          prova: 0,
          projeto: 0,
          contador: 0,
          somaNotas: 0
        };
        estrutura[trimestreDaTask].push(linhaDisciplina);
      }

      const tipoTask = (item.submission?.task?.title || item.tipoAvaliacao || '').toLowerCase();
      const notaValor = Number(item.score || item.valor || 0);

      if (tipoTask.includes('prova') || tipoTask.includes('exame')) {
        linhaDisciplina.prova = notaValor;
      } else if (tipoTask.includes('projeto') || tipoTask.includes('prático')) {
        linhaDisciplina.projeto = notaValor;
      } else {
        linhaDisciplina.mac = linhaDisciplina.mac === 0 ? notaValor : (linhaDisciplina.mac + notaValor) / 2;
      }

      linhaDisciplina.contador += 1;
      linhaDisciplina.somaNotas += notaValor;
      linhaDisciplina.media = linhaDisciplina.somaNotas / linhaDisciplina.contador;
      linhaDisciplina.resultado = linhaDisciplina.media >= 10 ? "Aprovado" : "Abaixo da Média";
    });

    return estrutura;
  }, [notasApi]);

  const notasExibidas = useMemo(() => {
    return dadosBoletimProcessados[trimestreAtivo] || [];
  }, [dadosBoletimProcessados, trimestreAtivo]);

  const mediaGlobalTrimestre = useMemo(() => {
    if (notasExibidas.length === 0) return "0.0";
    const soma = notasExibidas.reduce((acc, curr) => acc + curr.media, 0);
    return (soma / notasExibidas.length).toFixed(1);
  }, [notasExibidas]);


  // 📥 FUNÇÃO QUE FAZ O DOWNLOAD DO PDF REAL DO BACKEND
  const handleImprimirBoletim = () => {
  const elemento = document.querySelector(".boletim-table-wrapper"); // Seleciona a tabela
  
  const opcoes = {
    margin:       10,
    filename:     `Boletim_${trimestreAtivo}_Trimestre.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' } // Landscape fica melhor para tabelas
  };

  setExporting(true);
  
  html2pdf().set(opcoes).from(elemento).save()
    .then(() => setExporting(false))
    .catch(() => setExporting(false));
};

  if (loading) {
    return (
      <div className="boletim-loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} color="#0066cc" />
        <p style={{ color: '#666' }}>Buscando registros no EduTrack...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="boletim-error-container" style={{ padding: '2rem', textAlign: 'center', background: '#fff5f5', borderRadius: '8px', border: '1px solid #ffcccc', margin: '2rem' }}>
        <AlertCircle size={36} color="#cc0000" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#cc0000', marginBottom: '0.5rem' }}>Aviso de Sistema</h3>
        <p style={{ color: '#555' }}>{erro}</p>
      </div>
    );
  }

  return (
    <div className="boletim-page">
      {/* Cabeçalho */}
      <div className="page-header-boletim">
        <div>
          <h1 className="page-title">Boletim de Notas Trimestral</h1>
          <p className="page-subtitle">Consulte o rendimento detalhado, notas de provas e médias por período.</p>
        </div>
        <button 
          className="btn-export-pdf" 
          onClick={handleImprimirBoletim} 
          disabled={notasExibidas.length === 0 || exporting}
          style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}
        >
          {exporting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Download size={16} />
          )}
          <span>{exporting ? 'A carregar PDF...' : 'Baixar Boletim Oficial'}</span>
        </button>
      </div>

      {/* Abas Seletoras de Trimestre */}
      <div className="trimestre-tabs-nav">
        {[1, 2, 3].map((t) => (
          <button
            key={t}
            onClick={() => setTrimestreAtivo(t)}
            className={`tab-trigger-btn ${trimestreAtivo === t ? 'is-active' : ''}`}
          >
            <FileSpreadsheet size={16} />
            <span>{t}º Trimestre</span>
          </button>
        ))}
      </div>

      {/* Painel de Destaque */}
      <div className="trimestre-insights-banner">
        <div className="insight-content-block">
          <Award size={24} className="insight-icon" />
          <div>
            <span className="insight-label">Média Geral do {trimestreAtivo}º Trimestre</span>
            <div className="insight-value-group">
              <span className="insight-big-number">{mediaGlobalTrimestre}</span>
              <span className="insight-max-scale">/ 20 valores</span>
            </div>
          </div>
        </div>
        <div className="insight-status-badge">
          <CheckCircle size={16} />
          <span>Situação: {Number(mediaGlobalTrimestre) >= 10 ? 'Aprovado' : 'Atenção Requerida'}</span>
        </div>
      </div>

      {/* Tabela de Classificações */}
      <div className="boletim-table-wrapper">
        <table className="boletim-table">
          <thead>
            <tr>
              <th>Componente Curricular (Disciplina)</th>
              <th className="text-center">Avaliação Contínua (MAC)</th>
              <th className="text-center">Prova Escrita</th>
              <th className="text-center">Trabalho Prático / Projeto</th>
              <th className="text-center font-bold">Média do Trimestre</th>
              <th className="text-center">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {notasExibidas.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center" style={{ padding: '2rem', color: '#888' }}>
                  Nenhuma avaliação registrada para o {trimestreAtivo}º trimestre.
                </td>
              </tr>
            ) : (
              notasExibidas.map((nota) => {
                const estaAbaixoDaMedia = nota.media < 10;
                
                return (
                  <tr key={nota.id} className={estaAbaixoDaMedia ? 'row-grade-danger' : ''}>
                    <td className="font-semibold">
                      <div className="discipline-cell">
                        <BookOpen size={14} />
                        <span>{nota.disciplina}</span>
                      </div>
                    </td>
                    <td className="text-center font-medium text-muted">{nota.mac.toFixed(1)}</td>
                    <td className="text-center font-medium text-muted">{nota.prova.toFixed(1)}</td>
                    <td className="text-center font-medium text-muted">{nota.projeto.toFixed(1)}</td>
                    <td className="text-center">
                      <span className={`final-grade-badge ${estaAbaixoDaMedia ? 'low-grade' : 'good-grade'}`}>
                        {nota.media.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`result-status-badge ${estaAbaixoDaMedia ? 'status-danger' : 'status-success'}`}>
                        {nota.resultado}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="boletim-footer-legend">
        <div className="legend-title">
          <AlertCircle size={14} />
          <span>Critério de Avaliação & Notas Informativas:</span>
        </div>
        <p>
          * <strong>MAC:</strong> Média de Avaliação Contínua (comportamento, assiduidade, tarefas e participação diária). <br />
          * A nota mínima operacional para aprovação direta em qualquer componente é de <strong>10.0 valores</strong>.
        </p>
      </div>
    </div>
  );
}