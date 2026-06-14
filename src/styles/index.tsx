import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

  imgFondo: {
    width: '100%',
    height: 350,
    top:-10,
    resizeMode: 'cover',
  },

  areaForm: {
    position: 'absolute',
    top: 220,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },

  formTitulo: {
    top:-50,
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 30,
  },

  formUser: {
    backgroundColor: '#155f81',
    width: '75%',
    top:40,
    height: 50,
    borderRadius: 25,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  formPassword: {
    backgroundColor: '#155f81',
    width: '75%',
    height: 50,
    top:40,
    borderRadius: 25,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  formCheckBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    top:40,
    gap: 10,
  },

  formCheckText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002645',
  },

  formButton: {
    backgroundColor: '#002645',
    width: '75%',
    height: 52,
    top:40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, 
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },

  formButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  // Agrega estos estilos al final de tu StyleSheet.create({...})

  syncButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#155f81',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002645',
    marginTop: 15,
    marginBottom: 10,
  },

  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },

  modalButton: {
    backgroundColor: '#155f81',
    width: '100%',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  modalCloseButton: {
    padding: 10,
  },

  modalCloseText: {
    color: '#155f81',
    fontSize: 16,
    fontWeight: '600',
  },

  copyrightContainer: {
    position: 'absolute',
    top: 800,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, 
  },

  copyrightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155f81',
    marginBottom: 4,
  },

  copyrightSubtext: {
    fontSize: 12,
    color: '#7a9fb5',
    fontWeight: '400',
  },

  loadingModalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 35,
    width: '80%',
    alignItems: 'center',
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },

  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#002645',
    marginBottom: 10,
    textAlign: 'center',
  },

  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  loadingDotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#155f81',
  },
  syncModalContent: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    width: '88%',
    alignItems: 'center',
    elevation: 10,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },

  syncIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  syncTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002645',
    marginBottom: 15,
  },

  syncMessage: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    minHeight: 20,
  },

  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#e8f4f8',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#155f81',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  progressBarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },

  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#155f81',
    marginBottom: 20,
  },

  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },

  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepActive: {
    backgroundColor: '#e8f4f8',
  },

  stepLine: {
    height: 3,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },

  stepLineActive: {
    backgroundColor: '#155f81',
  },
});




export default styles;
