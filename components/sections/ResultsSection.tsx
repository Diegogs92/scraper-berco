import ResultsTable from '../ResultsTable';

type Props = {
  onRefresh: () => void;
};

export default function ResultsSection({ onRefresh }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Resultados del Scraping</h2>
        <p className="text-white/70">
          Visualiza todos los productos scrapeados con sus precios y detalles
        </p>
      </div>

      <ResultsTable onRefresh={onRefresh} />
    </div>
  );
}
