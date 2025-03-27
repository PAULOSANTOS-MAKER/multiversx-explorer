import React, { useEffect, useState } from 'react';
import api from '../api';

function Transactions({ blockHash }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(`/blocks/${blockHash}/transactions`);
        setTransactions(res.data);
      } catch (err) {
        setError('Erro ao buscar transações :(');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [blockHash]);

  if (loading) return <p className="text-orange-300">Carregando transações...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-400 mb-4">📄 Transações do Bloco</h2>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.txHash}
            className="bg-zinc-950 border border-orange-600 p-4 rounded-lg shadow"
          >
            <p className="text-white text-sm mb-1">Hash: <span className="text-orange-300">{tx.txHash}</span></p>
            <p className="text-orange-300 text-sm">De: {tx.sender}</p>
            <p className="text-orange-300 text-sm">Para: {tx.receiver}</p>
            <p className="text-sm text-zinc-400">Valor: {tx.value / 1e18} EGLD</p>
            <p className="text-sm text-zinc-400">Taxa: {tx.fee / 1e18} EGLD</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Transactions;