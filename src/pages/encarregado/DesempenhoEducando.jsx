import { useState } from 'react';
import { LineChart, Award, TrendingUp, Target, Brain, ShieldAlert, Star } from 'lucide-react';
import '../../styles/DesempenhoEducando.css';

export default function DesempenhoEducando() {
  // Estado para alternar entre a visão geral e o filtro por disciplina
  const [disciplinaFoco, setDisciplinaFoco] = useState("geral");

  // Mock de dados analíticos de desempenho do educando (Lucas Silva)
  const metricasComportamentais = [
    { id: "c1", criterio: "Participação e Engajamento", valor: 90, nivel: "Excelente" },
    { id: "c2", criterio: "Trabalho em Equipe & Projetos", valor: 95, nivel: "Excepcional" },
    { id: "c3", criterio: "Pontualidade e Entrega", valor: 85, nivel: "Bom" },
    { id: "c4", criterio: "Autonomia e Resolução de Problemas", valor: 80, nivel: "Bom" },
  ];

  const evolucaoNotas = [
    { trimestre: "1º Trimestre", media: 15.5, status: "Estável" },
    { trimestre: "2º Trimestre", media: 16.2, status: "Crescimento" },
    { trimestre: "3º Trimestre (Atual)", media: 17.8, status: "Alta Performance" },
  ];

  const observacoesOrientador = [
    { id: 1, data: "2026-05-20", autor: "Prof. Ana Sousa", nota: "O Lucas demonstrou uma evolução fantástica no desenvolvimento da lógica do seu projeto prático de games. Destaca-se na entreajuda com os colegas de equipe." },
    { id: 2, data: "2026-04-12", autor: "Psicopedagoga Marta Reis", nota: "Reunião de alinhamento concluída. O aluno respondeu muito bem aos novos estímulos de autonomia, refletindo diretamente na subida das suas notas de Digital Sciences." }
  ];

  return (
    <div className="desempenho-page">
      {/* Cabeçalho da Página */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatório Analítico de Desempenho</h1>
          <p className="page-subtitle">Consulte o mapeamento de competências, evolução pedagógica e pareceres da equipe de orientação.</p>
        </div>
      </div>

      {/* Grid Superior: Mapeamento de Competências e Linha de Evolução */}
      <div className="desempenho-main-grid">
        
        {/* Bloco de Hard & Soft Skills (Barras CSS Nativas) */}
        <div className="desempenho-card">
          <div className="desempenho-card-header">
            <Brain size={18} className="text-primary" />
            <h2>Avaliação de Competências (Soft & Hard Skills)</h2>
          </div>
          
          <div className="skills-bars-container">
            {metricasComportamentais.map((skill) => (
              <div key={skill.id} className="skill-progress-item">
                <div className="skill-info-row">
                  <span className="skill-name">{skill.criterio}</span>
                  <span className="skill-percentage-badge">{skill.valor}% ({skill.nivel})</span>
                </div>
                <div className="skill-bar-track">
                  <div 
                    className="skill-bar-fill" 
                    style={{ width: `${skill.valor}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco de Evolução Trimestral Temporal */}
        <div className="desempenho-card">
          <div className="desempenho-card-header">
            <TrendingUp size={18} className="text-success" />
            <h2>Histórico de Evolução de Médias</h2>
          </div>

          <div className="timeline-evolution-list">
            {evolucaoNotas.map((evt, index) => (
              <div key={index} className="timeline-evolution-row">
                <div className="timeline-node-indicator">
                  <div className="node-dot" />
                  {index !== evolucaoNotas.length - 1 && <div className="node-line" />}
                </div>
                <div className="timeline-evolution-content">
                  <div className="evolution-meta">
                    <span className="evolution-period">{evt.trimestre}</span>
                    <span className="evolution-trend-tag">{evt.status}</span>
                  </div>
                  <div className="evolution-grade-display">
                    <span className="evolution-grade-num">{evt.media.toFixed(1)}</span>
                    <span className="evolution-grade-max">/20 valores</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Seção Inferior: Radar de Metas Operacionais e Quadro de Pareceres */}
      <div className="desempenho-secondary-grid">
        
        {/* Caixa de Metas de Aprendizagem */}
        <div className="desempenho-card bg-surface-alt">
          <div className="desempenho-card-header">
            <Target size={18} className="text-warning" />
            <h2>Metas Pedagógicas Vigentes</h2>
          </div>
          
          <div className="goals-vertical-stack">
            <div className="goal-status-box checked">
              <div className="goal-checkbox">✓</div>
              <div>
                <h4>Alcançar Média Superior a 16 em Game Dev</h4>
                <p>Meta atingida com sucesso no fechamento parcial do mês.</p>
              </div>
            </div>

            <div className="goal-status-box pending">
              <div className="goal-checkbox"></div>
              <div>
                <h4>Zerar Faltas Injustificadas</h4>
                <p>Manter assiduidade total nas próximas 4 semanas letivas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notas do Corpo Docente e Orientação */}
        <div className="desempenho-card">
          <div className="desempenho-card-header">
            <Star size={18} className="text-primary" />
            <h2>Parecer da Orientação & Conselho de Notas</h2>
          </div>

          <div className="feedbacks-comments-list">
            {observacoesOrientador.map((obs) => (
              <div key={obs.id} className="feedback-comment-item">
                <div className="feedback-comment-header">
                  <span className="comment-author">{obs.autor}</span>
                  <span className="comment-date">{new Date(obs.data).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="comment-text-body">"{obs.nota}"</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}