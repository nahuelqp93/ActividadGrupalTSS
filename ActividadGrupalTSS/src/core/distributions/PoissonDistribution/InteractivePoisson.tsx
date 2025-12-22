import { BlockMath, InlineMath } from 'react-katex';

export const ExplicacionPoisson = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
        ¿De dónde sale la fórmula? (El Secreto)
      </h3>

      <div className="text-sm text-slate-600 space-y-4">
        <p>
          Mucha gente cree que la Poisson no usa la Transformada Inversa, pero en realidad este algoritmo 
          se basa en la <strong>Transformada Inversa de la Exponencial</strong>.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-bold text-blue-900 mb-2">La Lógica del "Reloj":</h4>
          <p>
            Imagina que estás contando cuántos clientes llegan en <strong>1 hora</strong>.
            El tiempo entre la llegada de un cliente y el siguiente sigue una <strong>Distribución Exponencial</strong>.
          </p>
        </div>

        <div>
          <p className="font-semibold text-slate-800 mb-2">Paso 1: Generar tiempos de espera</p>
          <p>
            Usando la transformada inversa para la exponencial, el tiempo <InlineMath math="t" /> que tarda en llegar un cliente es:
          </p>
          <BlockMath math="t = - \frac{1}{\lambda} \ln(R)" />
        </div>

        <div>
          <p className="font-semibold text-slate-800 mb-2">Paso 2: Sumar tiempos hasta llenar la hora</p>
          <p>
            Sumamos estos tiempos (<InlineMath math="t_1 + t_2 + ..." />) hasta que la suma supere <strong>1</strong> (la unidad de tiempo).
            Matemáticamente:
          </p>
          <BlockMath math="\sum - \frac{1}{\lambda} \ln(R_i) > 1" />
        </div>

        <div>
          <p className="font-semibold text-slate-800 mb-2">Paso 3: Simplificar (Magia Algebraica)</p>
          <p>
            Para que la computadora no calcule tantos logaritmos (que son lentos), aplicamos álgebra para despejar:
          </p>
          <div className="pl-4 border-l-2 border-slate-300 my-2 italic">
            <p>1. Sacamos el factor común y pasamos <InlineMath math="-\lambda" /> al otro lado:</p>
            <BlockMath math="\sum \ln(R_i) < -\lambda" />
            <p>2. La suma de logaritmos es el logaritmo del producto:</p>
            <BlockMath math="\ln(R_1 \cdot R_2 \cdot R_3 \dots) < -\lambda" />
            <p>3. Eliminamos el logaritmo aplicando exponencial a ambos lados:</p>
            <BlockMath math="R_1 \cdot R_2 \cdot R_3 \dots < e^{-\lambda}" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-900 font-bold">¡Y esta es la fórmula del código!</p>
          <p>
            Multiplicamos números aleatorios (<InlineMath math="p *= R" />) hasta que el producto sea menor que 
            <InlineMath math="e^{-\lambda}" />. La cantidad de multiplicaciones es tu variable Poisson.
          </p>
        </div>
      </div>
    </div>
  );
};