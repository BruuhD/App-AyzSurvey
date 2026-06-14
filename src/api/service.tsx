import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

interface LoginResult {
  ok: boolean;
  msg: string;
  codigo?: number;
  data?: any;
}


let api: AxiosInstance | null = null;

export const getApi = async (): Promise<AxiosInstance> => {
  if (api) return api;

  const enlace = await AsyncStorage.getItem('AYZ-enlace');

  api = axios.create({
    baseURL: enlace || 'https://mdkm2tdg-50123.brs.devtunnels.ms/',
    timeout: 90000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return api;
};

export const obtenerTitulo = async (): Promise<boolean> => {
  try {
    const api = await getApi();
    const response = await api.get('/titulo');
    await AsyncStorage.setItem('AYZ-tituloAPP', JSON.stringify(response.data));
    return true;
  } catch {
    return false;
  }
};

export const obtenerPreguntas = async (dni: string): Promise<boolean> => {
  try {
    const api = await getApi();
    const response = await api.get('/preguntas-app', { params: { dni } });

    await AsyncStorage.setItem(
      'AYZ-preguntas',
      JSON.stringify(response.data?.data ?? [])
    );
    console.log('[PREGUNTAS]', response.data?.msg);
    return true;

  } catch (error) {
    return false;
  }
};

export const validarLogin = async ( user: string,  password: string): Promise<LoginResult> => {
  try {
    const api = await getApi();
    const response = await api.post('/login', {
      username: user,
      password,
    });
    return response.data;

  } catch (error: any) {
    
    if (error.response && error.response.data) {
      return error.response.data; 
    }

    return {
      ok: false,
      msg: 'Error de conexión con el servidor',
    };
  }
};

export const obtenerRutas = async (userDNI: string): Promise<boolean> => {
  try {
    const api = await getApi();

    const response = await api.get('/ruting', {
      params: { userDNI },
    });

    console.log('[RUTING]', response.data?.msg);

    await AsyncStorage.setItem(
      'AYZ-rutas',
      JSON.stringify(response.data?.data ?? [])
    );


    return true;

  } catch (error) {
    return false;
  }
};

export const obtenerOpciones = async (dni: string): Promise<boolean> => {
  try {
    const api = await getApi();

    const response = await api.get('/preguntas-opciones', { params: { dni } });
    console.log('[OPCIONES]', response.data?.msg);
    await AsyncStorage.setItem(
      'AYZ-preguntas-opciones',
      JSON.stringify(response.data?.data ?? [])
    );
    return true;

  } catch (error) {
    return false;
  }
};

export const enviarEncuestaAPI = async (encuesta: any): Promise<boolean> => {
  try {
    const api = await getApi();
    //console.log("[ENVIAR] Enviando a:", (await getApi()).defaults.baseURL + 'enviar-encuesta-app');
    const response = await api.post('/enviar-encuesta-app', encuesta);
    //console.log("[ENVIAR] Respuesta:", JSON.stringify(response.data, null, 2));
    return response.data?.ok === true;
  } catch (error: any) {
    //console.log("[ENVIAR] Error:", error?.message);
    //console.log("[ENVIAR] Detalle:", JSON.stringify(error?.response?.data, null, 2));
    return false;
  }
};