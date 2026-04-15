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
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
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
      orcamento_material: 0,
      orcamento_mao_obra: 0,
      orcamento_taxas: 0,
      equipe: [],
      estoque: []
    }
  });

  const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({ control, name: "equipe" });
  const { fields: estoqueFields, append: appendEstoque, remove: removeEstoque } = useFieldArray({ control, name: "estoque" });

  const orcamento_material = watch('orcamento_material') || 0;
  const orcamento_mao_obra = watch('orcamento_mao_obra') || 0;
  const orcamento_taxas    = watch('orcamento_taxas') || 0;
  const orcamento_total    = orcamento_material + orcamento_mao_obra + orcamento_taxas;

  useEffect(() => {
    setLoadingUsers(true);
    apiFetch('http://localhost:5000/api/usuarios-disponiveis')
      .then(res => res.json())
      .then(data => setUsuariosDisponiveis(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [apiFetch]);

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
      clearErrors(['data_inicio', 'previsao_termino', 'orcamento_material', 'orcamento_mao_obra', 'orcamento_taxas']);
      isValid = await trigger(['data_inicio', 'previsao_termino', 'orcamento_material', 'orcamento_mao_obra', 'orcamento_taxas']);
    } else if (step === 3) {
      clearErrors('equipe');
      // Validar equipe (Mínimo 1 Responsável)
      const equipe = watch('equipe');
      const hasResponsavel = equipe.some(m => {
        const u = usuariosDisponiveis.find(usr => usr.id_usuario === Number(m.id_usuario));
        return u && (u.role === 'RESPONSAVEL' || u.funcao === 'Engenheiro');
      });
      if (!hasResponsavel && currentUser.role !== 'RESPONSAVEL') {
        setError('equipe', { message: 'A equipe precisa ter pelo menos um membro responsável (Engenheiro/Arquiteto).' });
        isValid = false;
      }
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
        valor_orcado: orcamento_total,
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-gray-800">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Assistente de Nova Obra</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Etapa {step} de 4
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-1 bg-slate-100 dark:bg-gray-800">
          <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="wizard-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
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

                <div className="bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 rounded-3xl p-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Composição de Custos Base</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Material de Construção *</p>
                      <div>
                        <Controller name="orcamento_material" control={control} rules={{ required: 'Campo obrigatório', validate: value => value > 0 || 'Valor deve ser maior que zero' }} render={({ field }) => (
                           <CurrencyInput {...field} className="w-48 text-right p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                        )} />
                        {errors.orcamento_material && <p className="text-red-500 text-xs mt-1">{errors.orcamento_material.message}</p>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center group">
                      <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Mão de Obra e Equipe *</p>
                      <div>
                        <Controller name="orcamento_mao_obra" control={control} rules={{ required: 'Campo obrigatório', validate: value => value > 0 || 'Valor deve ser maior que zero' }} render={({ field }) => (
                           <CurrencyInput {...field} className="w-48 text-right p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                        )} />
                        {errors.orcamento_mao_obra && <p className="text-red-500 text-xs mt-1">{errors.orcamento_mao_obra.message}</p>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center group">
                      <p className="text-sm font-bold text-slate-600 dark:text-gray-300">Taxas e Legalização *</p>
                      <div>
                        <Controller name="orcamento_taxas" control={control} rules={{ required: 'Campo obrigatório', validate: value => value > 0 || 'Valor deve ser maior que zero' }} render={({ field }) => (
                           <CurrencyInput {...field} className="w-48 text-right p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                        )} />
                        {errors.orcamento_taxas && <p className="text-red-500 text-xs mt-1">{errors.orcamento_taxas.message}</p>}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-gray-700 flex justify-between items-center">
                      <p className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Orçamento Total Planejado</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento_total)}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {step === 3 && (
              <div className="animate-slide-up space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-600 dark:text-gray-300 uppercase tracking-wider">Alocação de Equipe</h3>
                  <Button variant="outline" size="sm" type="button" onClick={() => appendEquipe({ id_usuario: '', valor_dia: 0 })}>
                    + Add Membro
                  </Button>
                </div>

                {equipeFields.length === 0 ? (
                  <div className="text-center p-10 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[2rem]">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhuma equipe selecionada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {equipeFields.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 bg-slate-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Colaborador</label>
                          <select {...register(`equipe.${index}.id_usuario`, { required: true })} className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold">
                            <option value="">Selecione...</option>
                            {usuariosDisponiveis.map(u => (
                              <option key={u.id_usuario} value={u.id_usuario}>
                                {u.nome} ({u.funcao || u.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Diária (R$)</label>
                          <Controller name={`equipe.${index}.valor_dia`} control={control} render={({ field }) => (
                            <CurrencyInput {...field} className="w-full text-right p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                          )} />
                        </div>
                        <button type="button" onClick={() => removeEquipe(index)} className="mt-5 w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.equipe && <p className="text-red-500 text-xs mt-4">{errors.equipe.message}</p>}
              </div>
            )}

            {step === 4 && (
              <div className="animate-slide-up space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-600 dark:text-gray-300 uppercase tracking-wider">Estoque Inicial</h3>
                  <Button variant="outline" size="sm" type="button" onClick={() => appendEstoque({ nome_material: '', unidade_medida: 'Unidade', quantidade_inicial: 1 })}>
                    + Add Insumo
                  </Button>
                </div>

                {estoqueFields.length === 0 ? (
                  <div className="text-center p-10 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[2rem]">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum estoque inicial</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {estoqueFields.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 bg-slate-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-slate-200 dark:border-gray-800">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Material</label>
                          <input {...register(`estoque.${index}.nome_material`, { required: true })} placeholder="Ex: Cimento CP-II" className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold" />
                        </div>
                        <div className="w-32">
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Unidade</label>
                          <select {...register(`estoque.${index}.unidade_medida`)} className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold">
                            <option value="Unidade">Un</option>
                            <option value="Saco">Saco</option>
                            <option value="m³">m³</option>
                            <option value="Metro">m</option>
                            <option value="kg">kg</option>
                            <option value="Litro">L</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Qtd</label>
                          <input type="number" step="0.1" {...register(`estoque.${index}.quantidade_inicial`, { required: true })} className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-sm font-bold text-center" />
                        </div>
                        <button type="button" onClick={() => removeEstoque(index)} className="mt-5 w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </form>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-900/50">
          <Button variant="outline" type="button" onClick={step === 1 ? onClose : prevStep} className="px-8 font-black uppercase tracking-widest text-[10px]">
            {step === 1 ? 'Cancelar' : '← Voltar'}
          </Button>
          
          {step < 4 ? (
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
