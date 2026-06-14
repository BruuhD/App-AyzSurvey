import { StyleSheet } from "react-native";

export const C = {
  navy:       "#002645",
  navyLight:  "#003a6b",
  teal:       "#0891b2",
  green:      "#059669",
  greenLight: "#d1fae5",
  amber:      "#d97706",
  amberLight: "#fef3c7",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  gris:       "#f1f5f9",
  grisMedio:  "#e2e8f0",
  grisOscuro: "#94a3b8",
  texto:      "#0f172a",
  textoSuave: "#475569",
  blanco:     "#ffffff",
  slate:      "#334155",
};

export const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: C.navy,
  },
  bodyArea: {
    flex: 1,
    backgroundColor: C.gris,
  },

  // ── Header ──
  header: {
    backgroundColor: C.navy,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: "900",
    color: C.blanco,
    letterSpacing: -0.5,
  },
  headerSubtitulo: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
    marginTop: 2,
  },
  botonCerrar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  // ── Dashboard row ──
  dashRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },

  // ── Dona chart container ──
  donaContainer: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  donaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  donaLeyenda: {
    gap: 4,
    marginTop: 8,
    width: "100%",
  },
  donaLeyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  donaLeyendaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  donaLeyendaTexto: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    flex: 1,
  },
  donaLeyendaNum: {
    fontSize: 10,
    color: C.blanco,
    fontWeight: "800",
  },

  // ── Gauge container ──
  gaugeContainer: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  gaugeSubInfo: {
    marginTop: 6,
    gap: 3,
    width: "100%",
  },
  gaugeSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gaugeSubTexto: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
  },
  gaugeSubValor: {
    fontSize: 10,
    color: C.blanco,
    fontWeight: "700",
  },
  gaugeAlerta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(220,38,38,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  gaugeAlertaTexto: {
    color: "#fca5a5",
    fontSize: 10,
    fontWeight: "700",
  },

  // ── Scroll content ──
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // ── Botón enviar todas ──
  botonEnviarTodas: {
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  botonEnviarTodasTexto: {
    color: C.blanco,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // ── Sección label ──
  seccionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.grisOscuro,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 2,
  },

  // ── Encuesta card ──
  encuestaCard: {
    backgroundColor: C.blanco,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.grisMedio,
  },
  encuestaCardBorde: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  encuestaCardInner: {
    paddingLeft: 16,
    paddingRight: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  encuestaCardLeft: {
    flex: 1,
    gap: 4,
  },
  encuestaCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  encuestaNroTexto: {
    fontSize: 11,
    fontWeight: "800",
    color: C.grisOscuro,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgeEstado: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeEstadoTexto: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  encuestaCodigo: {
    fontSize: 13,
    fontWeight: "700",
    color: C.texto,
    letterSpacing: -0.2,
  },
  encuestaMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  encuestaMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  encuestaMetaTexto: {
    fontSize: 11,
    color: C.textoSuave,
  },
  encuestaCardRight: {
    paddingLeft: 8,
  },

  // ── Acciones ──
  accionesContainer: {
    borderTopWidth: 1,
    borderTopColor: C.grisMedio,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 8,
  },
  botonAccion: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  botonAccionTexto: {
    color: C.blanco,
    fontWeight: "700",
    fontSize: 12,
  },

  // ── Loading overlay ──
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: C.blanco,
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    width: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  loadingTitulo: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: C.texto,
  },
  loadingSubtitulo: {
    marginTop: 6,
    fontSize: 13,
    color: C.textoSuave,
  },
  loadingBarraBg: {
    width: "100%",
    height: 6,
    backgroundColor: C.grisMedio,
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  loadingBarraFill: {
    height: "100%",
    backgroundColor: C.green,
    borderRadius: 3,
  },

  // ── Empty ──
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.grisMedio,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitulo: {
    color: C.texto,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitulo: {
    color: C.textoSuave,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});