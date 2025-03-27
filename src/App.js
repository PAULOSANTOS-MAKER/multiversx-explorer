import React, { useState } from 'react';
import './App.css';
import Blocks from './components/Blocks';
import Transactions from './components/Transactions';
import TransactionDetails from './components/TransactionDetails';
import api from './api';

function App() {
  const [selectedBlockHash, setSelectedBlockHash] = useState(null);
  const [selectedTxHash, setSelectedTxHash] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchError, setSearchError] = useState(null);

  const handleBlockSelect = (hash) => {
    setSelectedBlockHash(hash);
    setSelectedTxHash(null);
    setSearchError(null);
  };

  const handleSearch = async () => {
    setSearchError(null);
    setSelectedBlockHash(null);
    setSelectedTxHash(null);

    try {
      // Tenta buscar como bloco
      const res = await api.get(`/blocks/${searchValue}`);
      if (res.data && res.data.hash) {
        setSelectedBlockHash(res.data.hash);
        return;
      }
    } catch (err) {
      // Não achou como bloco, continua tentando como transação
    }

    try {
      // Tenta buscar como transação
      const res = await api.get(`/transactions/${searchValue}`);
      if (res.data && res.data.txHash) {
        setSelectedTxHash(res.data.txHash);
        return;
      }
    } catch (err) {
      // Não achou como transação também
    }

    setSearchError('Bloco ou transação não encontrado.');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MultiversX Block Explorer 🚀</h1>
        <p>Bem-vindo ao seu explorador de blocos e transações!</p>

        <input
          type="text"
          placeholder="Buscar por hash de bloco ou transação"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
        {searchError && <p style={{ color: 'red' }}>{searchError}</p>}
      </header>

      {/* Lista de blocos */}
      <Blocks onBlockSelect={handleBlockSelect} />

      {/* Detalhes de bloco */}
      {selectedBlockHash && (
        <Transactions blockHash={selectedBlockHash} />
      )}

      {/* Detalhes de transação (se hash for encontrado) */}
      {selectedTxHash && (
        <TransactionDetails txHash={selectedTxHash} />
      )}
    </div>
  );
}

export default App;



