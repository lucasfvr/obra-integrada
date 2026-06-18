import API_BASE_URL from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Button from '../ui/button/Button.tsx';
import { useToast } from '../../context/ToastContext.jsx';

const labelClass = "block text-sm font-medium text-foreground mb-1.5";
const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

/**
 * Currency Input customizado para não depender de libs extras
 */
const CurrencyInput = ({ value, onChange, placeholder, disabled, className }) => {
  const handleChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove tudo que não for dígito
    if (!val) {
      onChange(0);
      return;
    }
    const num = parseInt(val, 10) / 100;
    onChange(num);
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);

  return (
    <input
      type="text"
      value={value === 0 && !placeholder ? '' : formattedValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};

export default function NovaObraWizard({ onClose, onSave, currentUser, apiFetch }) {
  const [step, setStep] = useState(1);
  const [loadingCep, setLoadingCep] = useState(false);
  const { toast } = useToast();
  
  const { register, control, handleSubmit, watch, setValue, trigger, setError, clearErrors, formState: { errors } } = useForm({
    defaultValues: {
      nome: '',
      tipo_obra: 'Residencial',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      area_terreno: '',
      area_construida: '',
      numero_alvara: '',
      art_rrt: '',
      data_inicio: '',
      previsao_termino: '',
      equipe: [],
      estoque: []
    }
  });

  useEffect(() => {
    clearErrors();
  }, [step, clearErrors]);

  // Travar scroll do body enquanto o wizard estiver aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setValue('logradouro', data.logradouro);
        setValue('bairro', data.bairro);
        setValue('cidade', data.localidade);
        setValue('estado', data.uf);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingCep(false);
  };

  const nextStep = async () => {
    let isValid = true;
    if (step === 1) {
      clearErrors(['nome', 'tipo_obra', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado', 'area_terreno', 'area_construida', 'numero_alvara', 'art_rrt']);
      isValid = await trigger(['nome', 'tipo_obra', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado', 'area_terreno', 'area_construida', 'numero_alvara', 'art_rrt']);
    } else if (step === 2) {
      clearErrors(['data_inicio', 'previsao_termino']);
      isValid = await trigger(['data_inicio', 'previsao_termino']);
    }
    if (isValid) {
      setStep(s => s + 1);
    }
  };
  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        userId: currentUser.id_usuario || currentUser.id,
        valor_orcado: 0,
        area_terreno: parseFloat(data.area_terreno) || null,
        area_construida: parseFloat(data.area_construida) || null,
      };

      const res = await apiFetch(`${API_BASE_URL}/api/obras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Erro ao salvar obra');
      
      if (onSave) onSave();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar obra.', 'Erro');
    }
  };

  const onInvalid = (errors) => {
    toast.warning(
      'Existem campos pendentes ou inválidos: ' + Object.keys(errors).join(', '),
      'Formulário incompleto'
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Assistente de Nova Obra</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Etapa {step} de 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-md bg-transparent hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="wizard-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            
            {step === 1 && (
              <div className="animate-slide-up space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Nome do Empreendimento *</label>
                    <input {...register('nome', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className={inputClass} />
                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Tipo de Obra *</label>
                    <select {...register('tipo_obra', { required: 'Campo obrigatório' })} className={inputClass}>
                      <option value="">Selecione...</option>
                      <option value="Residencial">Residencial</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Infraestrutura">Infraestrutura</option>
                    </select>
                    {errors.tipo_obra && <p className="text-red-500 text-xs mt-1">{errors.tipo_obra.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className={labelClass}>CEP * {loadingCep && <span className="text-indigo-500 animate-pulse">(Buscando...)</span>}</label>
                    <input {...register('cep', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} onBlur={handleCepBlur} className={inputClass} />
                    {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Avenida / Rua *</label>
                    <input {...register('logradouro', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className={inputClass} />
                    {errors.logradouro && <p className="text-red-500 text-xs mt-1">{errors.logradouro.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className={labelClass}>Número *</label>
                    <input {...register('numero', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className={inputClass} />
                    {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Bairro *</label>
                    <input {...register('bairro', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className={inputClass} />
                    {errors.bairro && <p className="text-red-500 text-xs mt-1">{errors.bairro.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Cidade *</label>
                    <input {...register('cidade', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className={inputClass} />
                    {errors.cidade && <p className="text-red-500 text-xs mt-1">{errors.cidade.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>UF *</label>
                    <input {...register('estado', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} maxLength={2} className={`${inputClass} uppercase`} />
                    {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-border">
                  <div>
                    <label className={labelClass}>Terreno (m²) *</label>
                    <input type="number" step="0.01" {...register('area_terreno', { required: 'Campo obrigatório' })} className={inputClass} />
                    {errors.area_terreno && <p className="text-red-500 text-xs mt-1">{errors.area_terreno.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Construída (m²) *</label>
                    <input type="number" step="0.01" {...register('area_construida', { required: 'Campo obrigatório' })} className={inputClass} />
                    {errors.area_construida && <p className="text-red-500 text-xs mt-1">{errors.area_construida.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Nº Alvará *</label>
                    <input {...register('numero_alvara', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className={inputClass} />
                    {errors.numero_alvara && <p className="text-red-500 text-xs mt-1">{errors.numero_alvara.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>ART / RRT *</label>
                    <input {...register('art_rrt', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className={inputClass} />
                    {errors.art_rrt && <p className="text-red-500 text-xs mt-1">{errors.art_rrt.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-slide-up space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Início da Obra *</label>
                    <input type="date" {...register('data_inicio', { required: 'Campo obrigatório' })} className={inputClass} />
                    {errors.data_inicio && <p className="text-red-500 text-xs mt-1">{errors.data_inicio.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Previsão de Término *</label>
                    <input type="date" {...register('previsao_termino', { required: 'Campo obrigatório' })} className={inputClass} />
                    {errors.previsao_termino && <p className="text-red-500 text-xs mt-1">{errors.previsao_termino.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-slide-up space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-4">Adicionar Membros da Equipe</h4>
                  <EquipeSelection control={control} apiFetch={apiFetch} />
                </div>
              </div>
            )}

          </form>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/30">
          <Button variant="outline" size="sm" type="button" onClick={step === 1 ? onClose : prevStep} className="h-9">
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </Button>
          
          {step < 3 ? (
            <Button variant="primary" size="sm" type="button" onClick={nextStep} className="h-9">
              Avançar →
            </Button>
          ) : (
            <Button variant="primary" size="sm" type="submit" form="wizard-form" className="h-9 bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-sm">
              Concluir Cadastro
            </Button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}

/**
 * Sub-componente para seleção de equipe vinculada ao RH
 */
function EquipeSelection({ control, apiFetch }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRH = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/rh?limit=100`);
        if (res.ok) {
          const result = await res.json();
          setFuncionarios(result.data.filter(f => f.status === 'ATIVO'));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRH();
  }, [apiFetch]);

  return (
    <Controller
      name="equipe"
      control={control}
      render={({ field }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2">
          {loading ? (
            <div className="col-span-2 py-10 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
              <p className="text-xs text-muted-foreground">Sincronizando RH...</p>
            </div>
          ) : funcionarios.length === 0 ? (
            <div className="col-span-2 p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
               <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Nenhum funcionário ativo no RH. Cadastre-os primeiro no módulo de RH.</p>
            </div>
          ) : funcionarios.map(f => {
            const isSelected = field.value?.some(m => Number(m.id_usuario) === Number(f.id_usuario));
            return (
              <button
                key={f.id_usuario}
                type="button"
                onClick={() => {
                  const newValue = isSelected
                    ? field.value.filter(m => Number(m.id_usuario) !== Number(f.id_usuario))
                    : [...(field.value || []), { id_usuario: f.id_usuario, nome: f.nome, papel: f.cargo_base }];
                  field.onChange(newValue);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm' 
                    : 'bg-card border-border hover:border-primary text-foreground'
                }`}
              >
                <div className={`text-sm font-semibold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {f.nome}
                </div>
                <div className={`text-xs mt-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {f.matricula} • {f.cargo_base || 'Sem cargo'}
                </div>
              </button>
            );
          })}
        </div>
      )}
    />
  );
}

