export default function Hero() {
  return (
    <section className="px-10 py-20 max-w-7xl mx-auto">

      <h1 className="text-5xl md:text-6xl font-bold leading-tight">
        Garantizando la{" "}
        <span className="text-red-500">
          Integridad
        </span>{" "}
        de la Democracia Colombiana
      </h1>

      <p className="mt-6 text-gray-600 max-w-xl">
        Tecnologia hibrida con custodia criptografica para elecciones transparentes, 
        seguras e inclusivas en todo el territorio nacional.
      </p>

      <div className="mt-8 flex gap-4">
        <button className="bg-red-500 text-white px-6 py-3 rounded-lg">
          Consultar mi Voto
        </button>

        <button className="border px-6 py-3 rounded-lg">
          Ver Resultados en Vivo
        </button>
      </div>

    </section>
  )
}