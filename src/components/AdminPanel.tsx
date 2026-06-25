/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Trash2, 
  Edit3, 
  Settings2, 
  Printer, 
  Percent, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  MessageSquare,
  ArrowUpRight,
  Plus,
  X,
  FileSpreadsheet,
  RotateCcw,
  Paperclip,
  Download,
  Upload,
  FileCode,
  File,
  AlertTriangle
} from 'lucide-react';
import { Order, DefaultConfig } from '../types';
import { formatCurrency, formatUnitCurrency, formatDecimal } from '../utils';

interface AdminPanelProps {
  config: DefaultConfig;
  setConfig: React.Dispatch<React.SetStateAction<DefaultConfig>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  handleResetConfig: () => void;
}

export default function AdminPanel({
  config,
  setConfig,
  orders,
  setOrders,
  handleResetConfig
}: AdminPanelProps) {
  // Settings view sub-tab selection
  const [subTab, setSubTab] = useState<'crm' | 'config'>('crm');
  
  // Filtering and searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'orçamento' | 'vendido' | 'cancelado' | 'Pagamento concluído' | 'Aguardando criação da arte' | 'Em produção' | 'Produzido' | 'Enviado'>('all');

  // Editing state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Adding order state (CRM directly)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderWidth, setNewOrderWidth] = useState('5');
  const [newOrderHeight, setNewOrderHeight] = useState('5');
  const [newOrderQty, setNewOrderQty] = useState('100');
  const [newOrderStatus, setNewOrderStatus] = useState<Order['status']>('orçamento');
  const [newOrderSpecialCut, setNewOrderSpecialCut] = useState(false);
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newOrderMaxDate, setNewOrderMaxDate] = useState<string>('');

  // Date Filter: Day, Week, Month, All
  const [dateFilter, setDateFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');

  // Status Change Drawer State
  const [statusDrawerOrder, setStatusDrawerOrder] = useState<Order | null>(null);

  // Deletion Confirm Modal State
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // File Indexing in manual register
  const [newOrderFile, setNewOrderFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);

  // Edit Order file states
  const [editOrderFile, setEditOrderFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
  } | null>(null);

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processNewFile(file);
    }
  };

  const processNewFile = (file: File) => {
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(1)} KB`;
      
    if (file.type.startsWith('image/') && file.size < 600 * 1024) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewOrderFile({
          name: file.name,
          size: sizeStr,
          type: file.type,
          dataUrl: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      setNewOrderFile({
        name: file.name,
        size: sizeStr,
        type: file.type
      });
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${(file.size / 1024).toFixed(1)} KB`;
        
      if (file.type.startsWith('image/') && file.size < 600 * 1024) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setEditOrderFile({
            name: file.name,
            size: sizeStr,
            type: file.type,
            dataUrl: event.target?.result as string
          });
        };
        reader.readAsDataURL(file);
      } else {
        setEditOrderFile({
          name: file.name,
          size: sizeStr,
          type: file.type
        });
      }
    }
  };

  // Helper to trigger direct local file downloads
  const downloadIndexedFile = (order: Order) => {
    if (!order.fileName) return;
    
    const element = document.createElement("a");
    if (order.fileDataUrl) {
      element.href = order.fileDataUrl;
    } else {
      const fileContent = `Conteudo do arquivo vetorizado indexado no CRM da ${config.companyName}: ${order.fileName}.`;
      const file = new Blob([fileContent], { type: order.fileType || 'text/plain' });
      element.href = URL.createObjectURL(file);
    }
    element.download = order.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Month computations
  const isSoldStatus = (status: Order['status']) => {
    return ['vendido', 'Pagamento concluído', 'Em produção', 'Produzido', 'Enviado'].includes(status);
  };

  const totalRevenue = orders
    .filter(o => isSoldStatus(o.status))
    .reduce((sum, o) => sum + o.totalValue, 0);

  const totalOrdersCount = orders.filter(o => isSoldStatus(o.status)).length;

  const totalStickersSold = orders
    .filter(o => isSoldStatus(o.status))
    .reduce((sum, o) => sum + o.quantity, 0);

  const totalM2Sold = orders
    .filter(o => isSoldStatus(o.status))
    .reduce((sum, o) => sum + ((o.widthCm * o.heightCm) / 10000) * o.quantity, 0);

  const ticketMedio = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;

  const pendingBudgetsCount = orders.filter(o => o.status === 'orçamento').length;

  const cancelledCount = orders.filter(o => o.status === 'cancelado').length;

  // Save base configurations safely
  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updated: DefaultConfig = {
      m2Value: parseFloat(formData.get('m2Value') as string) || 51,
      lossPercent: parseFloat(formData.get('lossPercent') as string) || 0,
      profitMargin: 0,
      minOrder: parseFloat(formData.get('minOrder') as string) || 30,
      specialCutValue: parseFloat(formData.get('specialCutValue') as string) || 0.15,
      companyName: formData.get('companyName') as string || 'Quadricrom',
      whatsappNumber: formData.get('whatsappNumber') as string || '5511999999999',
    };

    setConfig(updated);
    localStorage.setItem('adesivos_calculadora_config', JSON.stringify(updated));

    // Show quick notification
    alert('Configurações salvas e aplicadas em tempo de execução!');
  };

  // Add new direct CRM order
  const handleAddNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newOrderWidth) || 5;
    const h = parseFloat(newOrderHeight) || 5;
    const qty = parseInt(newOrderQty, 10) || 100;

    // Direct cost calculation following current metrics
    const baseAreaM2 = ((w * h) / 10000) * qty;
    const costPrice = baseAreaM2 * config.m2Value;
    const profitVal = costPrice; // Profit margin removed as requested
    const cutCost = newOrderSpecialCut ? (qty * config.specialCutValue) : 0;
    const computedTotal = Math.max(config.minOrder, profitVal + cutCost);

    const created: Order = {
      id: 'ord-' + Date.now(),
      clientName: newOrderName || 'Cliente Direto',
      clientWhatsapp: newOrderPhone.replace(/\D/g, '') || config.whatsappNumber,
      widthCm: w,
      heightCm: h,
      quantity: qty,
      totalValue: computedTotal,
      valuePerUnit: qty > 0 ? computedTotal / qty : 0,
      createdAt: new Date().toISOString(),
      status: newOrderStatus,
      specialCut: newOrderSpecialCut,
      fileName: newOrderFile?.name,
      fileSize: newOrderFile?.size,
      fileType: newOrderFile?.type,
      fileDataUrl: newOrderFile?.dataUrl,
      deliveryDate: newOrderDeliveryDate || new Date().toISOString().split('T')[0],
      maxDate: newOrderMaxDate || undefined
    };

    const updatedOrders = [created, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('quadricrom_orders_crm', JSON.stringify(updatedOrders));

    // Reset fields
    setNewOrderName('');
    setNewOrderPhone('');
    setNewOrderWidth('5');
    setNewOrderHeight('5');
    setNewOrderQty('100');
    setNewOrderStatus('orçamento');
    setNewOrderSpecialCut(false);
    setNewOrderFile(null);
    setNewOrderDeliveryDate(new Date().toISOString().split('T')[0]);
    setNewOrderMaxDate('');
    setShowAddForm(false);
  };

  // Save modified order changes
  const handleUpdateOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOrder) return;

    const formData = new FormData(e.currentTarget);
    const w = parseFloat(formData.get('widthCm') as string) || editingOrder.widthCm;
    const h = parseFloat(formData.get('heightCm') as string) || editingOrder.heightCm;
    const qty = parseInt(formData.get('quantity') as string, 10) || editingOrder.quantity;
    const totalVal = parseFloat(formData.get('totalValue') as string) || editingOrder.totalValue;

    const updated: Order = {
      ...editingOrder,
      clientName: formData.get('clientName') as string || editingOrder.clientName,
      clientWhatsapp: (formData.get('clientWhatsapp') as string || '').replace(/\D/g, ''),
      widthCm: w,
      heightCm: h,
      quantity: qty,
      totalValue: totalVal,
      valuePerUnit: qty > 0 ? totalVal / qty : 0,
      status: formData.get('status') as Order['status'],
      fileName: editOrderFile?.name,
      fileSize: editOrderFile?.size,
      fileType: editOrderFile?.type,
      fileDataUrl: editOrderFile?.dataUrl,
      deliveryDate: formData.get('deliveryDate') as string || editingOrder.deliveryDate,
      maxDate: formData.get('maxDate') as string || editingOrder.maxDate
    };

    const updatedCollection = orders.map(o => o.id === editingOrder.id ? updated : o);
    setOrders(updatedCollection);
    localStorage.setItem('quadricrom_orders_crm', JSON.stringify(updatedCollection));
    setEditingOrder(null);
  };

  // Delete recorded order row
  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
  };

  const confirmDeleteOrder = () => {
    if (!orderToDelete) return;
    const filtered = orders.filter(o => o.id !== orderToDelete.id);
    setOrders(filtered);
    localStorage.setItem('quadricrom_orders_crm', JSON.stringify(filtered));
    setOrderToDelete(null);
  };

  // Direct status update handler from drawer selection
  const handleUpdateStatusDirect = (newStatus: Order['status']) => {
    if (!statusDrawerOrder) return;
    const updatedCollection = orders.map(o => o.id === statusDrawerOrder.id ? { ...o, status: newStatus } : o);
    setOrders(updatedCollection);
    localStorage.setItem('quadricrom_orders_crm', JSON.stringify(updatedCollection));
    setStatusDrawerOrder(null);
  };

  // Format YYYY-MM-DD or ISO string to DD/MM/YYYY
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '-';
    const clean = dateStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Status badges formatter
  const renderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'vendido':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Vendido
          </span>
        );
      case 'orçamento':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Orçamento
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Cancelado
          </span>
        );
      case 'Pagamento concluído':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-150">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Pagamento Concluído
          </span>
        );
      case 'Aguardando criação da arte':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-150">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Aguardando Arte
          </span>
        );
      case 'Em produção':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-150">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin"></span>
            Em Produção
          </span>
        );
      case 'Produzido':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-150">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Produzido
          </span>
        );
      case 'Enviado':
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-150">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Enviado / Despachado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Generate follow-up whatsapp templates for print team
  const makeFollowUpLink = (order: Order) => {
    let text = '';
    if (order.status === 'orçamento') {
      text = `Olá ${order.clientName}! Vimos o seu orçamento de Adesivos Vinil Fosco (${order.widthCm}x${order.heightCm} cm — ${order.quantity} unidades) no valor de ${formatCurrency(order.totalValue)}. Gostaria de confirmar o pedido e fechar a produção com a ${config.companyName}?`;
    } else if (order.status === 'vendido') {
      text = `Olá ${order.clientName}, seu pedido de Adesivos de Vinil (${order.widthCm}x${order.heightCm} cm — ${order.quantity} un) já foi registrado como VENDIDO no sistema da ${config.companyName}. Iniciaremos a fase de recorte em breve !`;
    } else {
      text = `Olá ${order.clientName}, temos uma oferta especial caso queira recuperar seu pedido de adesivos cancelado.`;
    }

    const cleanPhone = order.clientWhatsapp.replace(/\D/g, '') || config.whatsappNumber;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  // Multi-criteria list filters
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.clientWhatsapp.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === 'day') {
        matchesDate = orderDate >= startOfToday;
      } else if (dateFilter === 'week') {
        const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === 'month') {
        const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= thirtyDaysAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-8">
      {/* Mini Admin navigation bars */}
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black text-slate-900 flex items-center gap-2">
            <Printer className="h-6 w-6 text-[#00aeef]" />
            Painel da Reprografia
          </h2>
          <p className="text-xs text-slate-500">
            Gerencie orçamentos recebidos, registre vendas finais, analise métricas comerciais e altere margens de lucro.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('crm')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'crm' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Vendas e CRM
          </button>
          <button
            onClick={() => setSubTab('config')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'config' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Configurar Gráfica
          </button>
        </div>
      </div>

      {subTab === 'crm' ? (
        <div className="space-y-8">
          {/* Dashboard Summary Cards Container (Requirement 6) */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {/* KPI 1: Sold total value */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                <DollarSign className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Vendido</p>
              <h4 className="text-lg font-mono font-bold text-slate-900">{formatCurrency(totalRevenue)}</h4>
              <p className="text-[9px] text-emerald-600 font-semibold flex items-center">Meta do Mês Ativa</p>
            </div>

            {/* KPI 2: Total sold orders */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 text-[#00aeef] bg-[#00aeef]/5 p-1.5 rounded-lg border border-[#00aeef]/10">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Pedidos Vendidos</p>
              <h4 className="text-xl font-mono font-bold text-slate-900">{totalOrdersCount} ped.</h4>
              <p className="text-[9px] text-slate-400">Em produção digital</p>
            </div>

            {/* KPI 3: Total sticker stickers volume */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 text-[#ec008c] bg-[#ec008c]/5 p-1.5 rounded-lg border border-[#ec008c]/10">
                <Printer className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Metragem Vendida</p>
              <h4 className="text-lg font-mono font-bold text-slate-900">{totalM2Sold.toFixed(3).replace('.', ',')} m²</h4>
              <p className="text-[9px] text-slate-400">{totalStickersSold.toLocaleString('pt-BR')} adesivos un.</p>
            </div>

            {/* KPI 4: Ticket médio */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 text-purple-600 bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Ticket Médio</p>
              <h4 className="text-lg font-mono font-bold text-slate-900">{formatCurrency(ticketMedio)}</h4>
              <p className="text-[9px] text-slate-400">Média por pedido</p>
            </div>

            {/* KPI 5: Pending counts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 text-amber-500 bg-amber-50 p-1.5 rounded-lg border border-amber-100">
                <FileText className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Pedidos Abertos</p>
              <h4 className="text-xl font-mono font-bold text-slate-900">{pendingBudgetsCount} orç.</h4>
              <p className="text-[9px] text-amber-600 font-medium">Aguardando contato</p>
            </div>

            {/* KPI 6: Cancelled counts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 text-slate-400 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <XCircle className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Vendas Canceladas</p>
              <h4 className="text-xl font-mono font-bold text-slate-900">{cancelledCount} can.</h4>
              <p className="text-[9px] text-slate-500">Mudar precificação</p>
            </div>
          </div>

          {/* CRM Editor Slide-Over Modal / Card Trigger */}
          {editingOrder && (
            <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-[#00aeef]" />
                  <h3 className="text-base font-bold">Modificar Orçamento / Venda do Cliente</h3>
                </div>
                <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateOrder} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label htmlFor="edit-name" className="text-xs text-slate-400 font-semibold block">Nome do Cliente</label>
                  <input type="text" name="clientName" id="edit-name" defaultValue={editingOrder.clientName} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-3 rounded-xl focus:border-[#00aeef]" required />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-whatsapp" className="text-xs text-slate-400 font-semibold block">WhatsApp do Cliente</label>
                  <input type="text" name="clientWhatsapp" id="edit-whatsapp" defaultValue={editingOrder.clientWhatsapp} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-3 rounded-xl focus:border-[#00aeef]" />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="edit-width" className="text-[10px] text-slate-400 block">Larg (cm)</label>
                    <input type="number" step="0.1" name="widthCm" id="edit-width" defaultValue={editingOrder.widthCm} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-1 rounded-lg text-center" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-height" className="text-[10px] text-slate-400 block">Alt (cm)</label>
                    <input type="number" step="0.1" name="heightCm" id="edit-height" defaultValue={editingOrder.heightCm} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-1 rounded-lg text-center" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-qty" className="text-[10px] text-slate-400 block">Qtd (un)</label>
                    <input type="number" name="quantity" id="edit-qty" defaultValue={editingOrder.quantity} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-1 rounded-lg text-center" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-totalValue" className="text-xs text-slate-400 font-semibold block">Preço Final Ajustado (R$)</label>
                  <input type="number" step="0.01" name="totalValue" id="edit-totalValue" defaultValue={editingOrder.totalValue} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-3 rounded-xl focus:border-[#00aeef]" required />
                </div>

                <div className="space-y-1 col-span-1">
                  <label htmlFor="edit-status" className="text-xs text-slate-400 font-semibold block">Status da Venda</label>
                  <select name="status" id="edit-status" defaultValue={editingOrder.status} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-3.5 rounded-xl text-white">
                    <option value="orçamento">Orçamento</option>
                    <option value="vendido">Vendido</option>
                    <option value="Pagamento concluído">Pagamento concluído</option>
                    <option value="Aguardando criação da arte">Aguardando criação da arte</option>
                    <option value="Em produção">Em produção</option>
                    <option value="Produzido">Produzido</option>
                    <option value="Enviado">Enviado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label htmlFor="edit-delivery-date" className="text-xs text-slate-400 font-semibold block">Data do Pedido</label>
                  <input type="date" name="deliveryDate" id="edit-delivery-date" defaultValue={editingOrder.deliveryDate ? editingOrder.deliveryDate : (editingOrder.createdAt ? editingOrder.createdAt.split('T')[0] : '')} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-3 rounded-xl text-white focus:border-[#00aeef]" required />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label htmlFor="edit-max-date" className="text-xs text-slate-400 font-semibold block">Prazo Máximo / Data Limite</label>
                  <input type="date" name="maxDate" id="edit-max-date" defaultValue={editingOrder.maxDate || ''} className="w-full text-xs h-9 bg-slate-800 border border-slate-700 px-3 rounded-xl text-white focus:border-[#00aeef]" />
                </div>

                <div className="col-span-1 md:col-span-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold">Arquivo / Arte Indexada:</span>
                    {!editOrderFile ? (
                      <label className="py-1 px-3 border border-slate-700 hover:border-[#00aeef] rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] font-bold text-slate-300 cursor-pointer flex items-center gap-1.5 transition">
                        <Upload className="h-3.5 w-3.5 text-[#00aeef]" />
                        Vincular Novo Arquivo
                        <input type="file" onChange={handleEditFileChange} accept=".pdf,.cdr,.ai,.png,.jpg,.jpeg" className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-850 border border-slate-750 py-1 px-2.5 rounded-lg text-xs">
                        <Paperclip className="h-3.5 w-3.5 text-[#00aeef]" />
                        <span className="font-mono text-slate-300 truncate max-w-[130px]" title={editOrderFile.name}>{editOrderFile.name}</span>
                        <button type="button" onClick={() => setEditOrderFile(null)} className="text-red-400 hover:text-red-600 font-bold font-mono">×</button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2.5">
                    <button type="submit" className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#00aeef] to-[#ec008c] font-semibold text-xs transition cursor-pointer">
                      Salvar Alterações
                    </button>
                    <button type="button" onClick={() => setEditingOrder(null)} className="h-9 px-4 rounded-xl bg-slate-800 text-slate-350 hover:bg-slate-750 text-xs font-semibold cursor-pointer">
                      Descartar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* CRM Filters Controls and Manual Insert form button */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search text box & Status filter dropdown */}
              <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
                <input 
                  type="text" 
                  placeholder="Pesquisar por cliente ou telefone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-xs h-10 px-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden"
                />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 focus:ring-1 focus:ring-[#00aeef] cursor-pointer"
                >
                  <option value="all">Filtro Status: Todos</option>
                  <option value="orçamento">Apenas Orçamentos</option>
                  <option value="vendido">Apenas Vendidos (Histórico)</option>
                  <option value="Pagamento concluído">Pagamento Concluído</option>
                  <option value="Aguardando criação da arte">Aguardando Arte</option>
                  <option value="Em produção">Em Produção</option>
                  <option value="Produzido">Produzido / Pronto</option>
                  <option value="Enviado">Enviado / Despachado</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>

              {/* Date Filter Segmented Controls (Day, Week, Month, All) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-150">
                <button
                  type="button"
                  onClick={() => setDateFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('day')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateFilter === 'day' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('week')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateFilter === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Semana
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('month')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dateFilter === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Mês
                </button>
              </div>

              {/* Direct manual add button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="py-2.5 px-4.5 rounded-xl text-xs font-bold bg-[#00aeef] hover:bg-[#00aeef]/90 text-white flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer shrink-0"
              >
                {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showAddForm ? 'Cancelar' : 'Nova Venda Manual'}
              </button>
            </div>

            {/* Expandable Manual insert form */}
            {showAddForm && (
              <form onSubmit={handleAddNewOrder} className="border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label htmlFor="new-name" className="text-xs font-semibold text-slate-700 block col-span-2">Cliente</label>
                  <input type="text" id="new-name" value={newOrderName} onChange={(e) => setNewOrderName(e.target.value)} placeholder="Ex: Roberto Carlos" className="w-full text-xs h-10 px-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" required />
                </div>
                <div className="space-y-1">
                  <label htmlFor="new-phone" className="text-xs font-semibold text-slate-700 block">WhatsApp</label>
                  <input type="text" id="new-phone" value={newOrderPhone} onChange={(e) => setNewOrderPhone(e.target.value)} placeholder="Ex: 11988887777" className="w-full text-xs h-10 px-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="space-y-1">
                    <label htmlFor="new-width" className="text-[10px] text-slate-500 block">Larg (cm)</label>
                    <input type="number" step="0.1" id="new-width" value={newOrderWidth} onChange={(e) => setNewOrderWidth(e.target.value)} className="w-full text-xs h-9 border border-slate-200 rounded-lg text-center" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="new-height" className="text-[10px] text-slate-500 block">Alt (cm)</label>
                    <input type="number" step="0.1" id="new-height" value={newOrderHeight} onChange={(e) => setNewOrderHeight(e.target.value)} className="w-full text-xs h-9 border border-slate-200 rounded-lg text-center" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="new-qty" className="text-[10px] text-slate-500 block">Qtd (un)</label>
                    <input type="number" id="new-qty" value={newOrderQty} onChange={(e) => setNewOrderQty(e.target.value)} className="w-full text-xs h-9 border border-slate-200 rounded-lg text-center" />
                  </div>
                </div>

                <div className="flex items-center gap-4 h-10 col-span-1">
                  <div className="space-y-1 flex-1">
                    <label htmlFor="new-status" className="text-xs font-semibold text-slate-700 block">Status</label>
                    <select id="new-status" value={newOrderStatus} onChange={(e) => setNewOrderStatus(e.target.value as any)} className="w-full text-xs h-9 border border-slate-200 rounded-lg px-2 text-slate-800">
                      <option value="orçamento">Orçamento</option>
                      <option value="vendido">Vendido</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5 self-end mb-2 shrink-0">
                    <input type="checkbox" id="new-special-cut" checked={newOrderSpecialCut} onChange={(e) => setNewOrderSpecialCut(e.target.checked)} className="h-4 w-4 text-[#ec008c] focus:ring-[#ec008c] rounded" />
                    <label htmlFor="new-special-cut" className="text-[10px] font-bold text-slate-600 block cursor-pointer">Especial</label>
                  </div>
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label htmlFor="new-delivery-date" className="text-xs font-semibold text-slate-700 block">Data do Pedido</label>
                  <input type="date" id="new-delivery-date" value={newOrderDeliveryDate} onChange={(e) => setNewOrderDeliveryDate(e.target.value)} className="w-full text-xs h-10 px-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00aeef]" required />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label htmlFor="new-max-date" className="text-xs font-semibold text-slate-700 block">Prazo Máximo / Data Limite (Opcional)</label>
                  <input type="date" id="new-max-date" value={newOrderMaxDate} onChange={(e) => setNewOrderMaxDate(e.target.value)} className="w-full text-xs h-10 px-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00aeef]" />
                </div>

                <div className="col-span-1 md:col-span-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700">Arquivo / Arte (Opcional):</span>
                    {!newOrderFile ? (
                      <label className="py-1 px-3 border border-slate-200 hover:border-[#00aeef] rounded-lg bg-slate-50 hover:bg-white text-[11px] font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 transition">
                        <Upload className="h-3.5 w-3.5 text-[#00aeef]" />
                        Vincular Arquivo
                        <input type="file" onChange={handleNewFileChange} accept=".pdf,.cdr,.ai,.png,.jpg,.jpeg" className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 py-1 px-2.5 rounded-lg">
                        <Paperclip className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-mono text-slate-600 truncate max-w-[150px]">{newOrderFile.name}</span>
                        <button type="button" onClick={() => setNewOrderFile(null)} className="text-red-500 hover:text-red-700 text-xs font-bold font-mono">×</button>
                      </div>
                    )}
                  </div>
                  
                  <button type="submit" className="py-2.5 px-6 font-bold text-xs bg-slate-900 border border-slate-900 text-white rounded-xl shadow transition cursor-pointer">
                    Gravar e Registrar Venda
                  </button>
                </div>
              </form>
            )}

            {/* CRM Database Table (Requirement 5 & Layout styling 10) */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-455 uppercase font-mono font-bold tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Cliente / Contato</th>
                    <th className="py-3 px-4">Dimensões cm</th>
                    <th className="py-3 px-4">Qtd</th>
                    <th className="py-3 px-4">Metragem m²</th>
                    <th className="py-3 px-4">Valor do m²</th>
                    <th className="py-3 px-4">Preço Total (Unit)</th>
                    <th className="py-3 px-4">Cronograma / Datas</th>
                    <th className="py-3 px-4">Arte Indexada</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações CRM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 font-medium whitespace-normal">
                        Nenhum registro encontrado correspondente aos filtros.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const unitM2 = (order.widthCm * order.heightCm) / 10000;
                      const totalM2 = unitM2 * order.quantity;
                      const pricePerM2 = totalM2 > 0 ? (order.totalValue / totalM2) : 0;

                      return (
                        <tr key={order.id} className="hover:bg-slate-50 transition group">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>
                              <p>{order.clientName}</p>
                              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                {order.clientWhatsapp || 'Nenhum WhatsApp'}
                              </p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                            {order.widthCm} x {order.heightCm} cm
                            {order.specialCut && (
                              <span className="ml-1 text-[8px] font-mono bg-purple-50 text-purple-700 px-1 py-0.5 rounded border border-purple-100 font-bold uppercase">Esp.</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">{order.quantity} un.</td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            <div className="font-bold text-slate-800">{totalM2.toFixed(4).replace('.', ',')} m²</div>
                            <div className="text-[9px] text-slate-400">Un: {unitM2.toFixed(4).replace('.', ',')} m²</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            <div className="font-bold text-[#00aeef]">{formatCurrency(pricePerM2)}/m²</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-mono font-bold text-slate-950">{formatCurrency(order.totalValue)}</p>
                            <p className="text-[9px] font-mono text-slate-400">({formatUnitCurrency(order.valuePerUnit)}/un)</p>
                          </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 text-[11px] font-mono leading-tight">
                            <div className="flex items-center gap-1 text-slate-400 animate-fade-in" title="Data de Registro">
                              <span className="text-[8px] font-sans font-bold bg-slate-100 text-slate-500 px-1 py-0.5 rounded uppercase leading-none">Cad</span>
                              {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1 text-slate-700" title="Data do Pedido">
                              <span className="text-[8px] font-sans font-bold bg-blue-50 text-blue-600 px-1 py-0.5 rounded uppercase leading-none">Ped</span>
                              {order.deliveryDate ? formatDateDisplay(order.deliveryDate) : formatDateDisplay(order.createdAt)}
                            </div>
                            {order.maxDate ? (
                              <div className="flex items-center gap-1 text-rose-600 font-bold" title="Prazo Limite Máximo">
                                <span className="text-[8px] font-sans font-bold bg-rose-50 text-rose-600 px-1 py-0.5 rounded uppercase leading-none">Lim</span>
                                {formatDateDisplay(order.maxDate)}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-350 italic text-[10px]" title="Nenhum prazo limite definido">
                                <span className="text-[8px] font-sans font-bold bg-slate-100 text-slate-400 px-1 py-0.5 rounded uppercase leading-none">Lim</span>
                                Sem prazo
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {order.fileName ? (
                            <div className="flex items-center gap-1.5 group/file">
                              {order.fileDataUrl ? (
                                <img 
                                  src={order.fileDataUrl} 
                                  alt="Preview" 
                                  className="w-7 h-7 object-cover rounded border border-slate-200 bg-white shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                                  <FileCode className="h-4 w-4" />
                                </div>
                              )}
                              <div className="min-w-0 max-w-[110px]">
                                <p className="text-[11px] font-bold text-slate-800 truncate" title={order.fileName}>
                                  {order.fileName}
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono">
                                  {order.fileSize || 'Excedido'}
                                </p>
                              </div>
                              <button
                                onClick={() => downloadIndexedFile(order)}
                                title="Baixar arquivo indexado"
                                className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition ml-auto cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Sem arquivo</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setStatusDrawerOrder(order)}
                            className="hover:scale-105 active:scale-95 transition-all text-left cursor-pointer group/badge relative inline-block focus:outline-hidden"
                            title="Clique para alterar o status"
                          >
                            {renderStatusBadge(order.status)}
                            <span className="absolute -top-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-0.5 opacity-0 group-hover/badge:opacity-100 transition shadow-sm text-[8px] leading-none">✎</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                            {/* WhatsApp send message directly */}
                            <a 
                              href={makeFollowUpLink(order)}
                              target="_blank" 
                              rel="noreferrer"
                              title="Prosseguir atendimento cliente via WhatsApp"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition"
                            >
                              <MessageSquare className="h-4.5 w-4.5" />
                            </a>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditingOrder(order);
                                if (order.fileName) {
                                  setEditOrderFile({
                                    name: order.fileName,
                                    size: order.fileSize || '',
                                    type: order.fileType || '',
                                    dataUrl: order.fileDataUrl
                                  });
                                } else {
                                  setEditOrderFile(null);
                                }
                              }}
                              title="Modificar dados de registro"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition cursor-pointer"
                            >
                              <Edit3 className="h-4.5 w-4.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteOrder(order)}
                              title="Excluir do histórico do CRM"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition cursor-pointer"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            {/* Footer summary trace count */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-450">
              <span>Total de {filteredOrders.length} registros exibidos</span>
              <span className="text-slate-400">Armazenamento: LocalStorage</span>
            </div>
          </div>
        </div>
      ) : (
        /* Configuration Panel Tab (Requirement 8) */
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#ec008c]" />
              Variáveis e Custos de Impressão
            </h3>
            
            <button
              onClick={handleResetConfig}
              className="py-1 px-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restaurar Padrões originais
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Ajuste a precificação base e as taxas adicionais de produção. Essas variáveis determinam as saídas geradas em tempo real na calculadora pública do e-commerce Quadricrom.
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
              
              {/* m2 base price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Preço do m² do material (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input type="number" step="0.01" name="m2Value" defaultValue={config.m2Value} className="w-full text-xs h-10 pl-9 pr-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" required />
                </div>
              </div>

              {/* Profit margin (Hidden as per user request to remove profit margins) */}
              <input type="hidden" name="profitMargin" value="0" />

              {/* Waste level */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Percentual de Perda residual (%)</label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  <input type="number" step="1" name="lossPercent" defaultValue={config.lossPercent} className="w-full text-xs h-10 px-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" required />
                </div>
              </div>

              {/* Minimum order cost */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Valor Mínimo do Orçamento (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input type="number" step="0.01" name="minOrder" defaultValue={config.minOrder} className="w-full text-xs h-10 pl-9 pr-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" required />
                </div>
              </div>

              {/* Special cut extra unit price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Adicional Recorte Especial (R$/unidade)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input type="number" step="0.01" name="specialCutValue" defaultValue={config.specialCutValue} className="w-full text-xs h-10 pl-9 pr-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" required />
                </div>
              </div>

              {/* Graphic name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Nome da Gráfica Coprodução</label>
                <input type="text" name="companyName" defaultValue={config.companyName} className="w-full text-xs h-10 px-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" required />
              </div>

              {/* General WhatsApp receiving configuration */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block">Número WhatsApp de Vendas (com DDI + DDD)</label>
                <input type="text" name="whatsappNumber" defaultValue={config.whatsappNumber} placeholder="Ex: 5511999999999" className="w-full text-xs h-10 px-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:ring-1 focus:ring-[#00aeef] focus:outline-hidden" required />
                <p className="text-[10px] text-slate-455">Insira apenas dígitos numéricos incluindo o código do país: 55 para o Brasil.</p>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="submit" 
                className="py-2.5 px-6 font-bold text-xs bg-slate-900 border border-slate-900 text-white rounded-xl shadow cursor-pointer hover:bg-slate-850"
              >
                Gravar Configurações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drawer / Pop-up bottom modal for status updates */}
      {statusDrawerOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setStatusDrawerOrder(null)}
          ></div>
          
          {/* Centered Modal / Bottom Sheet */}
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
            <div className="relative transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-lg p-6 pb-8 sm:pb-6 space-y-4 border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-900">Atualizar Status do Pedido</h3>
                  <p className="text-[10px] font-mono text-[#00aeef]">{statusDrawerOrder.clientName} ({statusDrawerOrder.widthCm}x{statusDrawerOrder.heightCm}cm • {statusDrawerOrder.quantity}un)</p>
                </div>
                <button 
                  onClick={() => setStatusDrawerOrder(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Selecione o novo status de produção:</p>
                
                {/* Main 5 requested statuses */}
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    type="button"
                    onClick={() => handleUpdateStatusDirect('Pagamento concluído')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:bg-green-50/55 cursor-pointer ${
                      statusDrawerOrder.status === 'Pagamento concluído' ? 'border-green-500 bg-green-50/40 shadow-xs' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-800">Pagamento Concluído</span>
                    </div>
                    <span className="text-[10px] text-green-600 font-mono">financeiro</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleUpdateStatusDirect('Aguardando criação da arte')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:bg-purple-50/55 cursor-pointer ${
                      statusDrawerOrder.status === 'Aguardando criação da arte' ? 'border-purple-500 bg-purple-50/40 shadow-xs' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span className="text-xs font-bold text-slate-800">Aguardando Criação da Arte</span>
                    </div>
                    <span className="text-[10px] text-purple-600 font-mono">vetorização</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleUpdateStatusDirect('Em produção')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:bg-blue-50/55 cursor-pointer ${
                      statusDrawerOrder.status === 'Em produção' ? 'border-blue-500 bg-blue-50/40 shadow-xs' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-800">Em Produção / Impressão</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-mono">máquina plotter</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleUpdateStatusDirect('Produzido')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:bg-indigo-50/55 cursor-pointer ${
                      statusDrawerOrder.status === 'Produzido' ? 'border-indigo-500 bg-indigo-50/40 shadow-xs' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span className="text-xs font-bold text-slate-800">Produzido / Pronto</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-mono">acabamento</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleUpdateStatusDirect('Enviado')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all hover:bg-sky-50/55 cursor-pointer ${
                      statusDrawerOrder.status === 'Enviado' ? 'border-sky-500 bg-sky-50/40 shadow-xs' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                      <span className="text-xs font-bold text-slate-800">Enviado / Despachado</span>
                    </div>
                    <span className="text-[10px] text-sky-600 font-mono">logística</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[9px] font-mono uppercase text-slate-400 tracking-wider mb-2">Opções Padrão Adicionais:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => handleUpdateStatusDirect('orçamento')}
                      className={`py-2 px-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                        statusDrawerOrder.status === 'orçamento' ? 'border-amber-400 bg-amber-50/50 text-amber-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Orçamento
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleUpdateStatusDirect('vendido')}
                      className={`py-2 px-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                        statusDrawerOrder.status === 'vendido' ? 'border-emerald-400 bg-emerald-50/50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Vendido
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleUpdateStatusDirect('cancelado')}
                      className={`py-2 px-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                        statusDrawerOrder.status === 'cancelado' ? 'border-slate-400 bg-slate-50 text-slate-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cancelado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Confirm Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-55 overflow-y-auto">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setOrderToDelete(null)}
          ></div>
          
          {/* Centered Modal */}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md p-6 space-y-4 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="text-left space-y-1.5 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">Excluir Registro de Venda?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Você está prestes a excluir permanentemente este pedido do CRM. Esta ação não poderá ser desfeita.
                  </p>
                </div>
              </div>

              {/* Order Info Card inside confirm */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="font-bold text-slate-800">{orderToDelete.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medida:</span>
                  <span className="font-bold text-slate-700">{orderToDelete.widthCm}x{orderToDelete.heightCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantidade:</span>
                  <span className="font-bold text-slate-700">{orderToDelete.quantity} un.</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400">Valor Total:</span>
                  <span className="font-bold text-rose-600">{formatCurrency(orderToDelete.totalValue)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteOrder}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
