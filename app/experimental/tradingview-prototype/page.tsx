"use client";

import { useEffect, useRef, useState } from "react";

type Message = { type: string; [k: string]: any };

export default function TradingViewPrototype() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<any>(null);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [wsError, setWsError] = useState<string>("");
  const [notes, setNotes] = useState<Array<any>>([]);

  useEffect(() => {
    const id = "tv_chart_container";

    function createWidget(symbol = "NASDAQ:AAPL") {
      if (!containerRef.current || !(window as any).TradingView) return;
      try {
        // remove existing container contents
        containerRef.current.innerHTML = "";
        const widget = new (window as any).TradingView.widget({
          autosize: true,
          symbol,
          interval: "60",
          container_id: id,
          locale: "en",
          toolbar_bg: "#f1f3f6",
          hide_side_toolbar: false,
          allow_symbol_change: true,
          studies: [],
          // provide a hook so we can call widget methods later
          overrides: {},
        });
        widgetRef.current = widget;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("TradingView init error", e);
      }
    }

    function init() {
      createWidget();
    }

    if (!(window as any).TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => init();
      document.head.appendChild(script);
    } else {
      init();
    }

    // connect to local ws proxy
    const wsUrl = `ws://localhost:6789`;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        setWsStatus('connected');
        setWsError('');
        // eslint-disable-next-line no-console
        console.log('WS connected');
      };
      ws.onclose = () => {
        setWsStatus('disconnected');
        // eslint-disable-next-line no-console
        console.log('WS closed');
      };
      ws.onerror = (ev) => {
        setWsStatus('error');
        const err = (ev as any).message || 'connection failed';
        setWsError(err);
        // eslint-disable-next-line no-console
        console.error('WS error:', ev, err);
      };
      ws.onmessage = (ev) => {
        try {
          const msg: Message = JSON.parse(ev.data);
          handleMessage(msg);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Invalid ws message', e);
        }
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('WS connect error', e);
    }

    function handleMessage(msg: Message) {
      if (!msg || !msg.type) return;
      if (msg.type === 'symbol' && msg.symbol) {
        // recreate widget with new symbol
        createWidget(msg.symbol);
      } else if (msg.type === 'note') {
        setNotes((s) => [msg, ...s]);
      } else if (msg.type === 'annotation') {
        // for prototype, push to notes list (advanced drawing needs Charting Library)
        setNotes((s) => [msg, ...s]);
      }
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">TradingView Prototype</h1>
    <div className="mb-2">
        WebSocket status: <strong>{wsStatus}</strong>
        {wsError && <div className="text-red-500 text-sm mt-1">Error: {wsError}</div>}
      </div>
      <div id="tv_chart_container" ref={containerRef} style={{ width: "100%", height: 610 }} />
      <p className="mt-4 text-sm text-gray-500">Experimental: use for private prototyping only.</p>

      <div className="mt-6">
        <h2 className="font-semibold">Incoming Messages</h2>
        <ul className="mt-2 space-y-2 max-h-48 overflow-auto">
          {notes.map((n, i) => (
            <li key={i} className="text-sm text-gray-700">
              <strong>{n.type}</strong>: {n.message || n.symbol || JSON.stringify(n)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
