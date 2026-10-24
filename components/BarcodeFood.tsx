"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { lookupBarcode } from "../lib/barcode.js";

type Food = { name: string; baseAmount: number; unit: string; calories: number | string; protein: number | string; carbs: number | string; fat: number | string; barcode: string };
type Props = { onSave: (food: Food) => string | null; onManual: () => void };
type Detector = { detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
type DetectorConstructor = { new (options: { formats: string[] }): Detector; getSupportedFormats: () => Promise<string[]> };

export function BarcodeFood(props: Props) {
  const [open, setOpen] = useState(false);
  return <div className="barcode-section">
    <button type="button" className="btn btn-secondary" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Fechar consulta" : "Buscar por código de barras"}</button>
    {open && <BarcodeLookup onManual={() => { setOpen(false); props.onManual(); }} onSave={food => { const error = props.onSave(food); if (!error) setOpen(false); return error; }} />}
  </div>;
}

function BarcodeLookup({ onSave, onManual }: Props) {
  const [code, setCode] = useState("");
  const [food, setFood] = useState<Food | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [camera, setCamera] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function search(value: string) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setCamera(false);
    setFood(null);
    setError("");
    setBusy(true);
    try {
      const result = await lookupBarcode(value, { signal: controller.signal });
      if (!controller.signal.aborted) setFood(result);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof TypeError || (cause instanceof Error && cause.name === "TimeoutError") ? "Não foi possível conectar à base de alimentos. Tente novamente ou cadastre pelo rótulo." : cause instanceof Error ? cause.message : "Não foi possível consultar o produto.");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  useEffect(() => {
    if (!camera) return;
    let disposed = false;
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const release = () => stream?.getTracks().forEach(track => track.stop());
    async function start() {
      try {
        const API = (window as Window & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
        if (!API || !navigator.mediaDevices?.getUserMedia) throw new Error("Este navegador não oferece leitura pela câmera. Digite o código abaixo.");
        const supported = await API.getSupportedFormats();
        if (disposed) return;
        const formats = ["ean_13", "ean_8", "upc_a"].filter(format => supported.includes(format));
        if (!formats.length) throw new Error("A leitura deste tipo de código não está disponível. Digite os números.");
        const detector = new API({ formats });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (disposed) { release(); return; }
        video.current!.srcObject = stream;
        await video.current!.play();
        async function scan() {
          if (disposed) return;
          try {
            const codes = video.current && video.current.readyState >= 2 ? await detector.detect(video.current) : [];
            if (disposed) return;
            const found = codes.find(item => /^\d{8,14}$/.test(item.rawValue));
            if (found) { release(); setCode(found.rawValue); void search(found.rawValue); return; }
            timer = setTimeout(scan, 250);
          } catch {
            if (!disposed) { release(); setCamera(false); setError("Não foi possível ler pela câmera. Digite o código abaixo."); }
          }
        }
        if (!disposed) void scan();
      } catch (cause) {
        release();
        if (!disposed) { setCamera(false); setError(cause instanceof Error && cause.name === "NotAllowedError" ? "Acesso à câmera negado. Você pode digitar o código de barras." : cause instanceof Error && cause.name === "Error" ? cause.message : "Câmera indisponível. Use HTTPS e permita o acesso, ou digite o código."); }
      }
    }
    void start();
    return () => { disposed = true; clearTimeout(timer); release(); };
  }, [camera]);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!food) return;
    const result = onSave(food);
    if (result) setError(result);
  }

  return <div className="barcode-lookup">
    <p>Consulte um produto e confira os valores no rótulo antes de salvar.</p>
    <form onSubmit={event => { event.preventDefault(); void search(code); }}>
      <label className="field">Código de barras<input inputMode="numeric" autoComplete="off" value={code} onChange={event => { setCode(event.target.value); setFood(null); setError(""); }} placeholder="Números abaixo das barras" required disabled={busy || camera} /></label>
      <div className="barcode-actions"><button className="btn btn-primary" disabled={busy || camera}>{busy ? "Consultando…" : "Consultar produto"}</button><button className="btn btn-secondary" type="button" disabled={busy} onClick={() => { setError(""); setCamera(!camera); }}>{camera ? "Parar câmera" : "Usar câmera"}</button></div>
    </form>
    {camera && <div><video className="barcode-video" ref={video} muted playsInline aria-label="Leitor de código de barras" /><p role="status">Aponte a câmera para as barras. Mantenha o rótulo iluminado e firme.</p></div>}
    <p role="status" aria-live="polite">{busy ? "Buscando informações nutricionais…" : food ? "Produto encontrado. Revise os campos abaixo." : ""}</p>
    {error && <p className="error" role="alert">{error}</p>}
    {food && <form className="barcode-review" onSubmit={save}>
      <h3>Confira o produto</h3>
      <p>Valores por <strong>100 g ou 100 ml</strong>, conforme o rótulo. Confirme a unidade e complete os campos vazios. Dados ausentes não significam zero.</p>
      <label className="field">Nome do produto<input value={food.name} onChange={event => setFood({ ...food, name: event.target.value })} required /></label>
      <label className="field">Unidade dos valores consultados<select value={food.unit} onChange={event => setFood({ ...food, unit: event.target.value })} required><option value="">Confirme no rótulo</option><option value="g">Por 100 gramas</option><option value="ml">Por 100 mililitros</option></select></label>
      <div className="macro-fields">{([["calories", "Calorias (kcal)"], ["protein", "Proteínas (g)"], ["carbs", "Carboidratos (g)"], ["fat", "Gorduras (g)"]] as const).map(([key, label]) => <label className="field" key={key}>{label}<input type="number" min="0" max={key === "calories" ? 10000 : 1000} step="any" required value={food[key]} onChange={event => setFood({ ...food, [key]: event.target.value })} /></label>)}</div>
      <p><a href={`https://world.openfoodfacts.org/product/${food.barcode}`} target="_blank" rel="noreferrer">Fonte: Open Food Facts</a> · Base colaborativa, licença ODbL.</p>
      <button className="btn btn-primary">Salvar e selecionar alimento</button>
      <small>Depois, informe a quantidade consumida e toque em Adicionar.</small>
    </form>}
    <button className="btn btn-secondary" type="button" onClick={onManual}>Cadastrar pelo rótulo manualmente</button>
    <small>A consulta envia somente o código à base pública Open Food Facts. Seu diário continua neste navegador.</small>
  </div>;
}
