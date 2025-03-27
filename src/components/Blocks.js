import React, { useEffect, useState } from 'react';
import api from '../api';

function Blocks({ onBlockSelect }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await api.get('/blocks?from=0&size=5');
        setBlocks(response.data);
      } catch (err) {
        setError('Erro ao buscar blocos :(');
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  if (loading) {
    return <p>Carregando blocos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Lista de Blocos Reais (MultiversX)</h2>
      {blocks.map((block) => (
        <button key={block.hash} onClick={() => onBlockSelect(block.hash)}>
          Bloco #{block.nonce}
        </button>
      ))}
    </div>
  );
}

export default Blocks;

