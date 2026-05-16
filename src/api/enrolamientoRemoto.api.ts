// SE-M3-02 — Consulta del enrolamiento del votante remoto.
//
// El votanteId se toma del JWT de sesión (servicio de auth real ya existente
// en el proyecto). La consulta al enrolamiento sigue siendo MOCK hasta que
// GestionPreElectoral-service exponga el endpoint REST.
//
// CONTRATO REAL (cuando esté integrado):
//   GET {SR-M3}/api/v1/lista-blanca/ciudadano/{ciudadanoId}
//   Headers: Authorization: Bearer <jwt>
//   200: DatosEnrolamientoRemoto
//   403: no enrolado en lista blanca
//   401: token inválido / expirado

import type { DatosEnrolamientoRemoto } from "../types/enrolamientoRemoto";

const MOCK_ENROLADOS: Record<string, DatosEnrolamientoRemoto> = {
    ciudadano_demo_001: {
        ciudadanoId: "ciudadano_demo_001",
        nombreCiudadano: "Juliana Cárdenas Rivera",
        documentoEnmascarado: "CC ****-***-1234",
        emailCertificado: "juliana.cardenas@correo-certificado.gov.co",
        circunscripcionId: "BOGOTA-CIRC-01",
        circunscripcionNombre: "Bogotá D.C. — Circunscripción 1",
        estadoEnrolamiento: "HABILITADO",
        fechaEnrolamiento: "2026-03-12T10:24:00Z",
    },
    ciudadano_demo_002: {
        ciudadanoId: "ciudadano_demo_002",
        nombreCiudadano: "Andrés Felipe Mora",
        documentoEnmascarado: "CC ****-***-5678",
        emailCertificado: "afmora@correo-certificado.gov.co",
        circunscripcionId: "MEDELLIN-CIRC-02",
        circunscripcionNombre: "Medellín — Circunscripción 2",
        estadoEnrolamiento: "HABILITADO",
        fechaEnrolamiento: "2026-03-15T15:42:00Z",
    },
    ciudadano_demo_003: {
        ciudadanoId: "ciudadano_demo_003",
        nombreCiudadano: "Sara Beltrán",
        documentoEnmascarado: "CC ****-***-9012",
        emailCertificado: "sara.beltran@correo-certificado.gov.co",
        circunscripcionId: "EXTERIOR-MIAMI",
        circunscripcionNombre: "Exterior — Miami",
        estadoEnrolamiento: "PENDIENTE",
        fechaEnrolamiento: "2026-04-08T09:15:00Z",
    },
};

// Fallback para sesiones de demo cuando el JWT no trae ciudadanoId resoluble.
export const CIUDADANO_DEMO_DEFAULT = "ciudadano_demo_001";

export async function consultarEnrolamientoRemoto(
    ciudadanoId: string
): Promise<DatosEnrolamientoRemoto> {
    // Latencia simulada para que la UI muestre estado de carga.
    await new Promise((r) => setTimeout(r, 250));

    const datos = MOCK_ENROLADOS[ciudadanoId];
    if (!datos) {
        return {
            ciudadanoId,
            nombreCiudadano: "(desconocido)",
            documentoEnmascarado: "",
            emailCertificado: "",
            circunscripcionId: "",
            circunscripcionNombre: "",
            estadoEnrolamiento: "NO_REGISTRADO",
            fechaEnrolamiento: "",
        };
    }
    return datos;
}
