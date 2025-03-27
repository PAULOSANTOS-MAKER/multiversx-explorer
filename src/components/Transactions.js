import React, { useEffect, useState } from 'react';
import api from '../api';

function Transactions({ blockHash }) {
  const [blockData, setBlockData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const res = await api.get(`/blocks/${blockHash}`);
        setBlockData(res.data);
      } catch (err) {
        setError('Erro ao buscar detalhes do bloco 😥');
      } finally {
        setLoading(false);
      }
    };

    fetchBlock();
  }, [blockHash]);

  if (loading) return <p>Carregando detalhes do bloco...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ textAlign: 'left', padding: '1rem' }}>
      <h2>Detalhes do Bloco</h2>
      <p><strong>Hash:</strong> {blockData.hash}</p>
      <p><strong>Nonce:</strong> {blockData.nonce}</p>
      <p><strong>Timestamp:</strong> {new Date(blockData.timestamp * 1000).toLocaleString()}</p>
      <p><strong>Epoch:</strong> {blockData.epoch}</p>
      <p><strong>Shard:</strong> {blockData.shard}</p>
      <p><strong>Número de Transações:</strong> {blockData.numTxs}</p>
      <p><strong>Proposer:</strong> {blockData.proposer}</p>
    </div>
  );
}

export default Transactions;
