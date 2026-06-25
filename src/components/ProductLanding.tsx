/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calculator, 
  Copy, 
  Info, 
  Layers, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  Star, 
  Check, 
  HelpCircle, 
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Upload,
  Paperclip,
  FileCode,
  Trash2,
  File
} from 'lucide-react';
import { CalculatorInputs, CalculationResults, DefaultConfig } from '../types';
import { formatCurrency, formatUnitCurrency, formatDecimal } from '../utils';

interface ProductLandingProps {
  config: DefaultConfig;
  inputs: CalculatorInputs;
  results: CalculationResults | null;
  errors: Partial<Record<keyof CalculatorInputs, string>>;
  handleInputChange: (field: keyof CalculatorInputs, value: any) => void;
  applyPresetSize: (w: number, h: number) => void;
  applyPresetQty: (qty: number) => void;
  handleCopyBudget: () => void;
  handleSendWhatsapp: () => void;
  handleSaveToCRM: (
    clientName: string, 
    clientWhatsapp: string, 
    fileName?: string, 
    fileSize?: string, 
    fileType?: string, 
    fileDataUrl?: string
  ) => void;
  copied: boolean;
}

export default function ProductLanding({
  config,
  inputs,
  results,
  errors,
  handleInputChange,
  applyPresetSize,
  applyPresetQty,
  handleCopyBudget,
  handleSendWhatsapp,
  handleSaveToCRM,
  copied
}: ProductLandingProps) {
  // Previews simulation preferences
  const [stickerShape, setStickerShape] = useState<'circle' | 'square' | 'contour'>('circle');
  const [simulatedText, setSimulatedText] = useState('Quadricrom');
  const [simulatedTheme, setSimulatedTheme] = useState<'logo' | 'retro' | 'minimal'>('logo');

  // Customer contact state for registering directly to CRM on lead generation
  const [leadName, setLeadName] = useState('');
  const [leadWhatsapp, setLeadWhatsapp] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  // File Upload / Indexing states
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(1)} KB`;
      
    // If it is a small image, convert to data URL for preview. Otherwise, just index the metadata!
    if (file.type.startsWith('image/') && file.size < 600 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          size: sizeStr,
          type: file.type,
          dataUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile({
        name: file.name,
        size: sizeStr,
        type: file.type
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRegisterLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!results) return;
    setSavingLead(true);
    setTimeout(() => {
      handleSaveToCRM(
        leadName, 
        leadWhatsapp, 
        selectedFile?.name, 
        selectedFile?.size, 
        selectedFile?.type, 
        selectedFile?.dataUrl
      );
      setLeadName('');
      setLeadWhatsapp('');
      setSelectedFile(null);
      setSavingLead(false);
    }, 500);
  };
  const testPresetSizes = [
    { label: '3x3 cm', w: 3, h: 3 },
    { label: '4x4 cm', w: 4, h: 4 },
    { label: '5x5 cm', w: 5, h: 5 },
    { label: '7x7 cm', w: 7, h: 7 },
    { label: '10x10 cm', w: 10, h: 10 },
  ];

  const testPresetQty = [100, 250, 500, 1000];

  const w = Number(inputs.widthCm) || 5;
  const h = Number(inputs.heightCm) || 5;

  // Compute sticker size on-screen
  const maxSide = 160;
  let previewWidth = maxSide;
  let previewHeight = maxSide;
  if (w > h) {
    previewHeight = maxSide * (h / w);
  } else if (h > w) {
    previewWidth = maxSide * (w / h);
  }
  previewWidth = Math.max(45, previewWidth);
  previewHeight = Math.max(45, previewHeight);

  // Sticker container CSS classes
  const getShapeClasses = () => {
    switch (stickerShape) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-xl';
      case 'contour': return 'rounded-[35%_65%_45%_55%_/_40%_60%_50%_50%]';
    }
  };

  const getThemeBackground = () => {
    switch (simulatedTheme) {
      case 'logo': return 'from-[#00aeef]/10 via-[#ec008c]/5 to-[#fff200]/10 border-[#00aeef]/90';
      case 'retro': return 'from-amber-200 to-amber-100 border-amber-600';
      case 'minimal': return 'from-slate-100 to-slate-200 border-slate-700';
    }
  };



  return (
    <div className="space-y-12">
      {/* Dynamic Header Badge and Header Alignment Marks */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl shadow-xl border border-slate-800">
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-[#00aeef]"></div>
          <div className="flex-1 bg-[#ec008c]"></div>
          <div className="flex-1 bg-[#fff200]"></div>
          <div className="flex-1 bg-slate-900"></div>
          <div className="flex-1 bg-emerald-500"></div>
        </div>

        <div className="px-6 py-12 md:p-12 max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-[#00aeef] tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-[#ec008c]" />
            Impressão Digital & Recorte Integrado
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
            Calculadora de Adesivos <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#00aeef] via-[#ec008c] to-[#fff200] bg-clip-text text-transparent">
              Personalizados em Segundos
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Nossos adesivos são produzidos em <strong>Vinil Branco Fosco Premium</strong> resistente a água com tintas eco-solventes de alta fidelidade e recortados com perfeição na plotter digital.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <button 
              onClick={() => {
                const element = document.getElementById('configurator-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-[#00aeef] to-[#ec008c] hover:from-[#00aeef]/90 hover:to-[#ec008c]/90 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm cursor-pointer"
            >
              Calcular agora
            </button>
            
            <a 
              href="#/admin"
              className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[#00aeef] hover:text-white font-bold px-5 py-3 rounded-xl transition shadow-lg text-sm flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              Acessar Painel CRM ➔
            </a>

            <div className="flex items-center gap-1 text-xs text-slate-405 font-mono bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gráfica Ativa
            </div>
          </div>
        </div>
      </div>

      {/* Main product setup split layout */}
      <div id="configurator-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Visual interactive preview framework (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            {/* Header with CMYK test strip */}
            <div className="bg-slate-50 border-b border-secondary-100 p-4 flex items-center justify-between">
              <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#ec008c]" />
                Visualização do Lote
              </h3>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 bg-[#00aeef] rounded-full" title="Cyan"></div>
                <div className="w-3 h-3 bg-[#ec008c] rounded-full" title="Magenta"></div>
                <div className="w-3 h-3 bg-[#fff200] rounded-full" title="Yellow"></div>
                <div className="w-3 h-3 bg-slate-900 rounded-full" title="Key (Preto)"></div>
              </div>
            </div>

            {/* Simulated Live Stage */}
            <div className="p-8 bg-slate-100 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
              {/* Back grid design for alignment */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00aeef_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              
              <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 select-none">
                SIMULAÇÃO DE RECORTE DIGITAL
              </div>

              {/* Dynamic interactive sticker shape */}
              <div 
                style={{ 
                  width: `${previewWidth}px`, 
                  height: `${previewHeight}px`,
                }}
                className={`flex items-center justify-center text-center p-3 transition-all duration-300 shadow-md border-2 border-dashed bg-gradient-to-br relative group ${getShapeClasses()} ${getThemeBackground()}`}
              >
                {/* Wavy plotter cut boundary overlay (shows up bright pink when specialCut is checked) */}
                <div className={`absolute inset-0 border-2 transition-all duration-300 ${getShapeClasses()} ${
                  inputs.specialCut 
                    ? 'border-[#ec008c]/90 border-solid animate-pulse scale-102 ring-2 ring-[#ec008c]/30' 
                    : 'border-transparent'
                }`}></div>

                {/* Print crop marks at the corners */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-slate-400"></div>
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-slate-400"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-slate-400"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-slate-400"></div>

                {/* Simulated artwork layout */}
                <div className="z-10 flex flex-col items-center justify-center w-full px-1 overflow-hidden select-none">
                  {simulatedTheme === 'logo' && (
                    <div className="text-secondary-c flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ec008c] to-[#00aeef] flex items-center justify-center text-[10px] text-white font-black mb-1">
                        QC
                      </div>
                      <span className="text-[10px] md:text-xs font-display font-black text-slate-800 uppercase tracking-widest truncate max-w-full">
                        {simulatedText || 'ADESIVO'}
                      </span>
                      <span className="text-[7px] text-slate-500 font-mono tracking-tighter shrink-0">
                        100% VINIL BRANCO
                      </span>
                    </div>
                  )}

                  {simulatedTheme === 'retro' && (
                    <div className="text-amber-900 flex flex-col items-center">
                      <div className="text-xs font-serif font-semibold italic text-amber-900">
                        ★ {simulatedText || 'Retro Style'} ★
                      </div>
                      <span className="text-[7px] text-amber-700 tracking-widest font-mono shrink-0">
                        PRODUTO PREMIUM
                      </span>
                    </div>
                  )}

                  {simulatedTheme === 'minimal' && (
                    <div className="text-slate-800 flex flex-col items-center">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest truncate max-w-full">
                        {simulatedText || 'MINIMAL'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Size Tags on Preview */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                  {w} cm
                </div>
                <div className="absolute -right-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                  {h} cm
                </div>
              </div>

              {inputs.specialCut && (
                <div className="absolute bottom-2 right-2 bg-[#ec008c] text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase animate-bounce">
                  Corte de Contorno Ativo
                </div>
              )}
            </div>

            {/* Interactive simulator options */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-4">
              <div>
                <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Simular Formato</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => { setStickerShape('circle'); }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      stickerShape === 'circle' ? 'bg-[#00aeef]/10 border-[#00aeef] text-[#00aeef]' : 'border-slate-205 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Redondo
                  </button>
                  <button 
                    onClick={() => { setStickerShape('square'); }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      stickerShape === 'square' ? 'bg-[#00aeef]/10 border-[#00aeef] text-[#00aeef]' : 'border-slate-205 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Quadrado
                  </button>
                  <button 
                    onClick={() => { setStickerShape('contour'); }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      stickerShape === 'contour' ? 'bg-[#00aeef]/10 border-[#00aeef] text-[#00aeef]' : 'border-slate-205 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Contorno
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Simular Arte (Texto)</label>
                  <input 
                    type="text" 
                    value={simulatedText}
                    onChange={(e) => setSimulatedText(e.target.value)}
                    placeholder="Ex: Sua Marca"
                    className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00aeef]" 
                  />
                </div>
                <div>
                  <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">Estilo da Arte</span>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                    {(['logo', 'retro', 'minimal'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSimulatedTheme(style)}
                        className={`flex-1 py-1 text-[10px] rounded-md font-medium capitalize transition ${
                          simulatedTheme === style ? 'bg-white shadow-xs text-slate-900 border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Info Box */}
          <div className="bg-gradient-to-r from-[#00aeef]/10 to-[#ec008c]/5 border border-[#00aeef]/20 rounded-2xl p-5 text-slate-800 flex gap-3.5 shadow-xs">
            <Info className="h-5 w-5 text-[#00aeef] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-slate-900">Como é feito o cálculo?</h4>
              <p className="text-slate-600 leading-relaxed">
                Você escolhe o tamanho do adesivo (em centímetros) e a quantidade. Nós convertemos para metros quadrados (m²) e adicionamos uma margem de segurança e corte eletrônico preciso.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: E-Commerce Product Configurator Panel (7 columns) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
            
            {/* Header info */}
            <div className="border-b border-slate-100 pb-5 mb-6 space-y-2">
              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold uppercase tracking-wider">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                <span className="ml-1 text-slate-600">(4.9/5 de 482 clientes)</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-slate-900">
                Adesivo de Vinil Branco Fosco
              </h2>
              <p className="text-sm text-slate-500">
                Ideal para rótulos de embalagens, lembrancinhas de casamentos, sacolas de delivery, brindes corporativos e sinalizações.
              </p>
            </div>

            <div className="space-y-6">
              {/* Preset Sizes Grid (Card option 2 in requirements) */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                  1. Escolha uma Medida Pronta
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {testPresetSizes.map((preset) => {
                    const isSelected = w === preset.w && h === preset.h;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPresetSize(preset.w, preset.h)}
                        id={`preset-size-${preset.label.replace(' ', '')}`}
                        className={`py-3 px-2 rounded-xl text-xs font-bold border transition text-center flex flex-col items-center justify-center gap-1 ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md transform -translate-y-0.5' 
                            : 'border-slate-200 hover:border-slate-400 text-slate-700 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        <span className="text-[10px] font-mono opacity-80">Quadrado</span>
                        <span className="text-sm tracking-tight">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Dimensions fields (Card option 4 in requirements) */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
                  <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Ou digite uma Medida/Preço Personalizado
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-405 italic">L (cm) x A (cm) e Valor m²</span>
                    <span className="text-slate-300">|</span>
                    <a href="#/admin" className="text-[10px] text-[#00aeef] hover:underline font-bold flex items-center gap-0.5">
                      <SlidersHorizontal className="h-3 w-3" />
                      Acessar CRM Admin
                    </a>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Width input */}
                  <div className="space-y-1">
                    <label htmlFor="customer-width" className="text-xs font-semibold text-slate-600 block">Largura (cm)</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="customer-width"
                        placeholder="Ex: 5"
                        value={inputs.widthCm === '' ? '' : String(inputs.widthCm).replace('.', ',')}
                        onChange={(e) => handleInputChange('widthCm', e.target.value)}
                        className={`w-full h-11 px-3.5 bg-white border rounded-xl font-mono text-sm transition-all focus:outline-hidden focus:ring-1 focus:ring-[#00aeef] ${
                          errors.widthCm ? 'border-red-300 text-red-900 focus:ring-red-400' : 'border-slate-200'
                        }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">cm</span>
                    </div>
                    {errors.widthCm && <p className="text-[10px] text-red-600 font-bold">{errors.widthCm}</p>}
                  </div>

                  {/* Height input */}
                  <div className="space-y-1">
                    <label htmlFor="customer-height" className="text-xs font-semibold text-slate-600 block">Altura (cm)</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="customer-height"
                        placeholder="Ex: 5"
                        value={inputs.heightCm === '' ? '' : String(inputs.heightCm).replace('.', ',')}
                        onChange={(e) => handleInputChange('heightCm', e.target.value)}
                        className={`w-full h-11 px-3.5 bg-white border rounded-xl font-mono text-sm transition-all focus:outline-hidden focus:ring-1 focus:ring-[#00aeef] ${
                          errors.heightCm ? 'border-red-300 text-red-900 focus:ring-red-400' : 'border-slate-200'
                        }`}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">cm</span>
                    </div>
                    {errors.heightCm && <p className="text-[10px] text-red-600 font-bold">{errors.heightCm}</p>}
                  </div>

                  {/* m2Value input */}
                  <div className="space-y-1">
                    <label htmlFor="customer-m2" className="text-xs font-semibold text-slate-600 block">Valor do m² (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">R$</span>
                      <input
                        type="text"
                        id="customer-m2"
                        placeholder="Ex: 51"
                        value={inputs.m2Value === '' ? '' : String(inputs.m2Value).replace('.', ',')}
                        onChange={(e) => handleInputChange('m2Value', e.target.value)}
                        className={`w-full h-11 pl-8 pr-3.5 bg-white border rounded-xl font-mono text-sm transition-all focus:outline-hidden focus:ring-1 focus:ring-[#00aeef] ${
                          errors.m2Value ? 'border-red-300 text-red-900 focus:ring-red-400' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {errors.m2Value && <p className="text-[10px] text-red-600 font-bold">{errors.m2Value}</p>}
                  </div>
                </div>
              </div>

              {/* Preset Quantities Selector (Card option 3 in requirements) */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                  2. Escolha a Quantidade
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {testPresetQty.map((qty) => {
                    const isSelected = Number(inputs.quantity) === qty;
                    return (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => applyPresetQty(qty)}
                        id={`preset-qty-${qty}`}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition text-center ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-slate-50 hover:bg-white'
                        }`}
                      >
                        {qty} Un.
                      </button>
                    );
                  })}
                </div>

                {/* Custom quantity input */}
                <div className="space-y-1">
                  <label htmlFor="customer-quantity" className="text-[10px] font-semibold text-slate-600 block">Outra Quantidade de Adesivos:</label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      id="customer-quantity"
                      min="1"
                      step="1"
                      placeholder="Ex: 350"
                      value={inputs.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className={`w-full h-10 px-3 border rounded-xl font-mono text-xs focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden ${
                        errors.quantity ? 'border-red-300 text-red-900' : 'border-slate-200'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400">unidades</span>
                  </div>
                  {errors.quantity && <p className="text-[10px] text-red-600 font-bold">{errors.quantity}</p>}
                </div>
              </div>

              {/* Special cut type toggle option */}
              <div className="border border-slate-200 rounded-2xl p-4 flex items-start gap-3.5 hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  id="special-cut-checkbox"
                  checked={inputs.specialCut}
                  onChange={(e) => handleInputChange('specialCut', e.target.checked)}
                  className="h-5 w-5 rounded-md border-slate-300 text-[#ec008c] focus:ring-[#ec008c] mt-0.5 cursor-pointer" 
                />
                <label htmlFor="special-cut-checkbox" className="flex-1 cursor-pointer select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">Tipo de Corte: Recorte Especial de Contorno</span>
                    <span className="text-[9px] bg-[#ec008c]/15 text-[#ec008c] font-mono px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                      + {formatCurrency(config.specialCutValue)}/un
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Marque esta opção caso queira que o adesivo seja cortado seguindo a silhueta da sua arte (cavalinho, estrela, formato orgânico) ao invés do clássico corte quadrado reto.
                  </p>
                </label>
              </div>

              {/* Dynamic pricing e-commerce box */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800">
                <div className="absolute right-[-40px] bottom-[-40px] w-48 h-48 bg-[#00aeef]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute left-[-40px] top-[-40px] w-48 h-48 bg-[#ec008c]/15 rounded-full blur-3xl pointer-events-none"></div>

                {!results ? (
                  <div className="py-6 text-center text-slate-400 space-y-2">
                    <Calculator className="h-8 w-8 mx-auto text-[#00aeef] animate-bounce" />
                    <p className="text-sm font-bold text-slate-200">Aguardando dados para o cálculo...</p>
                    <p className="text-xs">Insira a medida e quantidade acima para gerar o preço final.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">VALOR DO ORÇAMENTO</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl md:text-5xl font-mono font-extrabold text-white tracking-tight">
                            {formatCurrency(results.finalValue)}
                          </span>
                        </div>
                        {results.isMinOrderApplied && (
                          <div className="mt-1 md:inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 py-0.5 px-2 rounded text-[10px] font-mono text-amber-400 uppercase">
                            Pedido Mínimo Aplicado (mín. {formatCurrency(config.minOrder)})
                          </div>
                        )}
                      </div>

                      <div className="text-right sm:text-right text-slate-300 space-y-1 sm:self-end">
                        <p className="text-xs">
                          Preço Unitário: <strong className="text-white text-base font-mono">{formatUnitCurrency(results.valuePerUnit)}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Medida total de lona: {formatDecimal(results.totalAreaM2, 4)} m²
                        </p>
                      </div>
                    </div>

                    {/* Order summary client dialog form to register on CRM */}
                    <form onSubmit={handleRegisterLead} className="space-y-3 pt-1">
                      <p className="text-xs font-bold text-slate-300">Quer salvar este orçamento ou registrar no CRM?</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input 
                          type="text" 
                          placeholder="Seu Nome completo" 
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          required
                          className="h-10 px-3 bg-slate-800 text-white rounded-xl text-xs border border-slate-700 focus:border-[#00aeef] focus:outline-hidden"
                        />
                        <input 
                          type="text" 
                          placeholder="WhatsApp (Ex: 11999999999)" 
                          value={leadWhatsapp}
                          onChange={(e) => setLeadWhatsapp(e.target.value)}
                          className="h-10 px-3 bg-slate-800 text-white rounded-xl text-xs border border-slate-700 focus:border-[#00aeef] focus:outline-hidden"
                        />
                      </div>

                      {/* Drag & Drop File Indexing Field (Requirement 3: index a file with this administrative panel) */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5 text-[#00aeef]" />
                          Indexar Arquivo da Arte / Vetor (Opcional):
                        </span>
                        
                        {!selectedFile ? (
                          <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                              isDragging 
                                ? 'border-[#00aeef] bg-slate-800/60' 
                                : 'border-slate-700 hover:border-[#00aeef]/60 bg-slate-800/30'
                            }`}
                            onClick={() => document.getElementById('artwork-file-input')?.click()}
                          >
                            <input 
                              type="file" 
                              id="artwork-file-input" 
                              className="hidden" 
                              onChange={handleFileChange}
                              accept=".pdf,.cdr,.ai,.png,.jpg,.jpeg"
                            />
                            <Upload className="h-6 w-6 text-slate-400" />
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-bold text-slate-300">Arraste ou clique para enviar a arte</p>
                              <p className="text-[9px] text-slate-500 font-mono">PDF, CDR, AI, PNG ou JPG (max 20MB)</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-800/80 border border-slate-750 p-3 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {selectedFile.dataUrl ? (
                                <img 
                                  src={selectedFile.dataUrl} 
                                  alt="Preview" 
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-700 bg-white"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                                  <FileCode className="h-5 w-5 text-[#00aeef]" />
                                </div>
                              )}
                              <div className="min-w-0 text-left">
                                <p className="text-xs font-bold text-slate-200 truncate">{selectedFile.name}</p>
                                <p className="text-[10px] font-mono text-slate-400">{selectedFile.size} • {selectedFile.type.split('/')[1]?.toUpperCase() || 'ARQUIVO'}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-750"
                              title="Remover arquivo indexado"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={savingLead}
                          className="h-11 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-200 rounded-xl flex-1 flex items-center justify-center gap-2 transition"
                        >
                          <FileText className="h-4 w-4 text-[#00aeef]" />
                          {savingLead ? 'Processando...' : 'Gravar Orçamento no CRM'}
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyBudget}
                          className="h-11 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-200 rounded-xl px-5 flex items-center justify-center gap-2 transition"
                        >
                          <Copy className="h-4 w-4" />
                          {copied ? 'Copiado!' : 'Copiar'}
                        </button>

                        <button
                          type="button"
                          onClick={handleSendWhatsapp}
                          className="h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 font-bold text-xs uppercase tracking-wider text-white rounded-xl px-5 flex items-center justify-center gap-2 transition shadow-md"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Enviar pelo WhatsApp
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
