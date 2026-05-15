// SE-M3-02 — Consulta del enrolamiento del votante remoto.
//
// CONTRATO REAL (cuando esté integrado):
//   GET {SR-M3}/api/v1/lista-blanca/ciudadano/{ciudadanoId}
//   Headers: Authorization Bearer <token de sesión del módulo de auth>
//   Respuesta 200: DatosEnrolamientoRemoto
//   Respuesta 403: el ciudadano NO está en la lista blanca (no se enroló)
//   Respuesta 401: el token de sesión es inválido / expiró
//
// IMPLEMENTACIÓN ACTUAL (mock): devuelve datos simulados según el ciudadanoId.
// El switch al endpoint real se hace cuando:
//   1. GestionPreElectoral-service exponga la consulta por ciudadanoId.
//   2. El módulo de auth devuelva un ciudadanoId verificable a este componente.
// Mientras tanto, este mock permite demostrar la UX correcta:
// los datos críticos (email + circunscripción) NO los edita el usuario.

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

// Default visible para demo: el primer ciudadano habilitado.
// Cuando el módulo de auth esté integrado, este "id por defecto" se reemplaza
// por el ciudadanoId del contexto de sesión.
export const CIUDADANO_DEMO_DEFAULT = "ciudadano_demo_001";

export async function consultarEnrolamientoRemoto(
    ciudadanoId: string
): Promise<DatosEnrolamientoRemoto> {
    // Simulamos latencia leve para que la UI muestre estado de carga.
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
