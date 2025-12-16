import { useState } from "react";
import { Line } from "react-chartjs-2";
import { exponencialInversa } from "../../core/methods/exponencialInversa";

export default function TransformadaInversa() {

  const [lambda, setLambda] = useState(1);
  const resultado = exponencialInversa(lambda);

  // Datos para la gráfica
  const datosGrafica = {
    labels: Array.from({ length: 50 }, (_, i) => (i / 50).toFixed(2)),
    datasets: [
      {
        label: "x = F⁻¹(R)",
        data: Array.from({ length: 50 }, (_, i) =>
          resultado.generar(i / 50)
        ),
        borderWidth: 2
      }
    ]
  };

  return (
    <div>
      <h2>Transformada Inversa</h2>

      {/* Parámetros */}
      <label>λ (lambda): </label>
      <input
        type="number"
        step="0.1"
        value={lambda}
        onChange={e => setLambda(Number(e.target.value))}
      />

      <hr />

      {/* Pasos */}
      <h3>Resolución paso a paso</h3>
      {resultado.pasos.map((p, i) => (
        <div key={i}>
          <strong>{p.titulo}</strong>
          <p>{p.descripcion}</p>
        </div>
      ))}

      <hr />

      {/* Fórmula */}
      <h3>Fórmula inversa final</h3>
      <p><strong>{resultado.formula}</strong></p>

      <hr />

      {/* Gráfica */}
      <h3>Gráfica de la función inversa</h3>
      <Line data={datosGrafica} />
    </div>
  );
}
