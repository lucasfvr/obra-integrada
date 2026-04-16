import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Button from '../ui/button/Button.tsx';

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

      const res = await apiFetch('http://localhost:5000/api/obras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Erro ao salvar obra');
      
      if (onSave) onSave();
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  const onInvalid = (errors) => {
    alert("Existem campos pendentes ou inválidos nas etapas anteriores: " + Object.keys(errors).join(', '));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-gray-800">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Assistente de Nova Obra</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Etapa {step} de 3
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1 bg-slate-100 dark:bg-gray-800">
          <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="wizard-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            
            {step === 1 && (
              <div className="animate-slide-up space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Nome do Empreendimento *</label>
                    <input {...register('nome', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Tipo de Obra *</label>
                    <select {...register('tipo_obra', { required: 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold">
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
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">CEP * {loadingCep && <span className="text-indigo-500 animate-pulse">(Buscando...)</span>}</label>
                    <input {...register('cep', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} onBlur={handleCepBlur} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Avenida / Rua *</label>
                    <input {...register('logradouro', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.logradouro && <p className="text-red-500 text-xs mt-1">{errors.logradouro.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Número *</label>
                    <input {...register('numero', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Bairro *</label>
                    <input {...register('bairro', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.bairro && <p className="text-red-500 text-xs mt-1">{errors.bairro.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Cidade *</label>
                    <input {...register('cidade', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.cidade && <p className="text-red-500 text-xs mt-1">{errors.cidade.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">UF *</label>
                    <input {...register('estado', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} maxLength={2} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold uppercase" />
                    {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-100 dark:border-gray-800">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Terreno (m²) *</label>
                    <input type="number" step="0.01" {...register('area_terreno', { required: 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.area_terreno && <p className="text-red-500 text-xs mt-1">{errors.area_terreno.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Construída (m²) *</label>
                    <input type="number" step="0.01" {...register('area_construida', { required: 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.area_construida && <p className="text-red-500 text-xs mt-1">{errors.area_construida.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Nº Alvará *</label>
                    <input {...register('numero_alvara', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.numero_alvara && <p className="text-red-500 text-xs mt-1">{errors.numero_alvara.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">ART / RRT *</label>
                    <input {...register('art_rrt', { required: 'Campo obrigatório', validate: value => value.trim() !== '' || 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.art_rrt && <p className="text-red-500 text-xs mt-1">{errors.art_rrt.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-slide-up space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Início da Obra *</label>
                    <input type="date" {...register('data_inicio', { required: 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.data_inicio && <p className="text-red-500 text-xs mt-1">{errors.data_inicio.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Previsão de Término *</label>
                    <input type="date" {...register('previsao_termino', { required: 'Campo obrigatório' })} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                    {errors.previsao_termino && <p className="text-red-500 text-xs mt-1">{errors.previsao_termino.message}</p>}
                  </div>
                </div>

              </div>
            )}

            {step === 3 && (
              <div className="animate-slide-up space-y-6">
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Adicionar Membros da Equipe</h4>
                  <EquipeSelection control={control} apiFetch={apiFetch} />
                </div>
              </div>
            )}

          </form>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/50">
          <Button variant="outline" type="button" onClick={step === 1 ? onClose : prevStep} className="px-8 font-black uppercase tracking-widest text-[10px]">
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </Button>
          
          {step < 3 ? (
            <Button variant="primary" type="button" onClick={nextStep} className="px-8 font-black uppercase tracking-widest text-[10px]">
              Avançar →
            </Button>
          ) : (
            <Button variant="primary" type="submit" form="wizard-form" className="px-8 bg-emerald-600 hover:bg-emerald-700 border-none font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/30">
              Concluir Cadastro
            </Button>
          )}
        </div>

      </div>
    </div>
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
        const res = await apiFetch('http://localhost:5000/api/rh?limit=100');
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
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando RH...</p>
            </div>
          ) : funcionarios.length === 0 ? (
            <div className="col-span-2 p-6 rounded-2xl bg-amber-50 border border-amber-100 text-center">
               <p className="text-xs font-bold text-amber-600">Nenhum funcionário ativo no RH. Cadastre-os primeiro no módulo de RH.</p>
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
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' 
                    : 'bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700 hover:border-indigo-200'
                }`}
              >
                <div className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-gray-100'}`}>
                  {f.nome}
                </div>
                <div className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
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

