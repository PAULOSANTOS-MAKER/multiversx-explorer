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

  if (loading) return <p className="text-orange-300">Carregando blocos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-400 mb-4">📦 Blocos Recentes</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((block) => (
          <div
            key={block.hash}
            onClick={() => onBlockSelect(block.hash)}
            className="cursor-pointer bg-zinc-950 border border-orange-600 p-4 rounded-lg shadow hover:bg-zinc-900 transition duration-200"
          >
            <p className="text-lg font-semibold text-white">Bloco #{block.nonce}</p>
            <p className="text-sm text-orange-300 truncate">Hash: {block.hash}</p>
            <p className="text-xs text-zinc-400 mt-1">Txs: {block.numTxs}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Blocks;

