import styles from "@/src/styles/encuestaStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import Checkbox from "expo-checkbox";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, Animated, BackHandler, Image,
  Keyboard, Modal, ScrollView, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { Icon } from "react-native-elements/dist/icons/Icon";
import { RadioButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_PREGUNTAS_FILTRADAS = "AYZ-preguntas-filtradas";
const STORAGE_OPCIONES_FILTRADAS  = "AYZ-opciones-filtradas";
const STORAGE_ENCUESTAS           = "AYZ-encuestas";
const STORAGE_FOTOS               = "AYZ-fotos-guardadas";
const STORAGE_CONTADOR            = "AYZ-contador-encuestas";
const STORAGE_DNI                 = "AYZ-user";
const STORAGE_RUTAS               = "AYZ-data-ruting";
const STORAGE_RUTAS_AUX           = "AYZ-rutas-aux";
const STORAGE_EDIT                = "AYZ-edit";

interface Preguntas {
  IDENCUESTA: number;
  NROPREGUNTA: number;
  TIPOPREGUNTA: string;
  TEXTOPREGUNTA: string;
  VALORXDEFECTO: string;
  MAXLENGTH: string;
  ISMANDATORY: string;
  NROPREGUNTA_CONDICIONAL: string;
  VALUE_OPCIONES: string;
  VALORMINIMO?: string;
  VALORMAXIMO?: string;
  ISDECIMAL: string;
  NROOPCIONESCHECK: number;
  NROMINIMOCHECK: number;
  FILTRO_VALOR: string;
  ORDENOPCIONESTABLA: string;
  ALEATORIO: string;
  REFERENCIA: string;
}

interface Opciones {
  IDENCUESTA: number;
  NROPREGUNTA: number;
  VALUE_OPCION: number;
  NROPREGUNTADESTINO: number;
  TEXTO_OPCION: string;
  PREGUNTA_CONDICIONAL: string;
  VALOR_CONDICIONAL: string;
}

interface Foto {
  CODIGOPK: string;
  RUTA: string;
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
}

interface RutasRpta extends Rutas {
  CODIGOPK: string;
}

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
}

const toNumArray = (str: string): number[] =>
  str ? str.split(",").map(Number).filter((n) => !isNaN(n)) : [];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function Encuesta() {
  const [preguntas, setPreguntas]           = useState<Preguntas[]>([]);
  const [opciones, setOpciones]             = useState<Opciones[]>([]);
  const [respuestas, setRespuestas]         = useState<RespuestaItem[]>([]);
  const [respuestasAux, setRespuestasAux]   = useState<RespuestaItem[]>([]);
  const [encuestaActual, setEncuestaActual] = useState<EncuestaPayload | null>(null);

  const [indicePregunta, setIndicePregunta]         = useState(0);
  const [historialPreguntas, setHistorialPreguntas] = useState<number[]>([]);
  const [avanzarBtn, setAvanzarBtn]                 = useState(true);

  const [inputText, setInputText]                       = useState("");
  const [opcionSeleccionada, setOpcionSeleccionada]     = useState("");
  const [checkedItems, setCheckedItems]                 = useState<string[]>([]);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState<{ [key: number]: string }>({});
  const [respuestasInputs, setRespuestasInputs]         = useState<{ [key: number]: string }>({});

  const [dataCont, setDataCont]   = useState(0);
  const [ultimoNum, setUltimoNum] = useState(0);

  const [latitud, setLatitud]   = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);

  const [codigoRuta, setCodigoRuta]         = useState<string>("");
  const [cargarRutas, setCargarRutas]       = useState<Rutas[]>([]);

  const [modalCamera, setModalCamera]   = useState(false);
  const [modalFoto, setModalFoto]       = useState(false);
  const [facing, setFacing]             = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [foto, setFoto]                 = useState<string | null>(null);
  const cameraRef                       = useRef<CameraView | null>(null);

  const [modalSalir, setModalSalir]         = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [encuestaLista, setEncuestaLista]   = useState(false);
  const [cargando, setCargando]             = useState(true);
  const progressAnim                        = useRef(new Animated.Value(0)).current;

  const fechaInicioRef    = useRef<string>("");
  const dniRef            = useRef<string>("");
  const codigoUnitarioRef = useRef<string>("");

  const { id, lat, lng } = useLocalSearchParams();
  const [modalGuardando, setModalGuardando] = useState(false);

  const esModoEdicion = useRef(false);
  const esRetroceso = useRef(false);
  const [modalSinGPS, setModalSinGPS] = useState(false);

  const [respuestasTexto, setRespuestasTexto] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    inicializar();
    const kbShow = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const kbHide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert("¿Seguro que deseas salir?", "Si lo haces no se guardará tu avance", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", onPress: () => router.replace("/home/home") },
      ]);
      return true;
    });
    return () => { kbShow.remove(); kbHide.remove(); backHandler.remove(); };
  }, []);

  useEffect(() => {
    if (preguntas.length > 0) {
      Animated.timing(progressAnim, {
        toValue: (indicePregunta + 1) / preguntas.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [indicePregunta, preguntas.length]);

  useEffect(() => {
    if (!esModoEdicion.current) return;
    if (preguntas.length === 0 || !encuestaActual) return;
    if (encuestaActual.RESPUESTAS.length === 0) return;

    const ultimaNro = encuestaActual.RESPUESTAS[encuestaActual.RESPUESTAS.length - 1].NROPREGUNTA;
    const idx = preguntas.findIndex((p) => p.NROPREGUNTA === ultimaNro);
    if (idx !== -1) {
      setIndicePregunta(idx);
      const ultimaRpta = encuestaActual.RESPUESTAS[encuestaActual.RESPUESTAS.length - 1];
      restaurarInputDesdeRespuesta(ultimaRpta, preguntas[idx].TIPOPREGUNTA);
      esModoEdicion.current = false;
    }
  }, [preguntas, encuestaActual?.CODIGOPK]);

  useEffect(() => {
    if (preguntas.length === 0) return;
    validarBotonAvanzar();
    saltarCondicionales();

    const p = preguntas[indicePregunta];
    if (p?.TIPOPREGUNTA === "Opciones" && opcionSeleccionada !== "") {
      if (esRetroceso.current) {
        esRetroceso.current = false;
      } else {
        avanzarPregunta();
      }
    }
  }, [inputText, opcionSeleccionada, opcionesSeleccionadas, respuestasInputs,
      indicePregunta, checkedItems, foto, respuestasAux, respuestas]);


  const formatearFecha = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const inicializar = async () => {
    setCargando(true);

    try {
      await Promise.all([cargarData(), cargarRutaYCodigo()]);

      const edit = await AsyncStorage.getItem(STORAGE_EDIT);

      if (edit === "editar") {
        esModoEdicion.current = true;
        // Cargar encuesta guardada
        const auxStr = await AsyncStorage.getItem("AYZ-respuestas-aux");
        if (auxStr) {
          const encGuardada: EncuestaPayload = JSON.parse(auxStr);

          // Restaurar refs
          dniRef.current          = encGuardada.DNI_ENCUESTADOR;
          fechaInicioRef.current  = encGuardada.FECHA_INICIO;
          codigoUnitarioRef.current = encGuardada.CODIGOPK;

          // Restaurar coordenadas
          if (encGuardada.LATITUD)  setLatitud(encGuardada.LATITUD);
          if (encGuardada.LONGITUD) setLongitud(encGuardada.LONGITUD);

          // Restaurar respuestas
          setRespuestas(encGuardada.RESPUESTAS);
          setEncuestaActual(encGuardada);

          // Restaurar textos de respuestas previas
          if (encGuardada.RESPUESTAS_TEXTO) {
            setRespuestasTexto(encGuardada.RESPUESTAS_TEXTO);
          }

          // Ir a la última pregunta respondida
          const ultimaNro = encGuardada.RESPUESTAS.length > 0
            ? encGuardada.RESPUESTAS[encGuardada.RESPUESTAS.length - 1].NROPREGUNTA
            : 0;

          // Historial con todos los números de pregunta respondidos
          setHistorialPreguntas(encGuardada.RESPUESTAS.map(r => r.NROPREGUNTA));
        }
      } else {
        // Encuesta nueva — código que ya tenías
        const dniGuardado = (await AsyncStorage.getItem(STORAGE_DNI)) ?? "";
        const fechaInicioActual = formatearFecha(new Date());
        const codigopk = await obtenerCodigo();

        dniRef.current         = dniGuardado;
        fechaInicioRef.current = fechaInicioActual;

        const payloadInicial: EncuestaPayload = {
          IDENCUESTA: Number(id),
          CODIGOPK: codigopk,
          DNI_ENCUESTADOR: dniGuardado,
          FLAG_TERMINADO: "NO",
          FECHA_INICIO: fechaInicioActual,
          FECHA_FIN: null,
          DURACION_MIN: null,
          LATITUD: lat ? parseFloat(String(lat)) : null,
          LONGITUD: lng ? parseFloat(String(lng)) : null,
          LATITUD2: null,
          LONGITUD2: null,
          LATITUD3: null,
          LONGITUD3: null,
          RESPUESTAS: [],
        };

        setEncuestaActual(payloadInicial);
      }
    } catch (e) {
      console.error("Error inicializando encuesta:", e);
    } finally {
      setCargando(false);
    }
  };

  const cargarRutaYCodigo = async () => {
    if (id)  setCodigoRuta(String(id));
    if (lat) setLatitud(parseFloat(String(lat)));
    if (lng) setLongitud(parseFloat(String(lng)));
    const dataR = await AsyncStorage.getItem(STORAGE_RUTAS);
    if (dataR) setCargarRutas(JSON.parse(dataR));
  };

  const obtenerCoordenadas = async (): Promise<{ lat: number | null; lng: number | null }> => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
        if (status !== 'granted') return { lat: null, lng: null };
      }

      const provider = await Location.getProviderStatusAsync();
      if (!provider.locationServicesEnabled) {
        Alert.alert("GPS desactivado", "Activa el GPS para guardar tu ubicación.");
        return { lat: null, lng: null };
      }

      const location = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 12000)
        ),
      ]);

      return { lat: location.coords.latitude, lng: location.coords.longitude };
    } catch (e) {
      if (String((e as any)?.message).includes('TIMEOUT')) {
        Alert.alert("Sin ubicación", "No se pudo obtener el GPS. Intenta nuevamente.");
      }
      return { lat: null, lng: null };
    }
  };
  
  const cargarData = async () => {
    const preguntasStr = await AsyncStorage.getItem(STORAGE_PREGUNTAS_FILTRADAS);
    const opcionesStr  = await AsyncStorage.getItem(STORAGE_OPCIONES_FILTRADAS);
    if (preguntasStr) {
      const parsed: Preguntas[] = JSON.parse(preguntasStr);
      parsed.sort((a, b) => a.NROPREGUNTA - b.NROPREGUNTA);
      setPreguntas(parsed);
      setEncuestaLista(true);
    }
    if (opcionesStr) setOpciones(JSON.parse(opcionesStr));
  };

  const obtenerCodigo = async (): Promise<string> => {
    const numero = await AsyncStorage.getItem(STORAGE_CONTADOR);
    const dniLocal = (await AsyncStorage.getItem(STORAGE_DNI)) ?? "";
    const fecha = new Date().toISOString().split("T")[0].replace(/-/g, "");

    const valorNum = numero ? parseInt(numero, 10) : 1;
    const contador = valorNum.toString().padStart(6, "0");

    const valorFinal = `${fecha}${dniLocal}${contador}`;

    await AsyncStorage.setItem(
      STORAGE_CONTADOR,
      JSON.stringify(valorNum + 1)
    );

    codigoUnitarioRef.current = valorFinal;

    return valorFinal; 
  };

  const restaurarInputDesdeRespuesta = (rpta: RespuestaItem, tipo: string) => {
    switch (tipo) {
      case "Texto": case "TextoIde": case "TextoTelf":
        setInputText(rpta.TXTRESULTADO);
        setOpcionSeleccionada(""); setCheckedItems([]);
        break;
      case "Opciones": {
        const op = opciones.find(
          (o) => o.NROPREGUNTA === rpta.NROPREGUNTA && String(o.VALUE_OPCION) === rpta.TXTRESULTADO
        );
        setOpcionSeleccionada(op?.TEXTO_OPCION ?? "");
        setInputText(""); setCheckedItems([]);
        break;
      }
      case "CheckList": {
        const textos = rpta.TXTRESULTADO.split(",").map((v) => {
          const op = opciones.find(
            (o) => o.NROPREGUNTA === rpta.NROPREGUNTA && String(o.VALUE_OPCION) === v
          );
          return op?.TEXTO_OPCION ?? "";
        }).filter(Boolean);
        setCheckedItems(textos);
        setInputText(""); setOpcionSeleccionada("");
        break;
      }
      default: resetInputs();
    }
  };

  const validarBotonAvanzar = () => {
    const p = preguntas[indicePregunta];
    if (!p) return;

    if (p.ISMANDATORY !== "SI") { setAvanzarBtn(true); return; }

    switch (p.TIPOPREGUNTA) {
      case "Texto": {
        const max      = p.VALORMAXIMO ? parseFloat(p.VALORMAXIMO) : null;
        const min      = p.VALORMINIMO ? parseFloat(p.VALORMINIMO) : 0;
        const esDecimal = p.ISDECIMAL === "SI";
        const regex    = esDecimal ? /^[0-9]*\.?[0-9]+$/ : /^[0-9]+$/;
        if (max !== null) {
          const num = parseFloat(inputText);
          setAvanzarBtn(regex.test(inputText) && num >= min && num <= max);
        } else {
          const maxLen = p.MAXLENGTH ? parseInt(p.MAXLENGTH) : null;
          setAvanzarBtn(maxLen ? inputText.length >= 1 : inputText.length > 2);
        }
        break;
      }
      case "Opciones":   setAvanzarBtn(opcionSeleccionada !== ""); break;
      case "CheckList":
        setAvanzarBtn(p.NROMINIMOCHECK ? checkedItems.length >= p.NROMINIMOCHECK : checkedItems.length > 0);
        break;
      case "Foto":         setAvanzarBtn(!!foto); break;
      case "OpcionesTabla": setAvanzarBtn(dataCont > 0 && respuestasAux.length >= dataCont); break;
      case "TextoLista": {
        if (respuestasAux.length === 0 || dataCont === 0) { setAvanzarBtn(false); break; }
        let validos = 0;
        for (const r of respuestasAux) {
          const pq = preguntas.find((q) => q.NROPREGUNTA === r.NROPREGUNTA);
          if (!pq) continue;
          const esDecimal = pq.ISDECIMAL === "SI";
          const regex = esDecimal ? /^[0-9]*\.?[0-9]+$/ : /^[0-9]+$/;
          const num = parseFloat(String(r.TXTRESULTADO));
          const min = pq.VALORMINIMO ? parseFloat(pq.VALORMINIMO) : 0;
          const max = pq.VALORMAXIMO ? parseFloat(pq.VALORMAXIMO) : 99999;
          if (regex.test(String(r.TXTRESULTADO)) && num >= min && num <= max) validos++;
        }
        setAvanzarBtn(validos >= dataCont);
        break;
      }
      case "TextoIde": {
        const d = inputText[0];
        setAvanzarBtn(inputText.length === 11 && (["0","1","2"].includes(d) || Number(inputText) === 99999999999));
        break;
      }
      case "TextoTelf":
        setAvanzarBtn(inputText.length === 9 && (inputText[0] === "0" || inputText[0] === "9"));
        break;
      case "Imagen": setAvanzarBtn(true); break;
      default:       setAvanzarBtn(true);
    }
  };

  const saltarCondicionales = (
    rptasSnapshot: RespuestaItem[] = respuestas,
    desde: number = indicePregunta
  ): number => {
    const p = preguntas[desde];
    if (!p) return desde;
    if (p.TIPOPREGUNTA === "OpcionesTabla" || p.TIPOPREGUNTA === "TextoLista") return desde;

    let idx = desde;
    while (preguntas[idx]) {
      const pregCond = preguntas[idx];
      if (!pregCond.NROPREGUNTA_CONDICIONAL || pregCond.NROPREGUNTA_CONDICIONAL === "0") break;

      const nroCond         = parseInt(pregCond.NROPREGUNTA_CONDICIONAL);
      const valoresEsperados = toNumArray(pregCond.VALUE_OPCIONES);
      const rptaCond        = rptasSnapshot.find((r) => r.NROPREGUNTA === nroCond);

      if (!rptaCond) { idx++; continue; }

      let mostrar = false;

      const preguntaCond = preguntas.find(p => p.NROPREGUNTA === nroCond);
      const esCheckList = preguntaCond?.TIPOPREGUNTA === "CheckList";

      if (esCheckList) {
        const valoresSeleccionados = toNumArray(rptaCond.TXTRESULTADO);
        mostrar = valoresSeleccionados.some(v => valoresEsperados.includes(v));
      } else {
        const opcionCond = opciones.find(
          (o) => o.NROPREGUNTA === nroCond && String(o.VALUE_OPCION) === String(rptaCond.TXTRESULTADO)
        );

        mostrar = opcionCond
          ? valoresEsperados.includes(opcionCond.VALUE_OPCION)
          : valoresEsperados.includes(parseInt(String(rptaCond.TXTRESULTADO)));
      }
      if (mostrar) break;
      idx++;
    }
    if (idx !== desde) setIndicePregunta(idx);
    return idx;
  };

  const construirRespuesta = (p: Preguntas): RespuestaItem => {
    let txtResultado: string;
    switch (p.TIPOPREGUNTA) {
      case "Texto": case "TextoIde": case "TextoTelf":
        txtResultado = inputText; break;
      case "Opciones": {
        const opcion = opciones.find(
          (o) => o.NROPREGUNTA === p.NROPREGUNTA && o.TEXTO_OPCION === opcionSeleccionada
        );
        txtResultado = opcion ? String(opcion.VALUE_OPCION) : ""; break;
      }
      case "CheckList": {
        const valores = checkedItems.map((texto) => {
          const op = opciones.find(
            (o) => o.NROPREGUNTA === p.NROPREGUNTA && o.TEXTO_OPCION === texto
          );
          return op ? String(op.VALUE_OPCION) : "";
        }).filter(Boolean);
        txtResultado = valores.join(","); break;
      }
      case "Foto": txtResultado = codigoUnitarioRef.current; break;
      case "Imagen": txtResultado = "VISUALIZADO";  break;
      default:       txtResultado = "";
    }
    return { NROPREGUNTA: p.NROPREGUNTA, TXTRESULTADO: txtResultado };
  };

  const construirPayload = (
    rptas: RespuestaItem[], 
    terminado: "SI" | "NO" = "SI",
    lat2: number | null = null,
    lng2: number | null = null,
    lat3: number | null = null,
    lng3: number | null = null): EncuestaPayload => {
    const ahora = formatearFecha(new Date());
    const diffMin = fechaInicioRef.current
      ? Math.round((new Date().getTime() - new Date(fechaInicioRef.current).getTime()) / 60000)
      : null;
    return {
      IDENCUESTA:     preguntas[0].IDENCUESTA,
      CODIGOPK:       codigoUnitarioRef.current,
      DNI_ENCUESTADOR: dniRef.current,
      FLAG_TERMINADO: terminado,
      FECHA_INICIO:   fechaInicioRef.current,
      FECHA_FIN:      terminado === "SI" ? ahora : null,
      DURACION_MIN:   terminado === "SI" ? diffMin : null,
      LATITUD:        latitud,
      LONGITUD:       longitud,
      LATITUD2:       lat2,
      LONGITUD2:      lng2,
      LATITUD3:       lat3,
      LONGITUD3:      lng3,
      RESPUESTAS:     rptas,
      RESPUESTAS_TEXTO: respuestasTexto,
    };
  };

  const guardarHistorial = (nro: number) =>
    setHistorialPreguntas((h) => [...h, nro]);

  const resetInputs = () => {
    setInputText(""); setOpcionSeleccionada(""); setCheckedItems([]);
  };

  const resetTabla = () => {
    setRespuestasAux([]); setOpcionesSeleccionadas({});
    setRespuestasInputs({}); setUltimoNum(0); setDataCont(0);
  };

  const avanzarPregunta = useCallback(() => {
    const p = preguntas[indicePregunta];
    if (!p) return;

    if (p.FILTRO_VALOR === "X" && inputText === "9999") {
      guardarHistorial(p.NROPREGUNTA);
      resetInputs();
      setIndicePregunta((prev) => prev + 1);
      return;
    }

    const nueva = construirRespuesta(p);

    const nuevasRespuestas = [
      ...respuestas.filter((r) => r.NROPREGUNTA !== nueva.NROPREGUNTA),
      nueva,
    ];

    setRespuestas(nuevasRespuestas);

    setEncuestaActual((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        RESPUESTAS: nuevasRespuestas,
      };
    });

    if (p.TIPOPREGUNTA === "Opciones") {
      setRespuestasTexto(prev => ({ ...prev, [p.NROPREGUNTA]: opcionSeleccionada }));
    } else if (p.TIPOPREGUNTA === "CheckList") {
      setRespuestasTexto(prev => ({ ...prev, [p.NROPREGUNTA]: checkedItems.join(", ") }));
    }

    if (p.TIPOPREGUNTA === "Opciones") {
      const salto = opciones.find(
        (o) => o.NROPREGUNTA === p.NROPREGUNTA &&
          o.TEXTO_OPCION === opcionSeleccionada &&
          o.NROPREGUNTADESTINO !== null && o.NROPREGUNTADESTINO !== 0
      );
      if (salto) {
        const destIdx = preguntas.findIndex((q) => q.NROPREGUNTA === salto.NROPREGUNTADESTINO);
        if (destIdx !== -1) {
          guardarHistorial(p.NROPREGUNTA); resetInputs();
          setIndicePregunta(destIdx); return;
        }
      }
    }

    if (p.TIPOPREGUNTA === "OpcionesTabla" || p.TIPOPREGUNTA === "TextoLista") {
      const sinPlaceholder = nuevasRespuestas.filter((r) => r.NROPREGUNTA !== p.NROPREGUNTA);
      setRespuestas([...sinPlaceholder, ...respuestasAux]);
      const siguiente = calcularSiguienteTabla(ultimoNum, p.TIPOPREGUNTA);
      resetTabla(); guardarHistorial(p.NROPREGUNTA); resetInputs();
      setIndicePregunta(siguiente - 1); return;
    }

    if (indicePregunta < preguntas.length - 1) {
      guardarHistorial(p.NROPREGUNTA);
      const siguienteIdx = saltarCondicionales(nuevasRespuestas, indicePregunta + 1);
      if (siguienteIdx === indicePregunta + 1) setIndicePregunta(indicePregunta + 1);
      resetInputs();
    }
  }, [preguntas, indicePregunta, respuestas, respuestasAux, opciones,
    opcionSeleccionada, inputText, checkedItems,
    latitud, longitud, ultimoNum]);

  const retrocederPregunta = () => {
    if (historialPreguntas.length === 0) return;
    const ultimoNro  = historialPreguntas[historialPreguntas.length - 1];
    const idx        = preguntas.findIndex((p) => p.NROPREGUNTA === ultimoNro);
    const rptaPrevia = respuestas.find((r) => r.NROPREGUNTA === ultimoNro);
    setRespuestas((prev) => prev.filter((r) => r.NROPREGUNTA < ultimoNro));
    setHistorialPreguntas((h) => h.slice(0, -1));
    resetTabla(); setAvanzarBtn(true);
    if (idx !== -1) {
      esRetroceso.current = true; // <- activar antes de restaurar
      setIndicePregunta(idx);
      rptaPrevia ? restaurarInputDesdeRespuesta(rptaPrevia, preguntas[idx].TIPOPREGUNTA) : resetInputs();
    }
  };

  const calcularSiguienteTabla = (desde: number, tipo: string): number => {
    let idx = desde + 1;
    const ordenBase = preguntas.find((p) => p.NROPREGUNTA === desde)?.ORDENOPCIONESTABLA;
    while (true) {
      const p = preguntas.find((q) => q.NROPREGUNTA === idx);
      if (!p || p.TIPOPREGUNTA !== tipo || p.ORDENOPCIONESTABLA !== ordenBase) return idx;
      idx++;
    }
  };

  const obtenerConjuntoTabla = useMemo((): number[] => {
    const p = preguntas[indicePregunta];
    if (!p) return [];
    const orden = p.ORDENOPCIONESTABLA;
    let nro = p.NROPREGUNTA;
    const resultado: number[] = [];
    while (true) {
      const pregActual = preguntas.find((q) => q.NROPREGUNTA === nro);
      if (!pregActual || pregActual.TIPOPREGUNTA !== p.TIPOPREGUNTA || pregActual.ORDENOPCIONESTABLA !== orden) break;
      if (pregActual.NROPREGUNTA_CONDICIONAL && parseInt(pregActual.NROPREGUNTA_CONDICIONAL) > 0) {
        const numCond  = parseInt(pregActual.NROPREGUNTA_CONDICIONAL);
        const valores  = toNumArray(pregActual.VALUE_OPCIONES);
        const rptaCond = respuestas.find((r) => r.NROPREGUNTA === numCond);
        const opCond   = opciones.find(
          (o) => o.NROPREGUNTA === numCond && o.VALUE_OPCION === parseInt(rptaCond?.TXTRESULTADO ?? "")
        );
        if (opCond && valores.includes(opCond.VALUE_OPCION)) resultado.push(nro);
      } else {
        resultado.push(nro);
      }
      nro++;
    }
    return resultado;
  }, [indicePregunta, preguntas, respuestas, opciones]);

  const handleCheckbox = (texto: string, limite: number, minimo: number) => {
    const checked = checkedItems.includes(texto);
    if (!checked && limite && checkedItems.length >= limite) {
      Alert.alert(`Solo puedes seleccionar hasta ${limite} opciones.`); return;
    }
    setCheckedItems((prev) => checked ? prev.filter((i) => i !== texto) : [...prev, texto]);
  };

  const guardarOpcionTabla = (pregId: number, valor: string) => {
    const op = opciones.find((o) => o.NROPREGUNTA === pregId && o.TEXTO_OPCION === valor);
    const nueva: RespuestaItem = { NROPREGUNTA: pregId, TXTRESULTADO: op ? String(op.VALUE_OPCION) : valor };
    setRespuestasAux((prev) => [...prev.filter((r) => r.NROPREGUNTA !== pregId), nueva]);
    setOpcionesSeleccionadas((prev) => ({ ...prev, [pregId]: valor }));
  };

  const guardarInputTabla = (pregId: number, valor: string) => {
    const nueva: RespuestaItem = { NROPREGUNTA: pregId, TXTRESULTADO: valor };
    setRespuestasAux((prev) => [...prev.filter((r) => r.NROPREGUNTA !== pregId), nueva]);
    setRespuestasInputs((prev) => ({ ...prev, [pregId]: valor }));
  };

  const abrirCamera = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== "granted") { Alert.alert("Permiso requerido", "Se necesita acceso a la cámara"); return; }
    }
    setModalCamera(true);
  };

  const tomarFoto = async () => {
    if (!cameraRef.current) return;
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.3 });
      if (result) { setFoto(result.uri); setAvanzarBtn(true); setModalCamera(false); }
    } catch (e) { console.error("Error tomando foto:", e); }
  };

  const guardarFoto = async () => {
    if (!foto) return;
    const ftStr = await AsyncStorage.getItem(STORAGE_FOTOS);
    const fotos: Foto[] = ftStr ? JSON.parse(ftStr) : [];
    fotos.push({ CODIGOPK: codigoUnitarioRef.current, RUTA: foto });
    await AsyncStorage.setItem(STORAGE_FOTOS, JSON.stringify(fotos));
  };

  const actualizarRutas = async () => {
    if (!codigoRuta) return;
    const datoR = cargarRutas.find((r) => r.CODCLIENTE === codigoRuta);
    if (!datoR) return;
    const datoAux    = cargarRutas.filter((r) => r.CODCLIENTE !== codigoRuta);
    const nuevaRuta: RutasRpta = { ...datoR, CODIGOPK: codigoUnitarioRef.current };
    const almacenStr = await AsyncStorage.getItem(STORAGE_RUTAS_AUX);
    const almacen: RutasRpta[] = almacenStr ? JSON.parse(almacenStr) : [];
    almacen.push(nuevaRuta);
    await AsyncStorage.setItem(STORAGE_RUTAS_AUX, JSON.stringify(almacen));
    await AsyncStorage.setItem(STORAGE_RUTAS, JSON.stringify(datoAux));
  };

  const deshacerContador = async () => {
    const contador = await AsyncStorage.getItem(STORAGE_CONTADOR);
    if (contador) await AsyncStorage.setItem(STORAGE_CONTADOR, JSON.stringify(parseInt(contador) - 1));
  };

  const guardarEncuestaEnStorage = async (payload: EncuestaPayload) => {
    const str = await AsyncStorage.getItem(STORAGE_ENCUESTAS);
    const enc: EncuestaPayload[] = str ? JSON.parse(str) : [];
    const filtradas = enc.filter((e) => e.CODIGOPK !== payload.CODIGOPK);
    filtradas.push(payload);
    await AsyncStorage.setItem(STORAGE_ENCUESTAS, JSON.stringify(filtradas));
  };

  const alertGuardar = () => {
    Alert.alert("ENCUESTA FINALIZADA", "¿Deseas guardar y salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí",
        onPress: async () => {
          setModalGuardando(true);
          const { lat, lng } = await obtenerCoordenadas();
          setModalGuardando(false);

          if (lat === null || lng === null) {
            setModalSinGPS(true);
            return;
          }

          setModalGuardando(true);
          try {
            const p = preguntas[indicePregunta];
            const ultima = construirRespuesta(p);
            const todas = [...respuestas, ultima];
            const payload = construirPayload(todas, "SI", null, null, lat, lng);
            await guardarFoto();
            await guardarEncuestaEnStorage(payload);
            await actualizarRutas();
          } finally {
            setModalGuardando(false);
            router.replace("/home/home");
          }
        },
      },
    ]);
  };

  const guardarYSalir = async () => {
    if (respuestas.length < 3) {
      Alert.alert("Avance insuficiente", "Debes responder al menos 3 preguntas antes de guardar.", [{ text: "Entendido", style: "cancel" }]);
      return;
    }
    setModalGuardando(true);
    try {
      const payload = construirPayload(respuestas, "NO", null, null, null, null);
      await guardarFoto();
      await guardarEncuestaEnStorage(payload);
      await actualizarRutas();
    } finally {
      setModalGuardando(false);
      router.push("/home/home");
    }
  };

  const salirSinGuardar = async () => {
    await deshacerContador();
    router.replace("/home/home");
  };

  const filtrarOpcionesCondicionales = useCallback(
    (opcionesPregunta: Opciones[], pregunta: Preguntas): Opciones[] => {
      let resultado = opcionesPregunta.filter((op) => {
        if (!op.PREGUNTA_CONDICIONAL) return true;
        const nroCond = parseInt(op.PREGUNTA_CONDICIONAL);
        const valores = toNumArray(op.VALOR_CONDICIONAL);
        const rpta    = respuestas.find((r) => r.NROPREGUNTA === nroCond);
        const opCond  = opciones.find(
          (o) => o.NROPREGUNTA === nroCond && o.VALUE_OPCION === parseInt(rpta?.TXTRESULTADO ?? "")
        );
        if (!opCond) return false;
        if (valores.length === 1 && valores[0] === 99) return true;
        return valores.includes(opCond.VALUE_OPCION);
      });

      // REFERENCIA: +N incluye opciones seleccionadas en pregunta N, -N las excluye
      if (pregunta.REFERENCIA) {
        const refNum   = parseInt(pregunta.REFERENCIA);
        const refNro   = Math.abs(refNum);
        const incluir  = refNum > 0;
        const rptaRef  = respuestas.find((r) => r.NROPREGUNTA === refNro);
        if (rptaRef) {
          const valoresRef = rptaRef.TXTRESULTADO.split(",").map(String);
          resultado = resultado.filter((op) => {
            const enRef = valoresRef.includes(String(op.VALUE_OPCION));
            return incluir ? enRef : !enRef;
          });
        }
      }

      // ALEATORIO: mezclar opciones si está activado
      if (pregunta.ALEATORIO === "X") resultado = shuffleArray(resultado);

      return resultado;
    },
    [respuestas, opciones]
  );

  const renderAlternativas = () => {
    const p = preguntas[indicePregunta];
    if (!p) return null;

    switch (p.TIPOPREGUNTA) {
      case "Texto": {
        const max    = p.VALORMAXIMO ? parseFloat(p.VALORMAXIMO) : null;
        const min    = p.VALORMINIMO ? parseFloat(p.VALORMINIMO) : 0;
        const maxLen = p.MAXLENGTH   ? parseInt(p.MAXLENGTH)     : undefined;
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={p.VALORXDEFECTO || "Ingrese su respuesta"}
              placeholderTextColor="#aaa"
              onChangeText={setInputText}
              value={inputText}
              keyboardType={max !== null ? "numeric" : "default"}
              maxLength={maxLen}
            />
            {max !== null && <Text style={styles.rangeHint}>Valor entre {min} y {max}</Text>}
            {maxLen && <Text style={styles.rangeHint}>Máx. {maxLen} caracteres</Text>}
            {p.FILTRO_VALOR === "X" && (
              <Text style={styles.rangeHint}>Ingresa 9999 para omitir esta pregunta</Text>
            )}
          </View>
        );
      }

      case "Opciones": {
        const opsPregunta = opciones.filter((o) => o.NROPREGUNTA === p.NROPREGUNTA);
        const opsValidadas = filtrarOpcionesCondicionales(opsPregunta, p);
        return (
          <ScrollView style={styles.scrollOpciones} showsVerticalScrollIndicator={false}>
            <RadioButton.Group onValueChange={(v) => setOpcionSeleccionada(v)} value={opcionSeleccionada}>
              {opsValidadas.map((op, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.radioItem, opcionSeleccionada === op.TEXTO_OPCION && styles.radioItemSelected]}
                  onPress={() => setOpcionSeleccionada(op.TEXTO_OPCION)}
                  activeOpacity={0.7}
                >
                  <RadioButton.Android value={op.TEXTO_OPCION} color="#002645" />
                  <Text style={styles.radioLabel}>{op.TEXTO_OPCION}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </ScrollView>
        );
      }

      case "CheckList": {
        const ops = filtrarOpcionesCondicionales(
          opciones.filter((o) => o.NROPREGUNTA === p.NROPREGUNTA), p
        );
        return (
          <ScrollView style={styles.scrollOpciones} showsVerticalScrollIndicator={false}>
            {ops.map((op, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.checkItem, checkedItems.includes(op.TEXTO_OPCION) && styles.checkItemSelected]}
                onPress={() => handleCheckbox(op.TEXTO_OPCION, p.NROOPCIONESCHECK, p.NROMINIMOCHECK)}
                activeOpacity={0.7}
              >
                <Checkbox
                  value={checkedItems.includes(op.TEXTO_OPCION)}
                  onValueChange={() => handleCheckbox(op.TEXTO_OPCION, p.NROOPCIONESCHECK, p.NROMINIMOCHECK)}
                  color={checkedItems.includes(op.TEXTO_OPCION) ? "#002645" : undefined}
                />
                <Text style={styles.checkLabel}>{op.TEXTO_OPCION}</Text>
              </TouchableOpacity>
            ))}
            {p.NROMINIMOCHECK > 0 && (
              <Text style={styles.rangeHint}>
                Selecciona al menos {p.NROMINIMOCHECK} opción{p.NROMINIMOCHECK > 1 ? "es" : ""}
                {p.NROOPCIONESCHECK > 0 ? ` (máx. ${p.NROOPCIONESCHECK})` : ""}
              </Text>
            )}
          </ScrollView>
        );
      }

      case "Imagen":
        return (
          <View style={styles.imagenContainer}>
            <Icon name="image" color="rgba(255,255,255,0.5)" size={64} />
            <Text style={styles.imagenHint}>Imagen de referencia</Text>
          </View>
        );

      case "Foto":
        return (
          <View style={styles.fotoContainer}>
            {foto && <Image source={{ uri: foto }} style={styles.fotoPreview} resizeMode="cover" />}
            <View style={styles.fotoBtns}>
              <TouchableOpacity style={styles.btnCamera} onPress={abrirCamera}>
                <Icon name="camera" color="#002645" size={20} />
                <Text style={styles.btnCameraText}>{foto ? "Retomar foto" : "Tomar foto"}</Text>
              </TouchableOpacity>
              {foto && (
                <TouchableOpacity style={styles.btnVerFoto} onPress={() => setModalFoto(true)}>
                  <Icon name="photo" color="white" size={20} />
                  <Text style={styles.btnVerFotoText}>Ver foto</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case "OpcionesTabla": {
        const conjunto = obtenerConjuntoTabla;
        if (conjunto.length > 0 && dataCont !== conjunto.length) {
          setUltimoNum(conjunto[conjunto.length - 1]);
          setDataCont(conjunto.length);
        }
        const encabezados = opciones.filter(
          (o) => o.NROPREGUNTA === p.NROPREGUNTA && o.IDENCUESTA === p.IDENCUESTA
        );
        return (
          <View style={styles.tablaContainer}>
            <View style={styles.tablaHeader}>
              <View style={styles.tablaColPregunta}><Text style={styles.tablaHeaderText}>PREGUNTAS</Text></View>
              <View style={styles.tablaColOpciones}>
                {encabezados.map((enc, i) => (
                  <View key={i} style={styles.tablaColItem}>
                    <Text style={styles.tablaHeaderText}>{enc.TEXTO_OPCION}</Text>
                  </View>
                ))}
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {conjunto.length > 0 ? conjunto.map((id) => (
                <View key={id} style={styles.tablaRow}>
                  <View style={styles.tablaColPregunta}>
                    <Text style={styles.tablaRowText}>
                      {preguntas.find((q) => q.NROPREGUNTA === id)?.TEXTOPREGUNTA ?? ""}
                    </Text>
                  </View>
                  <View style={[styles.tablaColOpciones, styles.tablaColOpcionesRow]}>
                    <RadioButton.Group onValueChange={(v) => guardarOpcionTabla(id, v)} value={opcionesSeleccionadas[id] ?? ""}>
                      <View style={styles.tablaRadioRow}>
                        {encabezados.map((enc, i) => (
                          <View key={i} style={styles.tablaColItem}>
                            <RadioButton.Android value={enc.TEXTO_OPCION} color="#002645" />
                          </View>
                        ))}
                      </View>
                    </RadioButton.Group>
                  </View>
                </View>
              )) : <Text style={styles.noDataText}>NO HAY PREGUNTAS</Text>}
            </ScrollView>
          </View>
        );
      }

      case "TextoLista": {
        const conjunto = obtenerConjuntoTabla;
        if (conjunto.length > 0 && dataCont !== conjunto.length) {
          setUltimoNum(conjunto[conjunto.length - 1]);
          setDataCont(conjunto.length);
        }
        return (
          <ScrollView style={{ maxHeight: isKeyboardVisible ? 260 : 380 }} showsVerticalScrollIndicator={false}>
            {conjunto.length > 0 ? conjunto.map((id) => {
              const pq = preguntas.find((q) => q.NROPREGUNTA === id);
              return (
                <View key={id} style={styles.listaInputItem}>
                  <Text style={styles.listaInputLabel}>{pq?.TEXTOPREGUNTA}</Text>
                  <TextInput
                    style={styles.listaInput}
                    placeholder={pq?.VALORXDEFECTO || "Escribe tu respuesta..."}
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                    onChangeText={(v) => guardarInputTabla(id, v)}
                    value={respuestasInputs[id] ?? ""}
                    maxLength={pq?.MAXLENGTH ? parseInt(pq.MAXLENGTH) : undefined}
                  />
                  {pq?.VALORMINIMO && pq?.VALORMAXIMO && (
                    <Text style={styles.rangeHint}>Entre {pq.VALORMINIMO} y {pq.VALORMAXIMO}</Text>
                  )}
                </View>
              );
            }) : <Text style={styles.noDataText}>No hay preguntas disponibles</Text>}
          </ScrollView>
        );
      }

      case "TextoIde":
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Número de identidad (11 dígitos)"
              placeholderTextColor="#aaa"
              onChangeText={setInputText}
              value={inputText}
              keyboardType="numeric"
              maxLength={11}
            />
            <Text style={styles.rangeHint}>DNI/CE (11 dígitos) o 99999999999</Text>
          </View>
        );

      case "TextoTelf":
        return (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Número de teléfono (9 dígitos)"
              placeholderTextColor="#aaa"
              onChangeText={setInputText}
              value={inputText}
              keyboardType="numeric"
              maxLength={9}
            />
            <Text style={styles.rangeHint}>Debe comenzar con 0 (fijo) o 9 (celular)</Text>
          </View>
        );

      default: return null;
    }
  };

  const esPreguntaFinal = indicePregunta === preguntas.length - 1;
  const p = preguntas[indicePregunta];

  if (cargando) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002645" />
          <Text style={styles.loadingText}>Cargando encuesta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.screen}>

        <Modal animationType="fade" transparent visible={modalGuardando}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ActivityIndicator size="large" color="#002645" />
              <Text style={[styles.modalTitle, { marginTop: 16 }]}>Guardando encuesta...</Text>
            </View>
          </View>
        </Modal>
        <Modal animationType="fade" transparent visible={modalSalir} onRequestClose={() => setModalSalir(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setModalSalir(false)}>
                <Icon name="close" color="white" size={18} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>¿Deseas salir?</Text>
              <Text style={styles.modalSubtitle}>Elige cómo quieres continuar</Text>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#c0392b" }]} onPress={salirSinGuardar}>
                <Icon name="exit-to-app" color="white" size={18} />
                <Text style={styles.modalBtnText}>Salir sin guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#002645" }]} onPress={guardarYSalir}>
                <Icon name="save" color="white" size={18} />
                <Text style={styles.modalBtnText}>Guardar y salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal animationType="slide" transparent={false} visible={modalCamera}>
          <View style={styles.cameraModal}>
            <TouchableOpacity style={styles.cameraClose} onPress={() => setModalCamera(false)}>
              <Icon name="close" color="white" size={22} />
            </TouchableOpacity>
            <CameraView style={styles.cameraView} facing={facing} ref={cameraRef}>
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.cameraShutter} onPress={tomarFoto}>
                  <View style={styles.cameraShutterInner} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cameraFlip} onPress={() => setFacing((f) => f === "back" ? "front" : "back")}>
                  <Icon name="flip-camera-android" color="white" size={24} />
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        </Modal>

        <Modal animationType="fade" transparent visible={modalFoto}>
          <View style={styles.fotoModal}>
            <TouchableOpacity style={styles.cameraClose} onPress={() => setModalFoto(false)}>
              <Icon name="close" color="white" size={22} />
            </TouchableOpacity>
            {foto
              ? <Image source={{ uri: foto }} style={{ width: "100%", height: "85%" }} resizeMode="contain" />
              : <Text style={{ color: "white", fontSize: 16 }}>Sin foto</Text>
            }
          </View>
        </Modal>

        <TouchableOpacity style={styles.exitBtn} onPress={() => setModalSalir(true)}>
          <Icon name="logout" color="white" size={20} />
        </TouchableOpacity>

        {encuestaLista && preguntas.length > 0 && p ? (
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerEncuesta}>Encuesta #{p.IDENCUESTA}</Text>
              <Text style={styles.headerPregunta}>Pregunta {indicePregunta + 1} de {preguntas.length}</Text>
              <View style={styles.progressBg}>
                <Animated.View
                  style={[styles.progressFill, {
                    width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                  }]}
                />
              </View>
            </View>

            <View style={styles.cardContainer}>
              <View style={styles.card}>
                {p.TIPOPREGUNTA !== "OpcionesTabla" && p.TIPOPREGUNTA !== "TextoLista" && (
                  <Text style={styles.questionText}>{p.TEXTOPREGUNTA}</Text>
                )}
                {p.ISMANDATORY === "SI" && (
                  <View style={styles.mandatoryBadge}>
                    <Text style={styles.mandatoryText}>Obligatoria</Text>
                  </View>
                )}
                {renderAlternativas()}
              </View>
            </View>

            <View style={styles.navContainer}>
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnPrev, indicePregunta === 0 && styles.navBtnDisabled]}
                onPress={retrocederPregunta}
                disabled={indicePregunta === 0}
              >
                <Icon name="arrow-back" color="white" size={20} />
                <Text style={styles.navBtnText}>Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navBtn, esPreguntaFinal ? styles.navBtnSave : styles.navBtnNext, !avanzarBtn && styles.navBtnDisabled]}
                onPress={esPreguntaFinal ? alertGuardar : avanzarPregunta}
                disabled={!avanzarBtn}
              >
                <Text style={styles.navBtnText}>{esPreguntaFinal ? "Guardar" : "Siguiente"}</Text>
                <Icon name={esPreguntaFinal ? "save" : "arrow-forward"} color="white" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Sin preguntas disponibles</Text>
          </View>
        )}

        <Modal animationType="fade" transparent visible={modalSinGPS} onRequestClose={() => setModalSinGPS(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Icon name="gps-off" color="#B00020" size={48} />
              <Text style={[styles.modalTitle, { marginTop: 16 }]}>Sin ubicación GPS</Text>
              <Text style={[styles.modalSubtitle, { textAlign: "center", marginTop: 8 }]}>
                No se pudo obtener tu ubicación. Activa el GPS e intenta nuevamente.
              </Text>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#002645", marginTop: 20 }]}
                onPress={() => {
                  setModalSinGPS(false);
                  alertGuardar();
                }}
              >
                <Icon name="refresh" color="white" size={18} />
                <Text style={styles.modalBtnText}>Intentar de nuevo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#c0392b" }]}
                onPress={() => setModalSinGPS(false)}
              >
                <Icon name="close" color="white" size={18} />
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}