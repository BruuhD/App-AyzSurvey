import { enviarEncuestaAPI } from "@/src/api/service";
import { C, styles } from "@/src/styles/guardadoStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system/legacy';
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const STORAGE_ENCUESTAS = "AYZ-encuestas";
const STORAGE_DNI       = "AYZ-user";
const STORAGE_RUTAS     = "AYZ-data-ruting";
const STORAGE_RUTAS_AUX = "AYZ-rutas-aux";
const STORAGE_EDIT      = "AYZ-edit";

interface RespuestaItem {
  NROPREGUNTA: number;
  TXTRESULTADO: string;
}

interface EncuestaPayload {
  IDENCUESTA: number;
  CODIGOPK: string;
  DNI_ENCUESTADOR: string;
  FLAG_TERMINADO: "SI" | "NO";
  FECHA_INICIO: string;
  FECHA_FIN: string | null;
  DURACION_MIN: number | null;
  LATITUD: number | null;
  LONGITUD: number | null;
  LATITUD2: number | null;
  LONGITUD2: number | null;
  LATITUD3: number | null;
  LONGITUD3: number | null;
  RESPUESTAS: RespuestaItem[];
  RESPUESTAS_TEXTO?: { [key: number]: string };
  PREGUNTAS_TEXTO?: { [key: number]: string }
}

interface Rutas {
  DNI_ENCUESTADOR: string;
  NRORUTA: number;
  DIRECCION: string;
  PROVINCIA: string;
  DISTRITO: string;
  ESTADO: string;
  LATITUD: number;
  LONGITUD: number;
  IDENCUESTA: number;
  CODCLIENTE: string;
  IDCODTIPO: number;
  CODIGOPK: string;
}

interface RutasOrigin {
  DNI_ENCUESTADOR: string;
  NRORUTA: number;
  DIRECCION: string;
  PROVINCIA: string;
  DISTRITO: string;
  ESTADO: string;
  LATITUD: number;
  LONGITUD: number;
  IDENCUESTA: number;
  CODCLIENTE: string;
  IDCODTIPO: number;
}

const PESO_RESPUESTA_KB = 0.5;

function DonaChart({ total, listas, pendientes }: { total: number; listas: number; pendientes: number }) {
  const size   = 100;
  const cx     = size / 2;
  const cy     = size / 2;
  const r      = 36;
  const stroke = 14;
  const circum = 2 * Math.PI * r;

  const pListas    = total > 0 ? listas / total : 0;
  const pPendiente = total > 0 ? pendientes / total : 0;

  // Arco listas (verde) — empieza en -90°
  const dashListas    = circum * pListas;
  const offsetListas  = 0;

  // Arco pendientes (ámbar) — empieza donde termina listas
  const dashPend   = circum * pPendiente;
  const offsetPend = -(circum * pListas);

  // Si no hay encuestas mostramos anillo gris
  const sinData = total === 0;

  return (
    <Svg width={size} height={size}>
      {/* Anillo base */}
      <Circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={stroke}
      />
      {sinData ? null : (
        <G rotation="-90" origin={`${cx},${cy}`}>
          {/* Listas — verde */}
          {listas > 0 && (
            <Circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="#34d399"
              strokeWidth={stroke}
              strokeDasharray={`${dashListas} ${circum}`}
              strokeDashoffset={offsetListas}
              strokeLinecap="butt"
            />
          )}
          {/* Pendientes — ámbar */}
          {pendientes > 0 && (
            <Circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={stroke}
              strokeDasharray={`${dashPend} ${circum}`}
              strokeDashoffset={offsetPend}
              strokeLinecap="butt"
            />
          )}
        </G>
      )}
      {/* Texto central */}
      <SvgText
        x={cx} y={cy - 6}
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontWeight="900"
      >
        {total}
      </SvgText>
      <SvgText
        x={cx} y={cy + 10}
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize="9"
        fontWeight="600"
      >
        TOTAL
      </SvgText>
    </Svg>
  );
}

function GaugeChart({ porcentaje, alerta }: { porcentaje: number; alerta: boolean }) {
  const w    = 110;
  const h    = 65;
  const cx   = w / 2;
  const cy   = h - 8;
  const r    = 46;
  const sw   = 12;

  // Semicírculo: de 180° a 0° (izq a der)
  // Path del arco de fondo
  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  // Arco de relleno según porcentaje (0–100 → 0°–180°)
  const ang   = Math.min(porcentaje, 100) / 100 * Math.PI; // radianes
  const endX  = cx + r * Math.cos(Math.PI - ang);
  const endY  = cy - r * Math.sin(ang);
  const large = ang > Math.PI / 2 ? 1 : 0;
  const fillPath = `M ${cx - r} ${cy} A ${r} ${r} 0 ${large} 1 ${endX} ${endY}`;

  const color = alerta ? "#f87171" : "#22d3ee";

  return (
    <Svg width={w} height={h}>
      {/* Fondo arco */}
      <Path
        d={bgPath}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Relleno */}
      <Path
        d={fillPath}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* Porcentaje */}
      <SvgText
        x={cx} y={cy - 4}
        textAnchor="middle"
        fill="white"
        fontSize="15"
        fontWeight="900"
      >
        {Math.round(porcentaje)}%
      </SvgText>
    </Svg>
  );
}

export default function EncuestaGuardada() {
  const [encuestas, setEncuestas]           = useState<EncuestaPayload[]>([]);
  const [rutasGuardadas, setRutasGuardadas] = useState<Rutas[]>([]);
  const [loading, setLoading]               = useState(false);
  const [enviando, setEnviando]             = useState(0);
  const [totalEnvio, setTotalEnvio]         = useState(0);
  const [espacioUsado, setEspacioUsado]     = useState(0);
  const [espacioTotal, setEspacioTotal]     = useState(0);
  const [expandido, setExpandido]           = useState<string | null>(null);

  const [modalResultado, setModalResultado] = useState(false);
  const [resultadoExito, setResultadoExito] = useState(false);
  const [resultadoMsg, setResultadoMsg]     = useState('');
  const [modalObteniendo, setModalObteniendo] = useState(false);

  const [modalDistancia, setModalDistancia] = useState(false);
  const [distanciaActual, setDistanciaActual] = useState(0);

  const [modalSinGPSEditar, setModalSinGPSEditar] = useState(false);

  const animsRef = useRef<{ [key: string]: Animated.Value }>({});
  const getAnim  = (key: string) => {
    if (!animsRef.current[key]) animsRef.current[key] = new Animated.Value(0);
    return animsRef.current[key];
  };

  const [modalPreview, setModalPreview]         = useState(false);
  const [encuestaPreview, setEncuestaPreview]   = useState<EncuestaPayload | null>(null);

  const abrirPreview = async (enc: EncuestaPayload) => {
    const preguntasStr = await AsyncStorage.getItem("AYZ-preguntas");
    const preguntas: { NROPREGUNTA: number; TEXTOPREGUNTA: string }[] = preguntasStr ? JSON.parse(preguntasStr) : [];
    const mapa: { [key: number]: string } = {};
    preguntas.forEach(p => { mapa[p.NROPREGUNTA] = p.TEXTOPREGUNTA; });
    setEncuestaPreview({ ...enc, PREGUNTAS_TEXTO: mapa });
    setModalPreview(true);
  };

  useEffect(() => {
    cargarData();
    calcularEspacio();
  }, []);

  const cargarData = async () => {
    try {
      const data      = await AsyncStorage.getItem(STORAGE_ENCUESTAS);
      const dataRutas = await AsyncStorage.getItem(STORAGE_RUTAS_AUX);
      if (data)      setEncuestas(JSON.parse(data));
      if (dataRutas) setRutasGuardadas(JSON.parse(dataRutas));
    } catch (e) { console.error(e); }
  };

  const calcularEspacio = async () => {
    try {
      const info  = await FileSystem.getFreeDiskStorageAsync();
      const total = await FileSystem.getTotalDiskCapacityAsync();
      setEspacioUsado(total - info);
      setEspacioTotal(total);
    } catch {}
  };

  const pesoEncuestaKB = (e: EncuestaPayload) => Math.round(e.RESPUESTAS.length * PESO_RESPUESTA_KB * 10) / 10;
  const pesoTotalKB    = encuestas.reduce((acc, e) => acc + pesoEncuestaKB(e), 0);
  const finalizadas    = encuestas.filter((e) => e.FLAG_TERMINADO === "SI");
  const pendientes     = encuestas.filter((e) => e.FLAG_TERMINADO === "NO");
  const porcEspacio    = espacioTotal > 0 ? (espacioUsado / espacioTotal) * 100 : 0;
  const alertaEspacio  = porcEspacio > 85;

  const toggleExpandido = (codigopk: string) => {
    const anim = getAnim(codigopk);
    if (expandido === codigopk) {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      setExpandido(null);
    } else {
      if (expandido) {
        Animated.timing(getAnim(expandido), { toValue: 0, duration: 150, useNativeDriver: false }).start();
      }
      setExpandido(codigopk);
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: false }).start();
    }
  };

  const calcularDistanciaMetros = (
    lat1: number, lng1: number,
    lat3: number, lng3: number
  ): number => {
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat3 - lat1);
    const dLng = toRad(lng3 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat3)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(a)));
  };

  const construirPayloadEnvio = (enc: EncuestaPayload) => {
    const { RESPUESTAS_TEXTO, ...encSinTexto } = enc;
    const diffMin = (enc.FECHA_INICIO && enc.FECHA_FIN)
      ? Math.round((new Date(enc.FECHA_FIN).getTime() - new Date(enc.FECHA_INICIO).getTime()) / 60000)
      : null;
    const distancia = (enc.LATITUD !== null && enc.LATITUD3 !== null)
      ? calcularDistanciaMetros(enc.LATITUD, enc.LONGITUD!, enc.LATITUD3, enc.LONGITUD3!)
      : null;
    return {
      ...encSinTexto,
      DURACION_MIN:     diffMin,
      LATITUD_FIN:      enc.LATITUD3,
      LONGITUD_FIN:     enc.LONGITUD3,
      DISTANCIA_METROS: distancia,
    };
  };

  const eliminarEncuesta = async (codigopk: string) => {
    const nuevas = encuestas.filter((e) => e.CODIGOPK !== codigopk);
    setEncuestas(nuevas);
    await AsyncStorage.setItem(STORAGE_ENCUESTAS, JSON.stringify(nuevas));
    const enc = encuestas.find((e) => e.CODIGOPK === codigopk);
    if (enc?.FLAG_TERMINADO === "NO") await devolverRuta(codigopk);
    const rutasNuevas = rutasGuardadas.filter((r) => r.CODIGOPK !== codigopk);
    setRutasGuardadas(rutasNuevas);
    await AsyncStorage.setItem(STORAGE_RUTAS_AUX, JSON.stringify(rutasNuevas));
  };

  const devolverRuta = async (codigopk: string) => {
    const ruta = rutasGuardadas.find((r) => r.CODIGOPK === codigopk);
    if (!ruta) return;
    const { CODIGOPK, ...rutaSinPK } = ruta;
    const rutasStr = await AsyncStorage.getItem(STORAGE_RUTAS);
    const rutas: RutasOrigin[] = rutasStr ? JSON.parse(rutasStr) : [];
    rutas.push(rutaSinPK);
    await AsyncStorage.setItem(STORAGE_RUTAS, JSON.stringify(rutas));
  };

  const confirmarEliminar = (codigopk: string) =>
    Alert.alert("Borrar encuesta", "¿Seguro? Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Borrar", style: "destructive", onPress: () => eliminarEncuesta(codigopk) },
    ]);

  const enviarEncuesta = async (enc: EncuestaPayload) => {
    setLoading(true);
    setTotalEnvio(0);
    try {
      const payload = construirPayloadEnvio(enc);
      const exito = await enviarEncuestaAPI(payload);
      if (exito) {
        await eliminarEncuesta(enc.CODIGOPK);
        setResultadoExito(true);
        setResultadoMsg("La encuesta fue enviada y registrada correctamente en el servidor.");
      } else {
        setResultadoExito(false);
        setResultadoMsg("No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.");
      }
    } finally {
      setLoading(false);
      setModalResultado(true);
    }
  };

  const enviarTodas = () =>
    Alert.alert(
      "Enviar todas",
      `Se enviarán ${finalizadas.length} encuesta(s) finalizadas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            setLoading(true);
            setTotalEnvio(finalizadas.length);
            setEnviando(0);
            let ok = 0;
            for (const enc of finalizadas) {
              const payload = construirPayloadEnvio(enc);
              console.log("Enviando encuesta:", enc.CODIGOPK);
              const exito = await enviarEncuestaAPI(payload);
              if (exito) {
                ok++;
                setEnviando(ok);
                await eliminarEncuesta(enc.CODIGOPK);
              }
            }
            setLoading(false);
            setResultadoExito(ok === finalizadas.length);
            setResultadoMsg(
              ok === finalizadas.length
                ? `Se enviaron las ${ok} encuesta${ok !== 1 ? "s" : ""} correctamente.`
                : `Se enviaron ${ok} de ${finalizadas.length} encuestas. ${finalizadas.length - ok} fallaron.`
            );
            setModalResultado(true);
          },
        },
      ]
    );

  const editarEncuesta = (enc: EncuestaPayload) =>
    Alert.alert("Editar encuesta", "Se quitará de guardadas y podrás continuarla.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Continuar",
        style: "destructive",
        /* onPress: async () => {
          setModalObteniendo(true);

          let lat2: number | null = null;
          let lng2: number | null = null;
          let puedeEditar = true;

          try {
            const { status } = await Location.getForegroundPermissionsAsync();
            const permisoOk = status === 'granted' || 
              (await Location.requestForegroundPermissionsAsync()).status === 'granted';

            if (permisoOk) {
              const provider = await Location.getProviderStatusAsync();
              if (provider.locationServicesEnabled) {
                const location = await Promise.race([
                  Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
                  new Promise<never>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000)),
                ]);
                lat2 = location.coords.latitude;
                lng2 = location.coords.longitude;
              }
            }
          } catch {}

          setModalObteniendo(false);

          if (lat2 === null || lng2 === null) {
            setModalSinGPSEditar(true);
            return;
          }

          // Validar distancia
          if (enc.LATITUD !== null && enc.LONGITUD !== null) {
            const distancia = calcularDistanciaMetros(enc.LATITUD, enc.LONGITUD, lat2, lng2);
            if (distancia > 500) {
              setDistanciaActual(distancia);
              setModalDistancia(true);
              return;
            }
          }

          // Proceder con edición
          const nuevas = encuestas.filter((e) => e.CODIGOPK !== enc.CODIGOPK);
          setEncuestas(nuevas);
          await AsyncStorage.setItem(STORAGE_ENCUESTAS, JSON.stringify(nuevas));
          await AsyncStorage.setItem(STORAGE_EDIT, "editar");
          await AsyncStorage.setItem("AYZ-respuestas-aux", JSON.stringify(enc));
          const ruta = rutasGuardadas.find((r) => r.CODIGOPK === enc.CODIGOPK);
          if (ruta) {
            const { CODIGOPK, ...rutaSinPK } = ruta;
            const rutasStr = await AsyncStorage.getItem(STORAGE_RUTAS);
            const rutas: RutasOrigin[] = rutasStr ? JSON.parse(rutasStr) : [];
            rutas.push(rutaSinPK);
            await AsyncStorage.setItem(STORAGE_RUTAS, JSON.stringify(rutas));
            router.push({ pathname: "/encuesta/encuesta", params: { id: String(enc.IDENCUESTA), lat: String(enc.LATITUD), lng: String(enc.LONGITUD) } });
          } else {
            router.push({ pathname: "/encuesta/encuesta", params: { id: String(enc.IDENCUESTA) } });
          }
        }, */
        onPress: async () => {
          const nuevas = encuestas.filter((e) => e.CODIGOPK !== enc.CODIGOPK);
          setEncuestas(nuevas);
          await AsyncStorage.setItem(STORAGE_ENCUESTAS, JSON.stringify(nuevas));
          await AsyncStorage.setItem(STORAGE_EDIT, "editar");
          await AsyncStorage.setItem("AYZ-respuestas-aux", JSON.stringify(enc));
          const ruta = rutasGuardadas.find((r) => r.CODIGOPK === enc.CODIGOPK);
          if (ruta) {
            const { CODIGOPK, ...rutaSinPK } = ruta;
            const rutasStr = await AsyncStorage.getItem(STORAGE_RUTAS);
            const rutas: RutasOrigin[] = rutasStr ? JSON.parse(rutasStr) : [];
            rutas.push(rutaSinPK);
            await AsyncStorage.setItem(STORAGE_RUTAS, JSON.stringify(rutas));
            router.push({ pathname: "/encuesta/encuesta", params: { id: String(enc.IDENCUESTA), lat: String(enc.LATITUD), lng: String(enc.LONGITUD) } });
          } else {
            router.push({ pathname: "/encuesta/encuesta", params: { id: String(enc.IDENCUESTA) } });
          }
        },
      },
    ]);

  const compartirCSV = async (enc: EncuestaPayload) => {
    const dni = (await AsyncStorage.getItem(STORAGE_DNI)) ?? "";
    let csv = "IDENCUESTA,CODIGOPK,NROPREGUNTA,TXTRESULTADO,LATITUD,LONGITUD\n";
    enc.RESPUESTAS.forEach((r) => {
      csv += `${enc.IDENCUESTA},${enc.CODIGOPK},${r.NROPREGUNTA},${r.TXTRESULTADO},${enc.LATITUD ?? ""},${enc.LONGITUD ?? ""}\n`;
    });
    const uri = FileSystem.documentDirectory + `${dni}_${enc.CODIGOPK}.csv`;
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(uri);
  };

  const salir = () => router.replace("/home/home");

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return "-";
    const [datePart, timePart] = fecha.split(" ");
    if (!datePart) return fecha;
    const [y, m, d] = datePart.split("-");
    const hora = timePart ? timePart.substring(0, 5) : "";
    return `${d}/${m}/${y}${hora ? " " + hora : ""}`;
  };

  const renderEncuesta = (item: EncuestaPayload, index: number) => {
    const finalizada = item.FLAG_TERMINADO === "SI";
    const isOpen     = expandido === item.CODIGOPK;
    const ruta       = rutasGuardadas.find((r) => r.CODIGOPK === item.CODIGOPK);
    const bordeColor = finalizada ? C.green : C.amber;
    const badgeBg    = finalizada ? C.greenLight : C.amberLight;
    const badgeColor = finalizada ? C.green : C.amber;
    const anim       = getAnim(item.CODIGOPK);

    const accionesHeight = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 66],
    });

    return (
      <View key={item.CODIGOPK} style={styles.encuestaCard}>
        <View style={[styles.encuestaCardBorde, { backgroundColor: bordeColor }]} />
        <TouchableOpacity
          style={styles.encuestaCardInner}
          onPress={() => toggleExpandido(item.CODIGOPK)}
          activeOpacity={0.7}
        >
          <View style={styles.encuestaCardLeft}>
            <View style={styles.encuestaCardTopRow}>
              <Text style={styles.encuestaNroTexto}>#{index + 1} · E{item.IDENCUESTA}</Text>
              <View style={[styles.badgeEstado, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeEstadoTexto, { color: badgeColor }]}>
                  {finalizada ? "COMPLETA" : "PENDIENTE"}
                </Text>
              </View>
            </View>
            <Text style={styles.encuestaCodigo} numberOfLines={1}>{item.CODIGOPK}</Text>
            <View style={styles.encuestaMetaRow}>
              <View style={styles.encuestaMetaItem}>
                <Icon name="schedule" color={C.grisOscuro} size={11} />
                <Text style={styles.encuestaMetaTexto}>{formatFecha(item.FECHA_INICIO)}</Text>
              </View>
              <View style={styles.encuestaMetaItem}>
                <Icon name="help-outline" color={C.grisOscuro} size={11} />
                <Text style={styles.encuestaMetaTexto}>{item.RESPUESTAS.length} resp.</Text>
              </View>
              {ruta && (
                <View style={styles.encuestaMetaItem}>
                  <Icon name="place" color={C.grisOscuro} size={11} />
                  <Text style={styles.encuestaMetaTexto}>{ruta.CODCLIENTE}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.encuestaCardRight}>
            <Icon
              name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              color={C.grisOscuro}
              size={22}
            />
          </View>
        </TouchableOpacity>

        <Animated.View style={{ height: accionesHeight, overflow: "hidden" }}>
          <View style={styles.accionesContainer}>
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: C.navy }]}
              onPress={() => abrirPreview(item)}
            >
              <Icon name="visibility" color="white" size={15} />
              <Text style={styles.botonAccionTexto}>Ver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: C.red }]}
              onPress={() => confirmarEliminar(item.CODIGOPK)}
            >
              <Icon name="delete-outline" color="white" size={15} />
              <Text style={styles.botonAccionTexto}>Borrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: finalizada ? C.grisOscuro : C.teal }]}
              onPress={() => editarEncuesta(item)}
              disabled={finalizada}
            >
              <Icon name="edit" color="white" size={15} />
              <Text style={styles.botonAccionTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: finalizada ? C.green : C.grisOscuro }]}
              onPress={() => enviarEncuesta(item)}
              disabled={!finalizada}
            >
              <Icon name="send" color="white" size={15} />
              <Text style={styles.botonAccionTexto}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botonAccion, { backgroundColor: finalizada ? C.navy : C.grisOscuro }]}
              onPress={() => compartirCSV(item)}
              disabled={!finalizada}
            >
              <Icon name="share" color="white" size={15} />
              <Text style={styles.botonAccionTexto}>CSV</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.bodyArea}>

        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={C.navy} />
              <Text style={styles.loadingTitulo}>Enviando encuestas</Text>
              {totalEnvio > 0 && (
                <>
                  <Text style={styles.loadingSubtitulo}>{enviando} de {totalEnvio} completadas</Text>
                  <View style={styles.loadingBarraBg}>
                    <View style={[styles.loadingBarraFill, { width: `${Math.round((enviando / totalEnvio) * 100)}%` }]} />
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* ── Header oscuro ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitulo}>Encuestas</Text>
              <Text style={styles.headerSubtitulo}>~{pesoTotalKB.toFixed(1)} KB en almacenamiento local</Text>
            </View>
            <TouchableOpacity style={styles.botonCerrar} onPress={salir}>
              <Icon name="close" color="white" size={20} />
            </TouchableOpacity>
          </View>

          {/* ── Dashboard: dona + gauge ── */}
          <View style={styles.dashRow}>
            {/* Dona — distribución de encuestas */}
            <View style={styles.donaContainer}>
              <Text style={styles.donaLabel}>Encuestas</Text>
              <DonaChart
                total={encuestas.length}
                listas={finalizadas.length}
                pendientes={pendientes.length}
              />
              <View style={styles.donaLeyenda}>
                <View style={styles.donaLeyendaItem}>
                  <View style={[styles.donaLeyendaDot, { backgroundColor: "#34d399" }]} />
                  <Text style={styles.donaLeyendaTexto}>Completas</Text>
                  <Text style={styles.donaLeyendaNum}>{finalizadas.length}</Text>
                </View>
                <View style={styles.donaLeyendaItem}>
                  <View style={[styles.donaLeyendaDot, { backgroundColor: "#fbbf24" }]} />
                  <Text style={styles.donaLeyendaTexto}>Pendientes</Text>
                  <Text style={styles.donaLeyendaNum}>{pendientes.length}</Text>
                </View>
              </View>
            </View>

            {/* Gauge — almacenamiento */}
            <View style={styles.gaugeContainer}>
              <Text style={styles.gaugeLabel}>Almacenamiento</Text>
              <GaugeChart porcentaje={porcEspacio} alerta={alertaEspacio} />
              <View style={styles.gaugeSubInfo}>
                <View style={styles.gaugeSubRow}>
                  <Text style={styles.gaugeSubTexto}>Usado</Text>
                  <Text style={styles.gaugeSubValor}>{formatBytes(espacioUsado)}</Text>
                </View>
                <View style={styles.gaugeSubRow}>
                  <Text style={styles.gaugeSubTexto}>Total</Text>
                  <Text style={styles.gaugeSubValor}>{formatBytes(espacioTotal)}</Text>
                </View>
              </View>
              {alertaEspacio && (
                <View style={styles.gaugeAlerta}>
                  <Icon name="warning" color="#fca5a5" size={11} />
                  <Text style={styles.gaugeAlertaTexto}>Espacio crítico</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Botón enviar todas */}
          <TouchableOpacity
            style={[
              styles.botonEnviarTodas,
              {
                backgroundColor: finalizadas.length > 0 ? C.green : C.grisOscuro,
                shadowColor: finalizadas.length > 0 ? C.green : "transparent",
              },
            ]}
            onPress={enviarTodas}
            disabled={finalizadas.length === 0}
          >
            <Icon name="cloud-upload" color="white" size={20} />
            <Text style={styles.botonEnviarTodasTexto}>
              {finalizadas.length > 0
                ? `Enviar ${finalizadas.length} finalizada${finalizadas.length !== 1 ? "s" : ""}`
                : "Sin encuestas para enviar"}
            </Text>
          </TouchableOpacity>

          {/* Lista */}
          {encuestas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Icon name="inbox" color={C.grisOscuro} size={36} />
              </View>
              <Text style={styles.emptyTitulo}>Sin encuestas guardadas</Text>
              <Text style={styles.emptySubtitulo}>
                Las encuestas guardadas o pausadas{"\n"}aparecerán aquí
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.seccionLabel}>Registros ({encuestas.length})</Text>
              {encuestas.map((enc, index) => renderEncuesta(enc, index))}
            </>
          )}
        </ScrollView>

        {/* Modal resultado envío individual */}
        <Modal
          transparent
          visible={modalResultado}
          animationType="fade"
          onRequestClose={() => setModalResultado(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <View style={{
              backgroundColor: C.blanco,
              borderRadius: 24,
              padding: 28,
              width: "85%",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 10,
            }}>
              {/* Ícono animado */}
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: resultadoExito ? C.greenLight : C.redLight,
                alignItems: "center", justifyContent: "center",
                marginBottom: 18,
              }}>
                <Icon
                  name={resultadoExito ? "check-circle" : "error-outline"}
                  color={resultadoExito ? C.green : C.red}
                  size={40}
                />
              </View>

              {/* Título */}
              <Text style={{
                fontSize: 20, fontWeight: "900",
                color: C.texto, marginBottom: 8, textAlign: "center",
                letterSpacing: -0.3,
              }}>
                {resultadoExito ? "¡Enviada!" : "Error al enviar"}
              </Text>

              {/* Mensaje */}
              <Text style={{
                fontSize: 13, color: C.textoSuave,
                textAlign: "center", lineHeight: 20, marginBottom: 24,
              }}>
                {resultadoMsg}
              </Text>

              {/* Separador */}
              <View style={{ width: "100%", height: 1, backgroundColor: C.grisMedio, marginBottom: 16 }} />

              {/* Botón */}
              <TouchableOpacity
                style={{
                  backgroundColor: resultadoExito ? C.green : C.navy,
                  width: "100%", height: 48,
                  borderRadius: 14,
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 8,
                }}
                onPress={() => setModalResultado(false)}
              >
                <Icon name={resultadoExito ? "check" : "refresh"} color="white" size={18} />
                <Text style={{ color: C.blanco, fontWeight: "800", fontSize: 15 }}>
                  {resultadoExito ? "Perfecto" : "Entendido"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          visible={modalPreview}
          animationType="slide"
          onRequestClose={() => setModalPreview(false)}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{
              backgroundColor: C.gris,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "85%",
              paddingBottom: 32,
            }}>
              {/* Header del modal */}
              <View style={{
                backgroundColor: C.navy,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <View>
                  <Text style={{ color: C.blanco, fontWeight: "900", fontSize: 16 }}>
                    Previsualización
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 }}>
                    {encuestaPreview?.RESPUESTAS.length ?? 0} respuestas · {encuestaPreview?.FLAG_TERMINADO === "SI" ? "Completa" : "Pendiente"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalPreview(false)}
                  style={{
                    width: 34, height: 34, borderRadius: 17,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon name="close" color="white" size={18} />
                </TouchableOpacity>
              </View>

              {/* Lista de respuestas */}
              <ScrollView
                contentContainerStyle={{ padding: 16, gap: 10 }}
                showsVerticalScrollIndicator={false}
              >
                {encuestaPreview?.RESPUESTAS.map((r, i) => (
                  <View key={i} style={{
                    backgroundColor: C.blanco,
                    borderRadius: 12,
                    padding: 14,
                    borderLeftWidth: 3,
                    borderLeftColor: r.TXTRESULTADO ? C.green : C.grisMedio,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 3,
                    elevation: 1,
                  }}>
                    <Text style={{
                      fontSize: 10, fontWeight: "700",
                      color: C.grisOscuro, textTransform: "uppercase",
                      letterSpacing: 0.5, marginBottom: 4,
                    }}>
                      #{r.NROPREGUNTA} · {encuestaPreview?.PREGUNTAS_TEXTO?.[r.NROPREGUNTA] ?? ""}
                    </Text>
                    <Text style={{
                      fontSize: 14, fontWeight: "600",
                      color: r.TXTRESULTADO ? C.texto : C.grisOscuro,
                    }}>
                      {(encuestaPreview?.RESPUESTAS_TEXTO?.[r.NROPREGUNTA] ?? r.TXTRESULTADO) || "Sin respuesta"}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          visible={modalObteniendo}
          animationType="fade"
        >
          <View style={{
            flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center", alignItems: "center",
          }}>
            <View style={{
              backgroundColor: C.blanco, borderRadius: 20,
              padding: 28, width: "75%", alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
            }}>
              <ActivityIndicator size="large" color={C.navy} />
              <Text style={{ marginTop: 16, fontSize: 15, fontWeight: "700", color: C.texto }}>
                Verificando ubicación
              </Text>
              <Text style={{ marginTop: 6, fontSize: 12, color: C.textoSuave, textAlign: "center" }}>
                Validando que estés en el punto de encuesta...
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          visible={modalDistancia}
          animationType="fade"
          onRequestClose={() => setModalDistancia(false)}
        >
          <View style={{
            flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center", alignItems: "center",
          }}>
            <View style={{
              backgroundColor: C.blanco, borderRadius: 24,
              padding: 28, width: "85%", alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
            }}>
              {/* Ícono */}
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: "#fff7ed",
                alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <Icon name="location-off" color="#d97706" size={40} />
              </View>

              {/* Título */}
              <Text style={{
                fontSize: 20, fontWeight: "900", color: C.texto,
                textAlign: "center", marginBottom: 8, letterSpacing: -0.3,
              }}>
                Fuera de rango
              </Text>

              {/* Distancia badge */}
              <View style={{
                backgroundColor: "#fef3c7", borderRadius: 20,
                paddingHorizontal: 16, paddingVertical: 6,
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#d97706" }}>
                  {distanciaActual} m
                </Text>
              </View>

              {/* Mensaje */}
              <Text style={{
                fontSize: 13, color: C.textoSuave,
                textAlign: "center", lineHeight: 20, marginBottom: 8,
              }}>
                Tu ubicación actual está demasiado lejos del punto donde se inició esta encuesta.
              </Text>
              <Text style={{
                fontSize: 13, color: C.textoSuave,
                textAlign: "center", lineHeight: 20, marginBottom: 24,
              }}>
                Debes estar a menos de{" "}
                <Text style={{ fontWeight: "800", color: C.texto }}>500 metros</Text>
                {" "}para poder continuar.
              </Text>

              {/* Separador */}
              <View style={{ width: "100%", height: 1, backgroundColor: C.grisMedio, marginBottom: 16 }} />

              {/* Botón */}
              <TouchableOpacity
                style={{
                  backgroundColor: C.navy, width: "100%", height: 48,
                  borderRadius: 14, alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 8,
                }}
                onPress={() => setModalDistancia(false)}
              >
                <Icon name="check" color="white" size={18} />
                <Text style={{ color: C.blanco, fontWeight: "800", fontSize: 15 }}>
                  Entendido
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          visible={modalSinGPSEditar}
          animationType="fade"
          onRequestClose={() => setModalSinGPSEditar(false)}
        >
          <View style={{
            flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center", alignItems: "center",
          }}>
            <View style={{
              backgroundColor: C.blanco, borderRadius: 24,
              padding: 28, width: "85%", alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
            }}>
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: C.redLight,
                alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}>
                <Icon name="gps-off" color={C.red} size={40} />
              </View>

              <Text style={{
                fontSize: 20, fontWeight: "900", color: C.texto,
                textAlign: "center", marginBottom: 8, letterSpacing: -0.3,
              }}>
                Sin ubicación GPS
              </Text>

              <Text style={{
                fontSize: 13, color: C.textoSuave,
                textAlign: "center", lineHeight: 20, marginBottom: 24,
              }}>
                No se pudo obtener tu ubicación. Activa el GPS e intenta nuevamente para poder continuar la encuesta.
              </Text>

              <View style={{ width: "100%", height: 1, backgroundColor: C.grisMedio, marginBottom: 16 }} />

              <TouchableOpacity
                style={{
                  backgroundColor: C.navy, width: "100%", height: 48,
                  borderRadius: 14, alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 8, marginBottom: 10,
                }}
                onPress={() => setModalSinGPSEditar(false)}
              >
                <Icon name="check" color="white" size={18} />
                <Text style={{ color: C.blanco, fontWeight: "800", fontSize: 15 }}>
                  Entendido
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}