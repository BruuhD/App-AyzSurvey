import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import styles from '../../src/styles/home-style';

interface IDS {
  IDENCUESTA: string;
}

interface Preguntas{
    IDENCUESTA: number;
    NROPREGUNTA:number;
    TIPOPREGUNTA:string;
    TEXTOPREGUNTA:string;
    VALORXDEFECTO:string;
    MAXLENGTH: string;
    ISMANDATORY: string;
    NROPREGUNTA_CONDICIONAL: string;
    VALUE_OPCIONES: string;
    ALIAS_REPORTE: string;
    TIPODATO: string;
    VALORMINIMO?: string;
    VALORMAXIMO?: string;
    NROOPCIONESCHECK:number;
    JERARQUIA : string;
    ISDECIMAL:string;
    FILTRO_VALOR:string,
    ORDENOPCIONESTABLA:string,
    ALEATORIO:string;
    NROMINIMOCHECK:number;
    REFERENCIA:string
}
interface Opciones{
    IDENCUESTA: number;
    NROPREGUNTA:number;
    NROOPCION:number;
    TEXTO_OPCION :string;
    VALUE_OPCION:string;
    NROPREGUNTADESTINO:string;
    FLAG_INGRESA_TEXTO:string;
    PREGUNTA_CONDICIONAL:string;
    VALOR_CONDICIONAL:string;
}

export default function Home() {
    const [titulo, setTitulo] = useState<any>({ titulo: '' });
    const [idsEncuestas, setIdsEncuestas] = useState<string[]>([]);
    const [modalEncuestas, setModalEncuestas] = useState(false);
    const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
    const [modalGenerando, setModalGenerando] = useState(false);
    const [modalMsg, setModalMsg] = useState(false);
    const [msgTexto, setMsgTexto] = useState('');
    const cargando = useRef(false);
    const mostrarMensaje = (texto: string) => {
        setModalGenerando(false);

        setTimeout(() => {
            setMsgTexto(texto);
            setModalMsg(true);
        }, 300);
    };

    useEffect(() => {
        obtenerTitulo();
        obtenerIds();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandler.remove();
    }, []);

    const handleBackPress = () => {
        Alert.alert(
        'Salir de la aplicación',
        '¿Desea cerrar la aplicación?',
        [
            {
            text: 'No',
            onPress: () => null,
            style: 'cancel'
            },
            {
            text: 'Sí',
            onPress: () => BackHandler.exitApp()
            }
        ]
        );
        return true;
    };

    const obtenerIds = async () => {
        const ids = await AsyncStorage.getItem('AYZ-preguntas');
        if (ids) {
            const distinctID: IDS[] = JSON.parse(ids);
            const idsEncuestaUnicos = [...new Set(distinctID.map(p => p.IDENCUESTA))];
            setIdsEncuestas(idsEncuestaUnicos);
        }
    }

    const obtenerTitulo = async () => {
        const tituloApp = await AsyncStorage.getItem('AYZ-tituloAPP');
        if (tituloApp) {
        setTitulo(JSON.parse(tituloApp));
        } else {
        setTitulo({ titulo: 'AyZ Investigadores y Consultores en Mercadeo SAC' });
        }
    }

    const handleCerrarSesion = () => {
        setModalCerrarSesion(false);
        router.replace('/');
    }

    const validarGPSYObtenerUbicacion = async (idEncuesta: string) => {
        if (cargando.current) return;
        cargando.current = true;

        setModalEncuestas(false);

        try {
            let { status } = await Location.getForegroundPermissionsAsync();

            if (status !== 'granted') {
                const req = await Location.requestForegroundPermissionsAsync();
                status = req.status;

                if (status !== 'granted') {
                    mostrarMensaje('Debes permitir el acceso a la ubicación para continuar.');
                    return;
                }
            }

            const provider = await Location.getProviderStatusAsync();
            if (!provider.locationServicesEnabled) {
                mostrarMensaje('Tu GPS está desactivado. Actívalo e intenta nuevamente.');
                return;
            }

            setModalGenerando(true);

            const location = await Promise.race([
                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('TIMEOUT')), 12000)
                ),
            ]);

            const pre = await AsyncStorage.getItem('AYZ-preguntas');
            const op  = await AsyncStorage.getItem('AYZ-preguntas-opciones');

            if (pre) {
                const preg: Preguntas[] = JSON.parse(pre);
                const pregu = preg.filter(x => x.IDENCUESTA === Number(idEncuesta));
                await AsyncStorage.setItem('AYZ-preguntas-filtradas', JSON.stringify(pregu));
            }

            if (op) {
                const opc: Opciones[] = JSON.parse(op);
                const opci = opc.filter(x => x.IDENCUESTA === Number(idEncuesta));
                await AsyncStorage.setItem('AYZ-opciones-filtradas', JSON.stringify(opci));
            }

            setModalGenerando(false);
            await AsyncStorage.removeItem('AYZ-edit');
            router.push({
                pathname: '/encuesta/encuesta',
                params: {
                    id: idEncuesta,
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                }
            });

        } catch (e) {
            setModalGenerando(false);

            if (String((e as any)?.message).includes('TIMEOUT')) {
                mostrarMensaje('No se pudo obtener la ubicación. Activa tu GPS y reintenta.');
                return;
            }

            mostrarMensaje('Error obteniendo ubicación.');
            console.error(e);

        } finally {
            cargando.current = false;
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/FondoLogin.png')}
                style={styles.imgFondo}
            >
                <Text style={styles.titulo}>{titulo.titulo}</Text>
            </ImageBackground>

            <View style={styles.contenidoPrincipal}>
                <View style={styles.contenedor}>
                    <View style={styles.contenedorTexto}>
                        <Text style={styles.textoContenedor}>
                            Comenzar Encuesta de AyZ-Survey
                        </Text>
                        <TouchableOpacity 
                            style={styles.botonPlay}
                            onPress={() => setModalEncuestas(true)}
                        >
                            <MaterialIcons name="start" size={36} color="#fff" /> 
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contenedorImagen}>
                        <Image 
                            source={require('../../assets/images/encuesta.png')}
                            style={styles.imagen}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <View style={styles.contenedor}>
                    <View style={styles.contenedorImagen}>
                        <Image 
                            source={require('../../assets/images/config.png')}
                            style={styles.imagen}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.contenedorBotones}>
                        <TouchableOpacity style={styles.botonOpcion}
                            onPress={() => router.push('/encuestaGuardada/encuestaGuardada')}>
                            
                            <Text style={styles.textoBotonOpcion}>ENCUESTAS GUARDADAS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.botonOpcion}>
                            <Text style={styles.textoBotonOpcion}>FOTOS GUARDADAS</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.botonCerrarSesion}
                    onPress={() => setModalCerrarSesion(true)}
                >
                    <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
                    <MaterialIcons name="logout" size={24} color="#002645" />
                </TouchableOpacity>
            </View>

            <Modal
                isVisible={modalEncuestas}
                animationIn="zoomIn"
                animationOut="zoomOut"
                style={{ margin: 0 }}
                backdropOpacity={0.3}
                onBackdropPress={() => setModalEncuestas(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContenido}>
                        <Text style={styles.modalTitulo}>Encuestas Disponibles</Text>
                        <View style={styles.modalLista}>
                            {idsEncuestas.length > 0 ? (
                                idsEncuestas.map((id) => (
                                    <TouchableOpacity 
                                        key={id}
                                        style={styles.itemEncuesta}
                                        onPress={() => validarGPSYObtenerUbicacion(id)}
                                    >
                                        <Text style={styles.textoItemEncuesta}>Encuesta ID: {id}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.textoSinEncuestas}>No hay encuestas disponibles</Text>
                            )}
                        </View>
                        <TouchableOpacity 
                            style={styles.botonCerrarModal}
                            onPress={() => setModalEncuestas(false)}
                        >
                            <Text style={styles.textoCerrarModal}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                isVisible={modalCerrarSesion}
                animationIn="zoomIn"
                animationOut="zoomOut"
                style={{ margin: 0 }}
                backdropOpacity={0.3}
                onBackdropPress={() => setModalCerrarSesion(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalConfirmacion}>
                        <Text style={styles.modalTituloConfirmacion}>¿Desea cerrar sesión?</Text>
                            <View style={styles.botonesConfirmacion}>
                                <TouchableOpacity 
                                    style={[styles.botonConfirmacion, styles.botonNo]}
                                    onPress={() => setModalCerrarSesion(false)}
                                >
                                    <Text style={styles.textoBotonConfirmacion}>No</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.botonConfirmacion, styles.botonSi]}
                                    onPress={handleCerrarSesion}
                                >
                                    <Text style={styles.textoBotonConfirmacion}>Sí</Text>
                                </TouchableOpacity>
                            </View>
                    </View>
                </View>
            </Modal>

            <Modal
                isVisible={modalGenerando}
                animationIn="zoomIn"
                animationOut="zoomOut"
                style={{ margin: 0 }}
                backdropOpacity={0.3}
                backdropTransitionOutTiming={0}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalGenerando}>
                    <MaterialIcons name="location-searching" size={48} color="#002645" />
                    <Text style={styles.modalGenerandoTitulo}>Generando encuesta</Text>
                    <Text style={styles.modalGenerandoTexto}>
                        Validando ubicación y GPS…
                    </Text>
                    </View>
                </View>
            </Modal>
            
            <Modal
                isVisible={modalMsg}
                animationIn="zoomIn"
                animationOut="zoomOut"
                style={{ margin: 0 }}
                backdropOpacity={0.3}
                onBackdropPress={() => setModalMsg(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={{
                    backgroundColor: '#fff',
                    padding: 20,
                    borderRadius: 12,
                    width: '85%',
                    alignItems: 'center'
                    }}>
                    <MaterialIcons name="gps-off" size={42} color="#B00020" />
                    <Text style={{ marginTop: 12, textAlign: 'center' }}>
                        {msgTexto}
                    </Text>

                    <TouchableOpacity
                        style={{
                            marginTop: 20,
                            backgroundColor: '#002645',
                            paddingVertical: 10,
                            paddingHorizontal: 30,
                            borderRadius: 8
                        }}
                        onPress={() => {
                            setModalMsg(false);
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Entendido</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}