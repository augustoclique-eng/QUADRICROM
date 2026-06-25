/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Settings, 
  DollarSign, 
  Briefcase, 
  ClipboardList, 
  HelpCircle, 
  Users, 
  Star, 
  Award,
  Globe,
  Bell,
  CheckCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { CalculatorInputs, CalculationResults, DefaultConfig, Order, ValidatedCalculatorInputs } from './types';
import { 
  calculateStickerValues, 
  validateInputs, 
  formatCurrency, 
  formatUnitCurrency,
  formatDecimal 
} from './utils';
import ProductLanding from './components/ProductLanding';
import AdminPanel from './components/AdminPanel';

// Default factory constants defined in requirement 8
const FACTORY_DEFAULTS: DefaultConfig = {
  m2Value: 51.00,
  lossPercent: 10,
  profitMargin: 0,
  minOrder: 30.00,
  specialCutValue: 0.15,
  companyName: 'Quadricrom',
  whatsappNumber: '5511999999999',
};

export default function App() {
  // Config state (lasts between reloads)
  const [config, setConfig] = useState<DefaultConfig>(() => {
    try {
      const saved = localStorage.getItem('adesivos_calculadora_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.m2Value === 'number') {
          return {
            m2Value: parsed.m2Value,
            lossPercent: typeof parsed.lossPercent === 'number' ? parsed.lossPercent : 10,
            profitMargin: typeof parsed.profitMargin === 'number' ? parsed.profitMargin : 0,
            minOrder: typeof parsed.minOrder === 'number' ? parsed.minOrder : 30.00,
            specialCutValue: typeof parsed.specialCutValue === 'number' ? parsed.specialCutValue : 0.15,
            companyName: parsed.companyName || 'Quadricrom',
            whatsappNumber: parsed.whatsappNumber || '5511999999999',
          };
        }
      }
    } catch (e) {
      console.error('Erro ao ler localStorage', e);
    }
    return FACTORY_DEFAULTS;
  });

  // Automatically save configuration on changes
  useEffect(() => {
    localStorage.setItem('adesivos_calculadora_config', JSON.stringify(config));
  }, [config]);

  // Main UI Tab layout selection (Independent page check using URL hash)
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    return window.location.hash === '#/admin' ? 'admin' : 'public';
  });

  // Watch hash changes to allow independent page loading/routing (Requirement 1)
  useEffect(() => {
    const handleHashChange = () => {
      setViewMode(window.location.hash === '#/admin' ? 'admin' : 'public');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeViewMode = (mode: 'public' | 'admin') => {
    setViewMode(mode);
    window.location.hash = mode === 'admin' ? '/admin' : '';
  };

  // Input fields state (Dynamic real-time synchronization)
  const [inputs, setInputs] = useState<CalculatorInputs>({
    widthCm: '5',
    heightCm: '5',
    quantity: '100',
    m2Value: config.m2Value,
    lossPercent: config.lossPercent,
    profitMargin: config.profitMargin,
    minOrder: config.minOrder,
    specialCut: false
  });

  // If defaults in configuration change, update active hidden variables in calculations
  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      m2Value: config.m2Value,
      lossPercent: config.lossPercent,
      profitMargin: config.profitMargin,
      minOrder: config.minOrder,
    }));
  }, [config]);

  // Form errors states
  const [errors, setErrors] = useState<Partial<Record<keyof CalculatorInputs, string>>>({});
  
  // Results structures
  const [results, setResults] = useState<CalculationResults | null>(null);

  // General layout auxiliary states
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Loaded database collection loaded directly from localStorage (Requirement 7)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('quadricrom_orders_crm');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao recuperar base de pedidos CRM', e);
    }
    
    // Pre-populate realistic mockup orders so dashboard looks stunning!
    const today = new Date();
    const ago3 = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const ago5 = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const ago1 = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const ago2 = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const mockOrders: Order[] = [
      {
        id: 'ord-1',
        clientName: 'Alice Martins',
        clientWhatsapp: '5511988887777',
        widthCm: 5,
        heightCm: 5,
        quantity: 500,
        totalValue: 150.00,
        valuePerUnit: 0.30,
        createdAt: ago3,
        status: 'vendido',
        specialCut: true
      },
      {
        id: 'ord-2',
        clientName: 'Carlos Souza',
        clientWhatsapp: '5511977775555',
        widthCm: 10,
        heightCm: 10,
        quantity: 100,
        totalValue: 80.00,
        valuePerUnit: 0.80,
        createdAt: ago5,
        status: 'vendido',
        specialCut: false
      },
      {
        id: 'ord-3',
        clientName: 'Bruno Rocha',
        clientWhatsapp: '5511966664444',
        widthCm: 3,
        heightCm: 3,
        quantity: 1000,
        totalValue: 180.00,
        valuePerUnit: 0.18,
        createdAt: ago1,
        status: 'orçamento',
        specialCut: true
      },
      {
        id: 'ord-4',
        clientName: 'Amanda Lima',
        clientWhatsapp: '5511955553333',
        widthCm: 4,
        heightCm: 4,
        quantity: 250,
        totalValue: 45.00,
        valuePerUnit: 0.18,
        createdAt: ago2,
        status: 'cancelado',
        specialCut: false
      },
      {
        id: 'ord-5',
        clientName: 'Roberto Silva',
        clientWhatsapp: '5511944442222',
        widthCm: 7,
        heightCm: 7,
        quantity: 150,
        totalValue: 58.80,
        valuePerUnit: 0.392,
        createdAt: today.toISOString(),
        status: 'vendido',
        specialCut: false
      }
    ];

    localStorage.setItem('quadricrom_orders_crm', JSON.stringify(mockOrders));
    return mockOrders;
  });

  // Trigger quick real-time calculations based on inputs
  const triggerCalculation = (updated: CalculatorInputs) => {
    // Merge base parameters dynamically
    const mergedForValidation = {
      ...updated,
      m2Value: updated.m2Value !== '' ? updated.m2Value : config.m2Value,
      lossPercent: config.lossPercent,
      profitMargin: config.profitMargin,
      minOrder: config.minOrder,
    };

    const validation = validateInputs(mergedForValidation);
    if (validation.isValid) {
      const calculated = calculateStickerValues({
        widthCm: Number(updated.widthCm),
        heightCm: Number(updated.heightCm),
        quantity: Number(updated.quantity),
        m2Value: updated.m2Value !== '' ? Number(updated.m2Value) : config.m2Value,
        lossPercent: config.lossPercent,
        profitMargin: config.profitMargin,
        minOrder: config.minOrder,
        specialCut: updated.specialCut,
        specialCutValue: config.specialCutValue,
      });
      setResults(calculated);
      setErrors({});
    } else {
      setResults(null);
      setErrors(validation.errors);
    }
  };

  // Run initial calculation once on mount
  useEffect(() => {
    triggerCalculation(inputs);
  }, [config]);

  // Handle live inputs keystrokes
  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    let finalVal = value;
    
    if (field !== 'specialCut' && typeof value === 'string') {
      if (value !== '') {
        const parsed = parseFloat(value.replace(',', '.'));
        if (!isNaN(parsed)) {
          finalVal = parsed;
        }
      }
    }

    const updatedInputs = {
      ...inputs,
      // Clear if empty string
      [field]: value === '' ? '' : finalVal
    };

    setInputs(updatedInputs);
    triggerCalculation(updatedInputs);
  };

  // Interactive Size Card Quick Select
  const applyPresetSize = (w: number, h: number) => {
    const updatedInputs = {
      ...inputs,
      widthCm: w,
      heightCm: h
    };
    setInputs(updatedInputs);
    triggerCalculation(updatedInputs);
    showNotification(`Medida definida para ${w}x${h} cm`);
  };

  // Interactive Qty Select Buttons
  const applyPresetQty = (qty: number) => {
    const updatedInputs = {
      ...inputs,
      quantity: qty
    };
    setInputs(updatedInputs);
    triggerCalculation(updatedInputs);
    showNotification(`Quantidade definida para ${qty} unidades`);
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Reset parameters in localStorage and app context to factory defaults
  const handleResetConfig = () => {
    if (confirm('Deseja mesmo redefinir todas as configurações administrativas para os valores de fábrica?')) {
      setConfig(FACTORY_DEFAULTS);
      localStorage.setItem('adesivos_calculadora_config', JSON.stringify(FACTORY_DEFAULTS));
      showNotification('Padrões de fábrica restaurados!');
    }
  };

  // Copy structured budget text safely
  const handleCopyBudget = () => {
    if (!results || inputs.widthCm === '' || inputs.heightCm === '' || inputs.quantity === '') return;

    const text = `Orçamento de Adesivo Personalizado:

Adesivo Vinil Branco Fosco
Medida: ${inputs.widthCm}cm x ${inputs.heightCm}cm
Quantidade: ${inputs.quantity} unidades
Área total: ${formatDecimal(results.totalAreaM2, 4)} m²
Valor total: R$ ${formatDecimal(results.finalValue, 2)}
Valor por unidade: ${formatUnitCurrency(results.valuePerUnit)}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showNotification('Orçamento copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Falha de escrita', err);
    });
  };

  // Launch pre-filled WhatsApp thread
  const handleSendWhatsapp = () => {
    if (!results) return;

    const text = `Olá, gostaria de fazer esse orçamento:

Adesivo Vinil Branco Fosco
Medida: ${inputs.widthCm}cm x ${inputs.heightCm}cm
Quantidade: ${inputs.quantity} unidades
Valor total: R$ ${formatDecimal(results.finalValue, 2)}
Valor por unidade: R$ ${formatDecimal(results.valuePerUnit, 2)}`;

    const phoneClean = config.whatsappNumber.replace(/\D/g, '');
    const apiURL = `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(text)}`;
    window.open(apiURL, '_blank');
  };

  // Callback to register estimate directly inside CRM database
  const handleSaveToCRM = (
    clientName: string,
    clientWhatsapp: string,
    fileName?: string,
    fileSize?: string,
    fileType?: string,
    fileDataUrl?: string
  ) => {
    if (!results) return;

    const created: Order = {
      id: 'ord-' + Date.now(),
      clientName: clientName.trim() || 'Cliente Web',
      clientWhatsapp: clientWhatsapp.replace(/\D/g, '') || config.whatsappNumber,
      widthCm: Number(inputs.widthCm),
      heightCm: Number(inputs.heightCm),
      quantity: Number(inputs.quantity),
      totalValue: results.finalValue,
      valuePerUnit: results.valuePerUnit,
      createdAt: new Date().toISOString(),
      status: 'orçamento',
      specialCut: inputs.specialCut,
      fileName,
      fileSize,
      fileType,
      fileDataUrl
    };

    const updatedCollection = [created, ...orders];
    setOrders(updatedCollection);
    localStorage.setItem('quadricrom_orders_crm', JSON.stringify(updatedCollection));
    showNotification('Orçamento gravado no CRM com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* Dynamic Upper Navigation / Header Ribbon */}
      <header className="bg-white border-b border-slate-100 shadow-2xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo with Quadricrom graphic accents */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-extrabold shadow-sm relative overflow-hidden group">
              <span className="relative z-10 font-sans tracking-tighter text-sm">QD</span>
              {/* CMYK decorative backing dots */}
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-[#00aeef] rounded-full mix-blend-screen opacity-70"></div>
              <div className="absolute -top-1 -left-1 w-4.5 h-4.5 bg-[#ec008c] rounded-full mix-blend-screen opacity-70"></div>
            </div>
            <div>
              <h1 className="text-base font-display font-black tracking-tight text-slate-900 flex items-center gap-1.5 uppercase">
                {config.companyName}
                <span className="text-[10px] font-mono text-[#00aeef] border border-[#00aeef]/30 bg-[#00aeef]/5 px-1.5 py-0.2 rounded-md font-bold lowercase tracking-normal">
                  online
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">Sistemas de Coprodução Gráfica</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Switching Controls */}
            <nav className="flex bg-slate-105 border border-slate-200 rounded-2xl p-1 gap-1">
              <button
                onClick={() => changeViewMode('public')}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'public' 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="h-4 w-4" />
                Página Pública
              </button>
              
              <button
                onClick={() => changeViewMode('admin')}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'admin' 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="h-4 w-4" />
                Painel Admin / CRM
              </button>
            </nav>
          </div>

        </div>
      </header>

      {/* Main layout routing workspace container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* Float Action toast triggers */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-slide-left hover:scale-102 transition">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {viewMode === 'public' ? (
          /* Public Customer Side layout */
          <ProductLanding
            config={config}
            inputs={inputs}
            results={results}
            errors={errors}
            handleInputChange={handleInputChange}
            applyPresetSize={applyPresetSize}
            applyPresetQty={applyPresetQty}
            handleCopyBudget={handleCopyBudget}
            handleSendWhatsapp={handleSendWhatsapp}
            handleSaveToCRM={handleSaveToCRM}
            copied={copied}
          />
        ) : (
          /* Secure Administrative side CRM system */
          <AdminPanel
            config={config}
            setConfig={setConfig}
            orders={orders}
            setOrders={setOrders}
            handleResetConfig={handleResetConfig}
          />
        )}

      </main>

      {/* Footer detailing corporate markers */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 mt-16 text-xs text-center">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="flex justify-center items-center gap-6 text-slate-300">
            <span className="hover:text-white transition cursor-pointer">Calculadora</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-white transition cursor-pointer">Políticas</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-white transition cursor-pointer">CRM Log</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-white transition cursor-pointer">Opções de Rótulos</span>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-200">© {new Date().getFullYear()} — {config.companyName} Rótulos Online.</p>
            <p className="text-slate-500">Tecnologia desenvolvida em React + Tailwind CSS para cotação instantânea de metro quadrado.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
