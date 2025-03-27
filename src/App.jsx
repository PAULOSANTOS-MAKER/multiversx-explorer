import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  // ---------------- ESTADOS PRINCIPAIS ----------------
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(0);

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockTransactions, setBlockTransactions] = useState([]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [loadingTxs, setLoadingTxs] = useState(false);

  // Cotação ao vivo do EGLD em USD
  const [egldPrice, setEgldPrice] = useState(null);

  // ================= FUNÇÕES PRINCIPAIS =================

  // 1) Buscar cotação em tempo real no CoinGecko
  async function fetchEgldPrice() {
    try {
      // Chama API do CoinGecko para EGLD (ID: elrond-erd-2) vs. USD
      const res = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd'
      );
      // Exemplo de retorno: { "elrond-erd-2": { "usd": 40.21 } }
      const priceUsd = res.data['elrond-erd-2'].usd;
      setEgldPrice(priceUsd);
    } catch (err) {
      console.error('Erro ao buscar cotação EGLD:', err);
      // Em caso de erro, mantemos egldPrice como está ou null
    }
  }

  // 2) Buscar blocos (paginação)
  async function fetchBlocks(pageParam = 0) {
    try {
      const from = pageParam * 5;
      const response = await axios.get(`https://api.multiversx.com/blocks?from=${from}&size=5`);
      if (pageParam === 0) {
        // Primeira página
        setBlocks(response.data);
      } else {
        // Concatena blocos na lista
        setBlocks((prev) => [...prev, ...response.data]);
      }
    } catch (err) {
      console.error('Erro ao buscar blocos:', err);
      setError('Erro ao buscar blocos');
    }
  }

  // 3) Detalhes do bloco + transações
  async function fetchBlockDetails(hashOrNonce) {
    try {
      setError(null);
      setSelectedBlock(null);
      setBlockTransactions([]);
      setSelectedTransaction(null);
      setSelectedAccount(null);
      setLoadingTxs(true);

      const res = await axios.get(`https://api.multiversx.com/blocks/${hashOrNonce}`);
      if (res.status !== 200) {
        throw new Error('Bloco não encontrado');
      }

      const block = res.data;
      setSelectedBlock(block);

      // Verificar transações do bloco
      const miniBlocks = block.miniBlocks || [];
      const txHashes = miniBlocks.flatMap((mb) => (Array.isArray(mb.txs) ? mb.txs : []));
      if (txHashes.length > 0) {
        const txPromises = txHashes.map((txHash) =>
          axios.get(`https://api.multiversx.com/transactions/${txHash}`).then((r) => r.data)
        );
        const txResults = await Promise.all(txPromises);
        setBlockTransactions(txResults);
      }

      setLoadingTxs(false);
    } catch (err) {
      setLoadingTxs(false);
      throw err; // Para cair no fallback, se estiver no handleSearch
    }
  }

  // 4) Detalhes de transação
  async function fetchTransactionDetails(txHash) {
    try {
      setError(null);
      setSelectedBlock(null);
      setBlockTransactions([]);
      setSelectedTransaction(null);
      setSelectedAccount(null);
      setLoadingTxs(true);

      const res = await axios.get(`https://api.multiversx.com/transactions/${txHash}`);
      if (res.status !== 200) {
        throw new Error('Transação não encontrada');
      }

      setSelectedTransaction(res.data);
      setLoadingTxs(false);
    } catch (err) {
      setLoadingTxs(false);
      throw err;
    }
  }

  // 5) Detalhes de conta (endereço)
  async function fetchAccountDetails(address) {
    try {
      setError(null);
      setSelectedBlock(null);
      setBlockTransactions([]);
      setSelectedTransaction(null);
      setSelectedAccount(null);
      setLoadingTxs(true);

      const res = await axios.get(`https://api.multiversx.com/accounts/${address}`);
      if (res.status !== 200) {
        throw new Error('Endereço não encontrado');
      }
      setSelectedAccount(res.data);
      setLoadingTxs(false);
    } catch (err) {
      setLoadingTxs(false);
      throw err;
    }
  }

  // ============ BUSCA UNIFICADA (Bloco, Tx, Conta) ============
  async function handleSearch() {
    if (!search.trim()) return;
    const input = search.trim();

    // 1) Tenta bloco
    try {
      await fetchBlockDetails(input);
      return;
    } catch (errBloco) {
      console.log('Não é bloco:', errBloco.message);
    }

    // 2) Tenta transação
    try {
      await fetchTransactionDetails(input);
      return;
    } catch (errTx) {
      console.log('Não é transação:', errTx.message);
    }

    // 3) Tenta conta
    try {
      await fetchAccountDetails(input);
      return;
    } catch (errAcc) {
      console.log('Não é conta:', errAcc.message);
      setError('Não encontrado como bloco, transação ou conta.');
    }
  }

  // ============ EFEITOS INICIAIS (useEffect) ============
  useEffect(() => {
    // Carregar blocos iniciais
    fetchBlocks(0);
    // Buscar cotação do EGLD
    fetchEgldPrice();

    // Se quiser atualizar o preço a cada 1 min:
    // const intervalPrice = setInterval(fetchEgldPrice, 60000);
    // return () => clearInterval(intervalPrice);
  }, []);

  // ===================== LAYOUT EM DUAS COLUNAS ======================
  return (
    <div className="container">
      <h1>🐉 MultiversX Block Explorer</h1>
      <h2>Honrando os blocos, protegendo os satoshis 🟧</h2>

      <div className="layout">
        {/* COLUNA ESQUERDA */}
        <div className="left-panel">
          <div className="search-area">
            <input
              type="text"
              placeholder="Hash bloco, tx ou endereço erd1..."
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
                onClick={() => {
                  fetchBlockDetails(block.hash).catch(() => {
                    setError('Erro ao buscar bloco');
                  });
                }}
              >
                <strong>Bloco #{block.nonce}</strong>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const newPage = page + 1;
              setPage(newPage);
              fetchBlocks(newPage);
            }}
          >
            Carregar mais blocos
          </button>
        </div>

        {/* COLUNA DIREITA */}
        <div className="right-panel">
          {/* Se houver erro geral */}
          {error && <p className="error">{error}</p>}

          {/* Mostra valor do EGLD em USD */}
          <p>
            <strong>Cotação EGLD:</strong>{' '}
            {egldPrice ? `$${egldPrice.toFixed(2)} / EGLD` : 'Buscando...'}
          </p>

          {/* Detalhes do Bloco */}
          {selectedBlock && (
            <div className="block-details">
              <h3>📖 Detalhes do Bloco</h3>
              <p><strong>Hash:</strong> {selectedBlock.hash}</p>
              <p><strong>Nonce:</strong> {selectedBlock.nonce}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedBlock.timestamp * 1000).toLocaleString()}</p>
              <p><strong>Epoch:</strong> {selectedBlock.epoch}</p>
              <p><strong>Shard:</strong> {selectedBlock.shard}</p>
              <p><strong>Número de Transações:</strong> {selectedBlock.numTxs || 0}</p>
              <p><strong>Proposer:</strong> {selectedBlock.proposer}</p>
            </div>
          )}

          {/* Loading ao buscar transações */}
          {loadingTxs && <p>🔄 Carregando transações...</p>}

          {/* Transações do Bloco */}
          {blockTransactions.length > 0 && (
            <div className="block-details">
              <h3>📤 Transações no Bloco</h3>
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hash</th>
                    <th>De</th>
                    <th>Para</th>
                    <th>Valor (EGLD)</th>
                    <th>Valor (USD)</th>
                    <th>Gas usado</th>
                    <th>Taxa (EGLD)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {blockTransactions.map((tx, index) => {
                    const valEGLD = tx.value / 1e18;
                    const valUSD = egldPrice ? (valEGLD * egldPrice).toFixed(2) : '...';
                    const taxaEGLD = ((tx.gasPrice * tx.gasUsed) / 1e18).toFixed(6);

                    return (
                      <tr key={tx.hash}>
                        <td>{index + 1}</td>
                        <td><code>{tx.hash}</code></td>
                        <td>{tx.sender}</td>
                        <td>{tx.receiver}</td>
                        <td>{valEGLD.toFixed(4)}</td>
                        <td>${valUSD}</td>
                        <td>{tx.gasUsed}</td>
                        <td>{taxaEGLD}</td>
                        <td>{tx.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {blockTransactions.length === 0 && selectedBlock && !loadingTxs && (
            <p>Este bloco não possui transações.</p>
          )}

          {/* Detalhes da Transação buscada */}
          {selectedTransaction && (
            <div className="block-details">
              <h3>🔎 Detalhes da Transação</h3>
              {selectedTransaction.timestamp && (
                <>
                  <p>
                    <strong>Data:</strong>{' '}
                    {new Date(selectedTransaction.timestamp * 1000).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Hora:</strong>{' '}
                    {new Date(selectedTransaction.timestamp * 1000).toLocaleTimeString()}
                  </p>
                </>
              )}

              <p><strong>Hash:</strong> {selectedTransaction.hash}</p>
              <p><strong>De:</strong> {selectedTransaction.sender}</p>
              <p><strong>Para:</strong> {selectedTransaction.receiver}</p>

              {(() => {
                const valEGLD = selectedTransaction.value / 1e18;
                const valUSD = egldPrice ? (valEGLD * egldPrice).toFixed(2) : '...';
                return (
                  <>
                    <p><strong>Valor (EGLD):</strong> {valEGLD.toFixed(4)}</p>
                    <p><strong>Valor (USD):</strong> ${valUSD}</p>
                  </>
                );
              })()}

              <p><strong>Gas usado:</strong> {selectedTransaction.gasUsed}</p>
              <p>
                <strong>Taxa (EGLD):</strong>{' '}
                {((selectedTransaction.gasPrice * selectedTransaction.gasUsed) / 1e18).toFixed(6)}
              </p>
              <p><strong>Status:</strong> {selectedTransaction.status}</p>
            </div>
          )}

          {/* Detalhes da Conta */}
          {selectedAccount && (
            <div className="block-details">
              <h3>👤 Detalhes da Conta</h3>
              <p><strong>Endereço:</strong> {selectedAccount.address}</p>
              {(() => {
                const balanceEGLD = selectedAccount.balance / 1e18;
                const balanceUSD = egldPrice ? (balanceEGLD * egldPrice).toFixed(2) : '...';
                return (
                  <>
                    <p><strong>Saldo (EGLD):</strong> {balanceEGLD.toFixed(4)}</p>
                    <p><strong>Saldo (USD):</strong> ${balanceUSD}</p>
                  </>
                );
              })()}
              <p><strong>Nonce:</strong> {selectedAccount.nonce}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
