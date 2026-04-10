export default function SidebarWidget() {
  return (
    <div
      className={
        "mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]"
      }
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Obra Integrada
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Painel de gestão de obras com controle de etapas, equipe e entregas.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Acompanhe cronogramas, ordens de serviço e materiais em um só lugar.
      </p>
    </div>
  );
}
