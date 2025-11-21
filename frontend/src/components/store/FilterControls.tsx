// src/components/store/FilterControls.tsx
import Button from '../ui/Button';

export interface CosmeticFilters {
  search: string;
  type: string;
  rarity: string;
  isNew: boolean;
  isOnSale: boolean;
}

interface FilterControlsProps {
  value: CosmeticFilters;
  onChange: (next: CosmeticFilters) => void;
  onReset: () => void;
}

export default function FilterControls({ value, onChange, onReset }: FilterControlsProps) {
  const handleValueChange = (key: keyof CosmeticFilters, nextValue: string | boolean) => {
    onChange({ ...value, [key]: nextValue } as CosmeticFilters);
  };

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white/95 p-5 text-slate-900 shadow-sm">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="search-input">
          Buscar por nome
        </label>
        <input
          id="search-input"
          value={value.search}
          onChange={(e) => handleValueChange('search', e.target.value)}
          placeholder="Digite o nome do cosmético"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="type-select">
            Tipo
          </label>
          <select
            id="type-select"
            value={value.type}
            onChange={(e) => handleValueChange('type', e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <option value="">Todos</option>
            <option value="outfit">Trajes</option>
            <option value="backpack">Mochilas</option>
            <option value="pickaxe">Picaretas</option>
            <option value="glider">Planadores</option>
            <option value="emote">Emotes</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="rarity-select">
            Raridade
          </label>
          <select
            id="rarity-select"
            value={value.rarity}
            onChange={(e) => handleValueChange('rarity', e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <option value="">Todas</option>
            <option value="common">Comum</option>
            <option value="uncommon">Incomum</option>
            <option value="rare">Rara</option>
            <option value="epic">Épica</option>
            <option value="legendary">Lendária</option>
          </select>
        </div>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Destaques</legend>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={value.isOnSale}
            onChange={(e) => handleValueChange('isOnSale', e.target.checked)}
            className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          />
          À venda agora
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={value.isNew}
            onChange={(e) => handleValueChange('isNew', e.target.checked)}
            className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          />
          Novidades
        </label>
      </fieldset>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onReset}
          className="flex-1 border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        >
          Limpar filtros
        </Button>
        <Button
          type="button"
          onClick={() => onChange({ ...value })}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500"
        >
          Aplicar
        </Button>
      </div>
    </section>
  );
}
