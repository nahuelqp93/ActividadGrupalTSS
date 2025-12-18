
interface EnunciadoProps {
  titulo: string;
  descripcion: string;
  preguntas: string[];
  datos?: {
    label: string;
    valor: string | number;
  }[];
}

export default function Enunciado({ titulo, descripcion, preguntas, datos }: EnunciadoProps) {
  return (
    <div className="bg-linear-to from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">{titulo}</h2>
          <p className="text-gray-700 leading-relaxed">{descripcion}</p>
        </div>
      </div>

      {datos && datos.length > 0 && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3"> Datos del problema Inicial:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {datos.map((dato, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm text-gray-700">
                  <strong>{dato.label}:</strong> {dato.valor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <h3 className="font-semibold text-yellow-900 mb-2"> Preguntas a resolver:</h3>
        <ol className="list-decimal list-inside space-y-2">
          {preguntas.map((pregunta, idx) => (
            <li key={idx} className="text-gray-700 text-sm">
              {pregunta}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}