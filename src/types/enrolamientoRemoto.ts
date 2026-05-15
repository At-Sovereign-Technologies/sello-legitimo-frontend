// SE-M3-02 — Datos del enrolamiento previo a votación remota.
// Origen real (cuando exista la integración): GestionPreElectoral-service / Lista Blanca.
// Hoy: mock local que devuelve datos según el ciudadano autenticado.

export interface DatosEnrolamientoRemoto {
    ciudadanoId: string;
    nombreCiudadano: string;
    documentoEnmascarado: string;
    emailCertificado: string;
    circunscripcionId: string;
    circunscripcionNombre: string;
    estadoEnrolamiento: "HABILITADO" | "PENDIENTE" | "RECHAZADO" | "NO_REGISTRADO";
    fechaEnrolamiento: string;
}
