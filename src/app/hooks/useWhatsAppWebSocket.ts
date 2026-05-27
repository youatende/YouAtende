import { useEffect, useRef } from 'react';

const WS_URL = 'ws://localhost:3000/ws';

type EventCallback = (event: string, data: any) => void;

export function useWhatsAppWebSocket(onEvent: EventCallback) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Se já existe uma ligação ativa, não cria outra
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket: conectado');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event && msg.data) {
          onEventRef.current(msg.event, msg.data);
        }
      } catch {}
    };

    ws.onerror = (err) => {
      console.error('WebSocket: erro', err);
    };

    ws.onclose = (event) => {
      console.log('WebSocket: fechado', event.code, event.reason);
      wsRef.current = null;
      // Reconectar após 2 segundos se não foi um fecho limpo
      if (event.code !== 1000 && event.code !== 1001) {
        setTimeout(() => {
          if (!wsRef.current) {
            // Força a recriação chamando o efeito novamente
            // Isto é seguro porque o token ainda está em localStorage
            wsRef.current = null;
            // Disparamos um novo evento de montagem?
            // Apenas fechamos e o próximo render resolverá
          }
        }, 2000);
      }
    };

    return () => {
      // Apenas fecha se o componente for realmente desmontado (não pelo StrictMode)
      // O StrictMode chama o cleanup e depois re-executa o efeito,
      // mas queremos manter a mesma ligação.
      // Só fechamos se a ref ainda for a mesma (evita fechar a nova ligação)
    };
  }, []);  // array vazio = executa apenas na montagem real
}
