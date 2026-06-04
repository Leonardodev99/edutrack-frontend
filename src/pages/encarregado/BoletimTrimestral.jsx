import { useState, useMemo } from 'react';
import { FileSpreadsheet, Download, BookOpen, AlertCircle, CheckCircle, Award } from 'lucide-react';
import '../../styles/BoletimTrimestral.css';

export default function BoletimTrimestral() {
  // Estado para controlar o trimestre selecionado
  const [trimestreAtivo, setTrimestreAtivo] = useState(1);

  // Mock estruturado das notas do educando (Lucas Silva) por trimestre
  const dadosBoletim = {
    1: [
      { id: "b1-1", disciplina: "Junior Game Development", mac: 16.5, prova: 15.0, projeto: 18.0, media: 16.5, resultado: "Aprovado" },
      { id: "b1-2", disciplina: "Digital Sciences", mac: 14.0, prova: 13.5, projeto: 16.0, media: 14.5, resultado: "Aprovado" },
    ],
    2: [
      { id: "b2-1", disciplina: "Junior Game Development", mac: 17.0, prova: 16.5, projeto: 19.0, media: 17.5, resultado: "Aprovado" },
      { id: "b2-2", disciplina: "Digital Sciences", mac: 12.5, prova: 11.0, projeto: 14.0, media: 12.5, resultado: "Aprovado" },
    ],
    3: [
      { id: "b3-1", disciplina: "Junior Game Development", mac: 18.0, prova: 17.0, projeto: 19.5, media: 18.2, resultado: "Aprovado" },
      { id: "b3-2", disciplina: "Digital Sciences", mac: 15.0, prova: 14.0, projeto: 17.0, media: 15.3, resultado: "Aprovado" },
    ]
  };

  // Calcula a média global ponderada do trimestre selecionado
  const mediaGlobalTrimestre = useMemo(() => {
    const notasFlat = dadosBoletim[trimestreAtivo] || [];
    if (notasFlat.length === 0) return "0.0";
    const soma = notasFlat.reduce((acc, curr) => acc + curr.media, 0);
    return (soma / notasFlat.length).toFixed(1);
  }, [trimestreAtivo]);

  // Função simulada para download do boletim em PDF
  const handleImprimirBoletim = () => {
    alert(`Preparando download do arquivo PDF: Boletim_Trimestre_${trimestreAtivo}_Lucas_Silva.pdf`);
  };

  const notasExibidas = dadosBoletim[trimestreAtivo] || [];

  return (
    <div className="boletim-page">
      {/* Cabeçalho da Página */}
      <div className="page-header-boletim">
        <div>
          <h1 className="page-title">Boletim de Notas Trimestral</h1>
          <p className="page-subtitle">Consulte o rendimento detalhado, notas de provas e médias por período.</p>
        </div>
        <button className="btn-export-pdf" onClick={handleImprimirBoletim}>
          <Download size={16} />
          <span>Baixar Boletim Oficial</span>
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

      {/* Painel de Destaque da Média Periódica */}
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
          <span>Situação: Regularizado</span>
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
            {notasExibidas.map((nota) => {
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
                      {estaAbaixoDaMedia ? 'Abaixo da Média' : nota.resultado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legenda de Critérios */}
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