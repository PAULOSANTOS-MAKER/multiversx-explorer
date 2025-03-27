import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  // Buscar os 5 blocos mais recentes
  const fetchBlocks = async () => {
    try {
      const response = await axios.get('https://api.multiversx.com/blocks?from=0&size=5');
      setBlocks(response.data);
    } catch (err) {
      console.error('Erro ao buscar blocos:', err);
      setError('Erro ao buscar blocos');
    }
  };

  // Buscar detalhes do bloco (por hash ou nonce)
  const fetchBlockDetails = async (hashOrNonce) => {
    try {
      const res = await axios.get(`https://api.multiversx.com/blocks/${hashOrNonce}`);
      setSelectedBlock(res.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar detalhes:', err);
      setError('Erro ao buscar detalhes do bloco');
    }
  };

  // Ação ao clicar no botão de busca
  const handleSearch = () => {
    if (search.trim()) {
      fetchBlockDetails(search.trim());
    }
  };

  // Buscar blocos ao iniciar
  useEffect(() => {
    fetchBlocks();
  }, []);

  return (
    <div className="container">
      <h1>🐉 MultiversX Block Explorer</h1>
      <h2>Honrando os blocos, protegendo os satoshis 🟧</h2>

      <div className="search-area">
        <input
          type="text"
          placeholder="Buscar hash de bloco ou nonce"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>

      <h3>📦 Blocos Recentes</h3>
      <div className="block-list">
        {blocks.map((block) => (
          <div
            key={block.hash}
            className="block"
            onClick={() => fetchBlockDetails(block.hash)}
          >
            <strong>Bloco #{block.nonce}</strong>
          </div>
        ))}
      </div>

      {selectedBlock && (
        <div className="block-details">
          <h3>📖 Detalhes do Bloco</h3>
          <p><strong>Hash:</strong> {selectedBlock.hash}</p>
          <p><strong>Nonce:</strong> {selectedBlock.nonce}</p>
          <p><strong>Timestamp:</strong> {new Date(selectedBlock.timestamp * 1000).toLocaleString()}</p>
          <p><strong>Epoch:</strong> {selectedBlock.epoch}</p>
          <p><strong>Shard:</strong> {selectedBlock.shard}</p>
          <p><strong>Número de Transações:</strong> {selectedBlock.numTxs}</p>
          <p><strong>Proposer:</strong> {selectedBlock.proposer}</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}




