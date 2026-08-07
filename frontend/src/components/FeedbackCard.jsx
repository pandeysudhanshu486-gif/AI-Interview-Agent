import React from 'react';

const STYLES = {
  container: {
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
    background: 'linear-gradient(90deg, #10b981, #6366f1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  verdictChip: (verdict) => {
    const isHire = verdict?.toUpperCase().includes('HIRE') && !verdict?.toUpperCase().includes('NO');
    return {
      padding: '0.4rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.85rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      background: isHire ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      color: isHire ? '#34d399' : '#f87171',
      border: `1px solid ${isHire ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
    };
  },
  scoreBadge: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#6366f1',
    background: 'rgba(99, 102, 241, 0.15)',
    padding: '0.4rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  summaryBox: {
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    lineHeight: 1.7,
    marginBottom: '1.75rem',
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  },
  cardSection: {
    background: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '16px',
    padding: '1.25rem',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  listItem: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  actionGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  pdfBtn: {
    flex: 1,
    padding: '1rem',
    borderRadius: '14px',
    border: '1px solid rgba(99, 102, 241, 0.4)',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.2)',
    transition: 'all 0.2s ease',
  },
  resetBtn: {
    flex: 1,
    padding: '1rem',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #10b981)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s ease',
  },
};

function FeedbackCard({ feedback, onReset }) {
  const strengths = feedback.strengths || [];
  const gaps = feedback.gaps || [];
  const next = feedback.next || feedback.recommendations || [];
  const verdict = feedback.verdict || 'COMPLETED';
  const score = feedback.overall_score || feedback.score || 'N/A';

  const handleDownloadPDF = () => {
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ABTalks AI Cohort - Interview Evaluation Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; color: #1e1b4b; font-weight: bold; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .badge-container { margin: 20px 0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .score { font-size: 20px; font-weight: bold; color: #4f46e5; }
          .verdict { font-size: 16px; font-weight: bold; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; background: #dcfce7; color: #166534; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #334155; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
          ul { padding-left: 20px; margin: 0; }
          li { font-size: 14px; line-height: 1.6; margin-bottom: 6px; color: #475569; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">⚡ ABTalks AI Cohort Assessment</div>
          <div class="subtitle">31-Day Enterprise AI Engineering Technical Interview Evaluation</div>
        </div>

        <div class="badge-container">
          <div class="score">Overall Score: ${score} / 10</div>
          <div class="verdict">${verdict}</div>
        </div>

        <div class="section">
          <div class="section-title">📝 Summary & Evaluation Overview</div>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">${feedback.summary || feedback.raw_evaluation || 'Evaluation completed.'}</p>
        </div>

        <div class="section">
          <div class="section-title">✅ Key Technical Strengths</div>
          <ul>
            ${strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">⚠️ Identified Technical Gaps</div>
          <ul>
            ${gaps.map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">🚀 Concrete Learning Recommendations</div>
          <ul>
            ${next.map(n => `<li>${n}</li>`).join('')}
          </ul>
        </div>

        <div class="footer">
          Generated automatically by ABTalks AI Technical Interview Engine • Date: ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div style={STYLES.container}>
      <div style={STYLES.topHeader}>
        <div>
          <h2 style={STYLES.title}>Interview Evaluation</h2>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            ABTalks AI Cohort Assessment
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {score && <div style={STYLES.scoreBadge}>{score} / 10</div>}
          <div style={STYLES.verdictChip(verdict)}>{verdict}</div>
        </div>
      </div>

      <div style={STYLES.summaryBox}>
        <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.3rem' }}>
          Summary:
        </strong>
        {feedback.summary || feedback.raw_evaluation || 'Evaluation completed successfully.'}
      </div>

      <div style={STYLES.sectionGrid}>
        <div style={STYLES.cardSection}>
          <h3 style={{ ...STYLES.sectionTitle, color: '#34d399' }}>
            <span>✅</span> Key Strengths
          </h3>
          <ul style={STYLES.list}>
            {strengths.length > 0 ? (
              strengths.map((item, idx) => (
                <li key={idx} style={STYLES.listItem}>
                  <span>•</span> {item}
                </li>
              ))
            ) : (
              <li style={STYLES.listItem}>No specific strengths recorded.</li>
            )}
          </ul>
        </div>

        <div style={STYLES.cardSection}>
          <h3 style={{ ...STYLES.sectionTitle, color: '#f87171' }}>
            <span>⚠️</span> Technical Gaps
          </h3>
          <ul style={STYLES.list}>
            {gaps.length > 0 ? (
              gaps.map((item, idx) => (
                <li key={idx} style={STYLES.listItem}>
                  <span>•</span> {item}
                </li>
              ))
            ) : (
              <li style={STYLES.listItem}>No critical gaps identified.</li>
            )}
          </ul>
        </div>
      </div>

      {next.length > 0 && (
        <div style={{ ...STYLES.cardSection, marginBottom: '1.75rem' }}>
          <h3 style={{ ...STYLES.sectionTitle, color: '#60a5fa' }}>
            <span>🚀</span> Next Recommendations
          </h3>
          <ul style={STYLES.list}>
            {next.map((item, idx) => (
              <li key={idx} style={STYLES.listItem}>
                <span>•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={STYLES.actionGroup}>
        <button style={STYLES.pdfBtn} onClick={handleDownloadPDF}>
          📥 Download PDF Report
        </button>
        <button style={STYLES.resetBtn} onClick={onReset}>
          🔄 Start New Session
        </button>
      </div>
    </div>
  );
}

export default FeedbackCard;
