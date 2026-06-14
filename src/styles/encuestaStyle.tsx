import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  // Primarios
  primary:       "#002645",
  primaryMid:    "rgba(0, 38, 69, 0.55)",
  primaryLight:  "rgba(0, 38, 69, 0.12)",
  primaryBorder: "rgba(0, 38, 69, 0.25)",

  // Acento
  accent:        "#1565C0",
  accentLight:   "rgba(21, 101, 192, 0.15)",

  // Semánticos
  success:       "#1b7a40",
  successLight:  "rgba(27, 122, 64, 0.15)",
  danger:        "#c0392b",
  dangerLight:   "rgba(192, 57, 43, 0.12)",
  warning:       "#e67e22",

  // Neutrales
  white:         "#ffffff",
  offWhite:      "#f2f5f9",
  surface:       "#ffffff",
  surfaceAlt:    "#f7f9fc",
  inputBg:       "#eef1f6",
  border:        "rgba(0, 0, 0, 0.08)",
  borderMid:     "rgba(0, 0, 0, 0.14)",

  // Texto
  textDark:      "#0d1b2a",
  textMid:       "#4a5568",
  textLight:     "#9aa5b1",
  textOnDark:    "#ffffff",
  textOnDarkMid: "rgba(255,255,255,0.65)",

  // Sombra
  shadowColor:   "#000000",
};

// ─── Sombras reutilizables ────────────────────────────────────────────────────
const shadow = {
  sm: {
    shadowColor: C.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: C.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: C.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

const styles = StyleSheet.create({
  // ── Pantalla base ─────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: C.offWhite,
  },
  container: {
    flex: 1,
    paddingTop: 8,
  },

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  loadingText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ── Botón salir (esquina) ─────────────────────────────────────────────────
  exitBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    width: 46,
    height: 46,
    backgroundColor: C.danger,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    ...shadow.md,
  },

  // ── Badge modo editar ─────────────────────────────────────────────────────
  editBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.warning,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 999,
    ...shadow.sm,
  },
  editBadgeText: {
    color: C.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerEncuesta: {
    fontSize: 11,
    color: C.accent,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerPregunta: {
    fontSize: 20,
    fontWeight: "800",
    color: C.primary,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  progressBg: {
    width: "75%",
    height: 5,
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.accent,
    borderRadius: 10,
  },

  // ── Card pregunta ─────────────────────────────────────────────────────────
  cardContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    justifyContent: "center",
  },
  card: {
    backgroundColor: C.primary,
    borderRadius: 26,
    padding: 20,
    ...shadow.lg,
  },
  questionText: {
    color: C.textOnDark,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 25,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  mandatoryBadge: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  mandatoryText: {
    color: C.textOnDarkMid,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Inputs texto ──────────────────────────────────────────────────────────
  inputContainer: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  textInput: {
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: C.textDark,
    textAlign: "center",
    borderWidth: 1,
    borderColor: C.border,
    fontWeight: "500",
  },
  rangeHint: {
    textAlign: "center",
    color: C.danger,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  referenceHint: {
    textAlign: "center",
    color: C.textMid,
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 4,
  },
  extraInputContainer: {
    marginTop: 8,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: C.accentLight,
  },

  // ── Opciones (radio) ──────────────────────────────────────────────────────
  scrollOpciones: {
    backgroundColor: C.white,
    borderRadius: 16,
    maxHeight: 370,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: C.inputBg,
  },
  radioItemSelected: {
    backgroundColor: C.accentLight,
    borderRadius: 10,
  },
  radioLabel: {
    fontSize: 15,
    color: C.textDark,
    flex: 1,
    fontWeight: "400",
    lineHeight: 20,
  },

  // ── CheckList ─────────────────────────────────────────────────────────────
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: C.inputBg,
  },
  checkItemSelected: {
    backgroundColor: C.primaryLight,
    borderRadius: 10,
  },
  checkLabel: {
    fontSize: 15,
    color: C.textDark,
    flex: 1,
    lineHeight: 20,
  },

  // ── Imagen informativa ────────────────────────────────────────────────────
  imagenContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 10,
  },
  imagenHint: {
    color: C.textOnDarkMid,
    fontSize: 13,
    fontStyle: "italic",
  },

  // ── Foto ──────────────────────────────────────────────────────────────────
  fotoContainer: {
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  fotoPreview: {
    width: "100%",
    height: 190,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  fotoBtns: {
    width: "100%",
    gap: 10,
  },
  btnCamera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 14,
    paddingVertical: 13,
    ...shadow.sm,
  },
  btnCameraText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  btnVerFoto: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.success,
    borderRadius: 14,
    paddingVertical: 13,
    ...shadow.sm,
  },
  btnVerFotoText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // ── Tablas ────────────────────────────────────────────────────────────────
  tablaContainer: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: 370,
    borderWidth: 1,
    borderColor: C.border,
  },
  tablaHeader: {
    flexDirection: "row",
    backgroundColor: C.primaryLight,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: C.primaryBorder,
  },
  tablaColPregunta: {
    width: "45%",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tablaColOpciones: {
    width: "55%",
    flexDirection: "row",
  },
  tablaColOpcionesRow: {
    backgroundColor: C.primaryLight,
    borderLeftWidth: 1,
    borderColor: C.border,
  },
  tablaColItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    paddingVertical: 2,
  },
  tablaHeaderText: {
    fontWeight: "700",
    fontSize: 11,
    color: C.primary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  tablaRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: C.inputBg,
    alignItems: "center",
    minHeight: 46,
  },
  tablaRowText: {
    fontSize: 12,
    color: C.textDark,
    paddingHorizontal: 6,
    lineHeight: 17,
  },
  tablaRadioRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    alignItems: "center",
  },
  noDataText: {
    textAlign: "center",
    paddingVertical: 24,
    color: C.textLight,
    fontSize: 14,
    fontStyle: "italic",
  },

  // ── TextoLista inputs ─────────────────────────────────────────────────────
  listaInputItem: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  listaInputLabel: {
    fontWeight: "600",
    color: C.primary,
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  listaInput: {
    backgroundColor: C.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.textDark,
    textAlign: "center",
    borderWidth: 1,
    borderColor: C.border,
    fontWeight: "500",
  },

  // ── Navegación ────────────────────────────────────────────────────────────
  navContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 8,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 54,
    borderRadius: 18,
    ...shadow.md,
    backgroundColor: C.primaryMid,
  },
  navBtnPrev: {
    backgroundColor: C.primary,
  },
  navBtnNext: {
    backgroundColor: C.primary,
  },
  navBtnSave: {
    backgroundColor: C.success,
  },
  navBtnDisabled: {
    opacity: 0.35,
    elevation: 0,
  },
  navBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ── Modal Salir ───────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: C.white,
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    ...shadow.lg,
  },
  modalClose: {
    position: "absolute",
    top: -16,
    right: -16,
    width: 38,
    height: 38,
    backgroundColor: C.danger,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.md,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: C.primary,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: C.textMid,
    marginBottom: 22,
    textAlign: "center",
    lineHeight: 18,
  },
  modalBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 10,
    ...shadow.sm,
  },
  modalBtnText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ── Camera modal ──────────────────────────────────────────────────────────
  cameraModal: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 46,
    height: 46,
    backgroundColor: C.danger,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    ...shadow.md,
  },
  cameraView: {
    flex: 1,
    marginTop: 62,
  },
  cameraControls: {
    position: "absolute",
    bottom: 44,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  cameraShutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: C.white,
  },
  cameraShutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.white,
  },
  cameraFlip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  fotoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
  },
});

export default styles;