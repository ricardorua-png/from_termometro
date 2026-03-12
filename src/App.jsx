import { useState, useEffect } from "react";
import { Card, Button, InputNumber, Select } from "antd";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const API = import.meta.env.VITE_API_URL;

const preguntas = [
  { key: "ayudas", titulo: "🎁 Ayudas entregadas" }, 
  { key: "estudios", titulo: "📚 Estudios realizados" },
  { key: "folletos", titulo: "🎞 folletos entregados" },
  { key: "contactos", titulo: "📞 contactos alcanzados" },
  { key: "trabajadas", titulo: "👦 personas que oramos y trabajamos" },
  { key: "virtuales2", titulo: "📳 Estudios virtuales" },
];

function App() {
  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [valor, setValor] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [mostrarGraficas, setMostrarGraficas] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [iglesia, setIglesia] = useState(null);

  const iglesias = [
    "Iglesia Cartagena",
    "Iglesia Barranquilla",
    "Iglesia Bucaramanga",
    "Iglesia Villa del rosario",
    "Iglesia Carmen chucuri",
    "Iglesia valledupar",
    "Iglesia Santamarta",
  ];


  // ========================
  // 🎨activo
  // ========================
      useEffect(() => {
      const mantenerActivo = setInterval(() => {
        axios.get(API);
      }, 600000); // 10 minutos

  return () => clearInterval(mantenerActivo);
}, []);
  // ========================
  // 🎨 Animación fondo
  // ========================
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // ========================
  // 📤 Enviar respuestas
  // ========================
  const siguiente = async () => {
    if (!iglesia) {
      alert("Debe seleccionar una iglesia");
      return;
    }

    const pregunta = preguntas[pasoActual];

    const nuevasRespuestas = {
      ...respuestas,
      [pregunta.key]: valor,
    };

    setRespuestas(nuevasRespuestas);
    setValor(0);

    if (pasoActual === preguntas.length - 1) {
      const envioFinal = {
        ...nuevasRespuestas,
        iglesia,
        fecha: new Date(), // 🔥 IMPORTANTE
      };

      await axios.post(`${API}/`, envioFinal);

      setFinalizado(true);

      setTimeout(() => {
        setFinalizado(false);
        setMostrarGraficas(true);
        cargarDatos();
      }, 3000);
    } else {
      setPasoActual(pasoActual + 1);
    }
  };

  // ========================
  // 📥 Cargar datos
  // ========================
  const cargarDatos = async () => {
    const res = await axios.get(`${API}/`);
    setRegistros(res.data);
  };

  // ========================
  // 🔎 FILTRAR POR IGLESIA
  // ========================
  const registrosFiltrados = registros.filter(
    (r) => r.iglesia === iglesia
  );

  // ========================
  // 📊 CÁLCULO SEMANAL
  // ========================
  const hoy = new Date();
  const inicioSemana = new Date();
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const inicioSemanaPasada = new Date(inicioSemana);
  inicioSemanaPasada.setDate(inicioSemanaPasada.getDate() - 7);

  const semanaActual = registrosFiltrados.filter((r) => {
    const fecha = new Date(r.fecha);
    return fecha >= inicioSemana;
  });

  const semanaPasada = registrosFiltrados.filter((r) => {
    const fecha = new Date(r.fecha);
    return fecha >= inicioSemanaPasada && fecha < inicioSemana;
  });

  const sumar = (data, key) =>
    data.reduce((acc, item) => acc + Number(item[key] || 0), 0);

  const dataComparacion = preguntas.map((p) => ({
    name: p.titulo,
    actual: sumar(semanaActual, p.key),
    pasada: sumar(semanaPasada, p.key),
  }));

  // ========================
  // 📈 AGRUPAR POR MES
  // ========================
  const agruparPorMes = () => {
    const resumen = {};

    registrosFiltrados.forEach((r) => {
      if (!r.fecha) return;

      const fecha = new Date(r.fecha);
      const mes = fecha.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      });

      if (!resumen[mes]) {
        resumen[mes] = { mes };
        preguntas.forEach((p) => {
          resumen[mes][p.key] = 0;
        });
      }

      preguntas.forEach((p) => {
        resumen[mes][p.key] += Number(r[p.key] || 0);
      });
    });

    return Object.values(resumen);
  };

  const dataMes = agruparPorMes();

  // ========================
  // 🎨 ESTILOS
  // ========================
  const fondo = {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #ff6ec4, #7873f5, #4ADEDE)",
    backgroundSize: "300% 300%",
    animation: "gradientMove 8s ease infinite",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  };

  const glass = {
    backdropFilter: "blur(15px)",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "25px",
    padding: "40px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    width: "900px",
    color: "white",
    textAlign: "center",
  };

  // ========================
  // 🎉 GIF FINAL
  // ========================
  if (finalizado) {
    return (
      <div style={fondo}>
        <img
          src="https://cdn.pixabay.com/animation/2024/01/26/14/06/14-06-48-286_512.gif"
          style={{ width: 400 }}
        />
      </div>
    );
  }

  // ========================
  // 📊 GRÁFICAS
  // ========================
  if (mostrarGraficas) {
    return (
      <div style={fondo}>
        <div style={glass}>
          <h2>📍 {iglesia}</h2>
          <h2>📊 Comparación Semanal</h2>

          <BarChart width={700} height={300} data={dataComparacion}>
            <CartesianGrid stroke="rgba(255,255,255,0.2)" />
            <XAxis dataKey="name" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" fill="#ff4ecd" name="Semana Actual" />
            <Bar dataKey="pasada" fill="#00f2ff" name="Semana Pasada" />
          </BarChart>

          <h2 style={{ marginTop: 50 }}>📊 Totales por Mes</h2>

          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "800px" }}>
              <BarChart width={800} height={350} data={dataMes}>
                <CartesianGrid stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="mes" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                {preguntas.map((p, i) => (
                  <Bar
                    key={p.key}
                    dataKey={p.key}
                    fill={
                      [
                        "#ffe600",
                        "#ff4ecd",
                        "#00f2ff",
                        "#8aff00",
                        "#00ffe3",
                        "#ff00e3",
                        "#ff7f50",
                      ][i % 7]
                    }
                  />
                ))}
              </BarChart>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // 📝 FORMULARIO
  // ========================
  const preguntaActual = preguntas[pasoActual];

  return (
    <div style={fondo}>
      <div style={glass}>
        {!iglesia && (
          <>
            <h2>Seleccione la Iglesia</h2>
            <Select
              style={{ width: "100%", marginBottom: 20 }}
              placeholder="Seleccione una iglesia"
              onChange={(value) => setIglesia(value)}
              options={iglesias.map((ig) => ({
                label: ig,
                value: ig,
              }))}
            />
          </>
        )}

        {iglesia && (
          <>
            <h3>📍 {iglesia}</h3>
            <h2>{preguntaActual.titulo}</h2>

            <InputNumber
              min={0}
              value={valor}
              onChange={(v) => setValor(v)}
              style={{ width: "100%", marginTop: 20 }}
            />

            <Button
              type="primary"
              block
              style={{ marginTop: 20 }}
              onClick={siguiente}
            >
              {pasoActual === preguntas.length - 1
                ? "Finalizar"
                : "Siguiente"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
