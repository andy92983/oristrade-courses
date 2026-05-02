# TradingView Prototype (experimental)

Location: oristrade/app/experimental/tradingview-prototype

What this is
- Minimal Next.js client page that loads the TradingView embeddable script and initializes a single chart.
- Purpose: provide a simple, reproducible proof-of-concept to accept Oris signals and annotate charts later.

Usage
1. Start the Next.js dev server (in the `oristrade` folder) and open `/experimental/tradingview-prototype`.
2. Start the local WebSocket proxy that accepts JSON commands and broadcasts them to connected pages:

```bash
# from /Users/andy/Documents/OrisTrade/oristrade
npm install
npm run tv-proxy
```

3. Open `/experimental/tradingview-prototype` in your browser (best in a normal window). The page will connect to `ws://localhost:6789`.
4. Send test commands to the proxy (example below) and watch the page respond.

If you want to help with debugging, open DevTools → Console and copy any output or errors here so I can adapt the prototype.

Notes
- This is an experimental prototype for private use and rapid iteration. For production and multi-user deployments, prefer the TradingView Charting Library or an approved embedding approach and verify licensing.
- If you open TradingView in your browser and paste the `console` output here, I will use it to refine automation or design a browser-extension PoC limited to your account and machine.

Test commands (POST examples)

```bash
# change symbol to TSLA
curl -X POST -H "Content-Type: application/json" -d '{"type":"symbol","symbol":"NASDAQ:TSLA"}' http://localhost:6789/annotate

# send a note/annotation
curl -X POST -H "Content-Type: application/json" -d '{"type":"note","message":"Potential long setup"}' http://localhost:6789/annotate
```
