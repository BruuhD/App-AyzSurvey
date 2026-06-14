import { Dimensions, StyleSheet } from "react-native";

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  imgFondo: {
    width: '100%',
    height: 350,
    top: -10,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },

  contenidoPrincipal: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
    gap:20,
    paddingBottom: 30,
  },

  contenedor: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  contenedorTexto: {
  flex: 1,
  paddingRight: 15,
  justifyContent: 'center', 
  alignItems: 'center', 
},

  contenedorBotones: {
    flex: 1,
    gap: 12,
  },

  textoContenedor: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002645',
    marginBottom: 15,
    lineHeight: 20,
    textAlign:'center'
  },

  botonPlay: {
    backgroundColor: '#002645',
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contenedorImagen: {
    flex:1,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imagen: {
    width: '100%',
    height: '100%',
  },

  botonOpcion: {
    backgroundColor: '#002645',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50, 
  },

  textoBotonOpcion: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign:'center'
  },

  botonCerrarSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#002645',
    gap: 10,
    marginTop: 10,
  },

  textoCerrarSesion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002645',
  },

  // Estilos de modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.09)', 
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContenido: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    width: width * 0.85,
    maxHeight: height * 0.7,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002645',
    marginBottom: 20,
    textAlign: 'center',
  },

  modalLista: {
    maxHeight: height * 0.5,
  },

  itemEncuesta: {
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#002645',
  },

  textoItemEncuesta: {
    fontSize: 16,
    color: '#002645',
    fontWeight: '600',
  },

  textoSinEncuestas: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 30,
  },

  botonCerrarModal: {
    backgroundColor: '#002645',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  textoCerrarModal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  modalConfirmacion: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 30,
    width: width * 0.8,
  },

  modalTituloConfirmacion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002645',
    marginBottom: 25,
    textAlign: 'center',
  },

  botonesConfirmacion: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
  },

  botonConfirmacion: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  botonNo: {
    backgroundColor: '#9e9e9e',
  },

  botonSi: {
    backgroundColor: '#002645',
  },

  textoBotonConfirmacion: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalGenerando: {
  backgroundColor: '#fff',
  padding: 24,
  borderRadius: 16,
  alignItems: 'center',
  width: '80%',
},

modalGenerandoTitulo: {
  fontSize: 18,
  fontWeight: '700',
  marginTop: 12,
  color: '#002645',
},

modalGenerandoTexto: {
  marginTop: 8,
  fontSize: 14,
  color: '#555',
  textAlign: 'center',
},

});

export default styles;