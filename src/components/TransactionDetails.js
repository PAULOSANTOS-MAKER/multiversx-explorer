import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api';

function TransactionDetails({ txHash }) {
  const [txData, setTxData] = useState(null);
  const [priceUSD, setPriceUSD] = useState(null);
  const [priceBRL, setPriceBRL] = useState(null);

  useEffect(() => {
    axios.get(`https://api.multiversx.com/transactions/${txHash}`)
      .then(res => setTxData(res.data));

    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd,brl')
      .then(res => {
        setPriceUSD(res.data['elrond-erd-2'].usd);
        setPriceBRL(res.data['elrond-erd-2'].brl);
      });
  }, [txHash]);

  if (!txData) return <p className="text-orange-300">Carregando transação...</p>;

  const egldAmount = txData.value / 1e18;
  const totalUSD = priceUSD ? (egldAmount * priceUSD).toFixed(2) : null;
  const totalBRL = priceBRL ? (egldAmount * priceBRL).toFixed(2) : null;

  return (
    <div className="bg-zinc-950 border border-orange-600 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-orange-400">🔥 Detalhes da Transação</h2>
      <p><strong className="text-orange-300">Hash:</strong> {txData.txHash}</p>
      <p><strong className="text-orange-300">Status:</strong> {txData.status}</p>
      <p><strong className="text-orange-300">Valor:</strong> {egldAmount} EGLD {totalUSD && `(~ $${totalUSD})`} {totalBRL && `(~ R$${totalBRL})`}</p>
      <p><strong className="text-orange-300">De:</strong> {txData.sender}</p>
      <p><strong className="text-orange-300">Para:</strong> {txData.receiver}</p>
      <p><strong className="text-orange-300">Nonce:</strong> {txData.nonce}</p>
      <p><strong className="text-orange-300">Data:</strong> {new Date(txData.timestamp * 1000).toLocaleString()}</p>
      <p><strong className="text-orange-300">Método:</strong> {txData.function || 'N/A'}</p>
    </div>
  );
}

export default TransactionDetails;
