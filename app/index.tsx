import { obtenerOpciones, obtenerPreguntas, obtenerRutas, obtenerTitulo, validarLogin } from "@/src/api/service";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ImageBackground, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from '../src/styles/index';

const STORAGE_USER       = 'AYZ-user';
const STORAGE_PASS       = 'AYZ-password';
const STORAGE_REMEMBER   = 'AYZ-recordarUser';
const STORAGE_PRIMER_LOGIN = 'AYZ-primerLogin';
const STORAGE_BASE_URL   = 'AYZ_BASE_URL';
const STORAGE_ENCUESTAS = 'AYZ-encuestas';
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1g40nHDW7P9NGmg7ZWFfOCDripceEGT4kAGAthdELGS8/gviz/tq?sheet=Hoja%201&tqx=out:json';
export default function Index() {

    const [usuario, setUsuario]               = useState('');
    const [clave, setClave]                   = useState('');
    const [recordarUsuario, setRecordarUsuario] = useState(false);
    const [modalVisible, setModalVisible]     = useState(false);
    const [loading, setLoading]               = useState(false);
    const [syncVisible, setSyncVisible]       = useState(false);
    const [syncProgress, setSyncProgress]     = useState(0);
    const [syncMessage, setSyncMessage]       = useState('');

    const [modalEncuestasVisible, setModalEncuestasVisible] = useState(false);
    const [encuestasPendientesCount, setEncuestasPendientesCount] = useState(0);
    const resolverAlertRef = useRef<((val: boolean) => void) | null>(null);

    useEffect(() => {
        cargarCredenciales();
        actualizarUrlDesdeSheet();  
    }, []);

    const cargarCredenciales = async () => {
        try {
            const recordar = await AsyncStorage.getItem(STORAGE_REMEMBER);
            if (recordar !== 'true') return;

            const usuarioGuardado = await AsyncStorage.getItem(STORAGE_USER);
            const claveGuardada   = await AsyncStorage.getItem(STORAGE_PASS);

            if (usuarioGuardado) setUsuario(usuarioGuardado);
            if (claveGuardada)   setClave(claveGuardada);
            setRecordarUsuario(true);
        } catch {
           
        }
    };

    const actualizarUrlDesdeSheet = async () => {
        try {
            const res  = await fetch(SHEET_URL);
            const text = await res.text();
            const json = JSON.parse(
                text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
            );
            const nuevaUrl = json.table.rows[0]?.c[0]?.v;
            if (nuevaUrl) {
                await AsyncStorage.setItem(STORAGE_BASE_URL, nuevaUrl);
            }
        } catch {
            
        }
    };

    const loginLocal = async (usr: string, pass: string) => {
        try {
            const userLocal = await AsyncStorage.getItem(STORAGE_USER);
            const passLocal = await AsyncStorage.getItem(STORAGE_PASS);

            if (usr === userLocal && pass === passLocal) {
                router.replace('/home/home');
                actualizarUrlDesdeSheet();
            } else {
                Alert.alert('Error', 'Credenciales incorrectas');
            }
        } catch {
            Alert.alert('Error', 'No se pudieron leer las credenciales locales');
        }
    };

    const loginServidor = async (usr: string, pass: string): Promise<boolean> => {
        setLoading(true);
        setSyncMessage('Validando credenciales...');
        try {
            const res = await validarLogin(usr, pass);

            if (!res.ok) {
                Alert.alert('Acceso denegado', res.msg);
                return false;
            }
            return true;
        } finally {
            setLoading(false); 
        }
    };

    const persistirCredenciales = async (usr: string, pass: string) => {
        await AsyncStorage.setItem(STORAGE_USER, usr);
        await AsyncStorage.setItem(STORAGE_PASS, pass);
        await AsyncStorage.setItem(STORAGE_REMEMBER, recordarUsuario.toString());
    };

    const sincronizarServidor = async () => {
        const dniGuardado = (await AsyncStorage.getItem(STORAGE_USER)) ?? usuario;

        // 1. Verificar encuestas — modal confirmación sigue abierto
        const encStr = await AsyncStorage.getItem(STORAGE_ENCUESTAS);
        const encGuardadas = encStr ? JSON.parse(encStr) : [];

        if (encGuardadas.length > 0) {
            setEncuestasPendientesCount(encGuardadas.length);
            const continuar = await new Promise<boolean>((resolve) => {
                resolverAlertRef.current = resolve;
                setModalEncuestasVisible(true);
            });
            if (!continuar) return; 
        }

        setModalVisible(false);
        await ejecutarSincronizacion(dniGuardado);
    };

    const ejecutarSincronizacion = async (dni: string) => {
        try {
            setSyncVisible(true);
            setSyncProgress(5);
            setSyncMessage('Leyendo configuración remota...');

            try {
                const res = await fetch(SHEET_URL);
                const text = await res.text();
                const json = JSON.parse(
                    text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
                );
                const nuevaUrl = json.table.rows[0]?.c[0]?.v;
                if (nuevaUrl) await AsyncStorage.setItem(STORAGE_BASE_URL, nuevaUrl);
            } catch {
                const urlGuardada = await AsyncStorage.getItem(STORAGE_BASE_URL);
                if (!urlGuardada) {
                    setSyncVisible(false);
                    Alert.alert('Error de sincronización', 'No se pudo obtener la configuración del servidor.');
                    return;
                }
            }

            setSyncProgress(10);
            setSyncMessage('Descargando configuración...');
            if (!(await obtenerTitulo()))       throw new Error('Error títulos');

            setSyncProgress(30);
            setSyncMessage('Descargando rutas...');
            if (!(await obtenerRutas(dni)))     throw new Error('Error rutas');

            setSyncProgress(55);
            setSyncMessage('Descargando preguntas...');
            if (!(await obtenerPreguntas(dni))) throw new Error('Error preguntas');

            const preguntasStr = await AsyncStorage.getItem('AYZ-preguntas');
            if (preguntasStr) {
                const preguntas = JSON.parse(preguntasStr);
                const idsNuevos = [...new Set(preguntas.map((p: any) => p.IDENCUESTA))] as number[];
                const encStr = await AsyncStorage.getItem(STORAGE_ENCUESTAS);
                if (encStr) {
                    const encGuardadas = JSON.parse(encStr);
                    const encFiltradas = encGuardadas.filter((e: any) => idsNuevos.includes(e.IDENCUESTA));
                    await AsyncStorage.setItem(STORAGE_ENCUESTAS, JSON.stringify(encFiltradas));
                }
            }
            
            setSyncProgress(80);
            setSyncMessage('Descargando opciones...');
            if (!(await obtenerOpciones(dni)))  throw new Error('Error opciones');

            setSyncProgress(100);
            setSyncMessage('Sincronización completa');

            setTimeout(() => {
                setSyncVisible(false);
                router.replace('/home/home');
            }, 800);

        } catch {
            setSyncVisible(false);
            Alert.alert('Sincronización fallida', 'No se pudieron descargar todos los datos');
        }
    };

    const handleLogin = async () => {
        if (!usuario.trim()) {
            Alert.alert('Validación', 'Debe ingresar el usuario');
            return;
        }
        if (!clave.trim()) {
            Alert.alert('Validación', 'Debe ingresar la contraseña');
            return;
        }

        try {
            const primerLogin = await AsyncStorage.getItem(STORAGE_PRIMER_LOGIN);

            if (primerLogin === 'true') {
                await loginLocal(usuario, clave);
                return;
            }

            const ok = await loginServidor(usuario, clave);
            if (!ok) return;

            await AsyncStorage.setItem(STORAGE_PRIMER_LOGIN, 'true');
            await persistirCredenciales(usuario, clave);
            await ejecutarSincronizacion(usuario);

        } catch {
            Alert.alert('Error', 'Ocurrió un error inesperado. Intente nuevamente.');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                source={require('../assets/images/FondoLogin.png')}
                style={styles.imgFondo}
            />

            <TouchableOpacity
                style={styles.syncButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="sync" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.areaForm}>
                <Text style={styles.formTitulo}>AyZ-Survey</Text>

                <TextInput
                    style={styles.formUser}
                    placeholder="USUARIO"
                    placeholderTextColor="white"
                    value={usuario}
                    onChangeText={setUsuario}
                />

                <TextInput
                    style={styles.formPassword}
                    placeholder="CONTRASEÑA"
                    placeholderTextColor="white"
                    secureTextEntry
                    value={clave}
                    onChangeText={setClave}
                />

                <View style={styles.formCheckBox}>
                    <Text style={styles.formCheckText}>Recordar Usuario</Text>
                    <Checkbox
                        value={recordarUsuario}
                        onValueChange={async (value) => {
                            setRecordarUsuario(value);
                            await AsyncStorage.setItem(STORAGE_REMEMBER, value.toString());
                        }}
                    />
                </View>

                <TouchableOpacity style={styles.formButton} onPress={handleLogin}>
                    <Text style={styles.formButtonText}>INICIAR SESIÓN</Text>
                </TouchableOpacity>
            </View>

            {/* Copyright */}
            <View style={styles.copyrightContainer}>
                <Text style={styles.copyrightText}>© 2026 AyZ-Survey</Text>
                <Text style={styles.copyrightSubtext}>Todos los derechos reservados</Text>
            </View>

            {/* Modal: sincronización manual */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Ionicons name="cloud-upload-outline" size={50} color="#155f81" />
                        <Text style={styles.modalTitle}>Sincronización</Text>
                        <Text style={styles.modalText}>
                            Presiona el botón para vincular y sincronizar los datos con el servidor
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={sincronizarServidor}
                        >
                            <Ionicons name="sync" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.modalButtonText}>Sincronizar Ahora</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal: validando credenciales */}
            <Modal transparent visible={loading} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.loadingModalContent}>
                        <View style={styles.loadingSpinner}>
                            <Ionicons name="lock-closed" size={40} color="#155f81" />
                        </View>
                        <Text style={styles.loadingTitle}>Validando Credenciales</Text>
                        <Text style={styles.loadingSubtext}>{syncMessage}</Text>
                        <View style={styles.loadingDotsContainer}>
                            <View style={styles.loadingDot} />
                            <View style={styles.loadingDot} />
                            <View style={styles.loadingDot} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal: sincronización con progreso */}
            <Modal transparent visible={syncVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.syncModalContent}>

                        <View style={styles.syncIconContainer}>
                            <Ionicons name="cloud-download" size={60} color="#155f81" />
                        </View>

                        <Text style={styles.syncTitle}>Sincronizando Datos</Text>
                        <Text style={styles.syncMessage}>{syncMessage}</Text>

                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${syncProgress}%` }]}>
                                {syncProgress > 10 && (
                                    <Text style={styles.progressBarText}>{syncProgress}%</Text>
                                )}
                            </View>
                        </View>

                        <Text style={styles.progressPercentage}>{syncProgress}% completado</Text>

                        <View style={styles.stepsContainer}>
                            {[10, 30, 55, 100].map((step, i, arr) => (
                                <React.Fragment key={`fragment-${step}`}>
                                    <View style={[
                                        styles.stepIndicator,
                                        syncProgress >= step && styles.stepActive
                                    ]}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color={syncProgress >= step ? "#155f81" : "#ccc"}
                                        />
                                    </View>

                                    {i < arr.length - 1 && (
                                        <View
                                            style={[
                                                styles.stepLine,
                                                syncProgress >= arr[i + 1] && styles.stepLineActive
                                            ]}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </View>

                    </View>
                </View>
            </Modal>

            {/* Modal: alerta de encuestas existentes */}
            <Modal transparent visible={modalEncuestasVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={{
                        backgroundColor: 'white',
                        borderRadius: 24,
                        padding: 28,
                        width: '85%',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                        elevation: 10,
                    }}>
                        <View style={{
                            width: 64, height: 64, borderRadius: 32,
                            backgroundColor: '#fff7ed',
                            alignItems: 'center', justifyContent: 'center',
                            marginBottom: 16,
                        }}>
                            <Ionicons name="warning-outline" size={32} color="#d97706" />
                        </View>
                        <Text style={{
                            fontSize: 18, fontWeight: '800',
                            color: '#002645', marginBottom: 10, textAlign: 'center',
                        }}>
                            Encuestas sin enviar
                        </Text>
                        <Text style={{
                            fontSize: 14, color: '#475569',
                            textAlign: 'center', lineHeight: 22, marginBottom: 24,
                        }}>
                            Tienes <Text style={{ fontWeight: '800', color: '#d97706' }}>
                                {encuestasPendientesCount}
                            </Text> encuesta{encuestasPendientesCount !== 1 ? 's' : ''} guardada{encuestasPendientesCount !== 1 ? 's' : ''} que se perderán al sincronizar.{'\n'}¿Deseas continuar?
                        </Text>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#dc2626',
                                width: '100%', height: 48,
                                borderRadius: 14,
                                alignItems: 'center', justifyContent: 'center',
                                marginBottom: 10,
                            }}
                            onPress={() => {
                                setModalEncuestasVisible(false);
                                resolverAlertRef.current?.(true);
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                                Sí, sincronizar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                width: '100%', height: 48,
                                borderRadius: 14,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: '#f1f5f9',
                            }}
                            onPress={() => {
                                setModalEncuestasVisible(false);
                                resolverAlertRef.current?.(false);
                            }}
                        >
                            <Text style={{ color: '#475569', fontWeight: '700', fontSize: 15 }}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}