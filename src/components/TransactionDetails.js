import React, { useEffect, useState } from 'react';
import api from '../api';

function TransactionDetails({ txHash }) {
  const [tx, setTx] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get(`/transactions/${txHash}`);
        setTx(res.data);
      } catch (err) {
        setError('Transação não encontrada.');
      } finally {
        setLoading(false);
      }
    };

    fetchTx();
  }, [txHash]);

  if (loading) return <p>Carregando transação...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const ageSeconds = Math.floor(Date.now() / 1000 - tx.timestamp);
  const ageText =
    ageSeconds < 60
      ? `${ageSeconds}s atrás`
      : ageSeconds < 3600
      ? `${Math.floor(ageSeconds / 60)}min atrás`
      : `${Math.floor(ageSeconds / 3600)}h atrás`;

  return (
    <div style={{ textAlign: 'left', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🔍 Detalhes da Transação</h2>
      <p><strong>Hash:</strong> {tx.txHash}</p>
      <p><strong>Status:</strong> {tx.status}</p>
      <p><strong>Idade:</strong> {ageText}</p>
      <p><strong>Data (Local):</strong> {new Date(tx.timestamp * 1000).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p><strong>Data (UTC):</strong> {new Date(tx.timestamp * 1000).toUTCString()}</p>
      <p><strong>Miniblock:</strong> {tx.miniblockHash}</p>
      <p><strong>De:</strong> {tx.sender}</p>
      <p><strong>Para:</strong> {tx.receiver}</p>
      <p><strong>Valor:</strong> {Number(tx.value) / 1e18} EGLD</p>
      <p><strong>Método:</strong> {tx.function || '—'}</p>
    </div>
  );
}

export default TransactionDetails;

