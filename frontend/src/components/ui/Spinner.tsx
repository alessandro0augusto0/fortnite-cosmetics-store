interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label = 'Carregando...' }: SpinnerProps = {}) {
  return (
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" aria-hidden />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
