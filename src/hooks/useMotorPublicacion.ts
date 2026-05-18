// ── useMotorPublicacion ─────────────────────────────────────────────────────
// Encapsula toda la lógica de consumo de endpoints, polling y manejo de estado
// para el módulo de publicación electoral.
//
// Responsabilidades:
// - Polling /participacion cada 8 s con pausa en tab inactivo
// - Polling /estado cada 45 s
// - Fetch /resultados solo cuando estadoMotor transiciona a JORNADA_CERRADA_DIA
// - Limpia todos los intervalos en cleanup de useEffect
// - Distingue entre ERROR_RED y RESULTADOS_NO_DISPONIBLES_EN_JORNADA_ACTIVA
// - Preserva último dato conocido de participación ante errores de red

import { useState, useEffect, useRef, useCallback } from "react";
import {
    getParticipacion,
    getEstadoMotor,
    getResultadosParciales,
} from "../api/publicacion.api";
import type {
    ParticipacionPayload,
    ResultadosPayload,
    EstadoMotor,
    ErrorResultados,
} from "../types/publicacion";

const PARTICIPACION_INTERVAL_MS = 8_000;
const ESTADO_INTERVAL_MS = 45_000;

interface MotorPublicacionState {
    estadoMotor: EstadoMotor;
    falloSeguroActivo: boolean;
    participacion: ParticipacionPayload | null;
    resultados: ResultadosPayload | null;
    errorParticipacion: string | null;
    errorResultados: ErrorResultados;
    cargandoParticipacion: boolean;
    cargandoResultados: boolean;
    ultimaActualizacion: Date | null;
}

export function useMotorPublicacion() {
    const [state, setState] = useState<MotorPublicacionState>({
        estadoMotor: null,
        falloSeguroActivo: false,
        participacion: null,
        resultados: null,
        errorParticipacion: null,
        errorResultados: null,
        cargandoParticipacion: false,
        cargandoResultados: false,
        ultimaActualizacion: null,
    });

    // Refs for interval IDs so we can clear them
    const participacionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const estadoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Track previous estadoMotor to detect transitions
    const prevEstadoMotorRef = useRef<EstadoMotor>(null);

    // Track whether resultados have already been fetched for this CERRADA session
    const resultadosFetchedRef = useRef(false);

    // ── Fetch participación ───────────────────────────────────────────────────
    const fetchParticipacion = useCallback(async () => {
        setState((prev) => ({ ...prev, cargandoParticipacion: true }));
        try {
            const data = await getParticipacion();
            setState((prev) => ({
                ...prev,
                participacion: data,
                errorParticipacion: null,
                cargandoParticipacion: false,
                ultimaActualizacion: new Date(),
            }));
        } catch {
            // Preserve last known data — only set the error flag
            setState((prev) => ({
                ...prev,
                errorParticipacion: "ERROR_RED",
                cargandoParticipacion: false,
            }));
        }
    }, []);

    // ── Fetch estado del motor ────────────────────────────────────────────────
    const fetchEstado = useCallback(async () => {
        try {
            const data = await getEstadoMotor();
            setState((prev) => ({
                ...prev,
                estadoMotor: data.estado,
                falloSeguroActivo: data.falloSeguroActivo,
            }));
        } catch {
            // Silently fail — keep previous state
        }
    }, []);

    // ── Fetch resultados parciales ────────────────────────────────────────────
    const fetchResultados = useCallback(async () => {
        setState((prev) => ({ ...prev, cargandoResultados: true }));
        try {
            const data = await getResultadosParciales();
            setState((prev) => ({
                ...prev,
                resultados: data,
                errorResultados: null,
                cargandoResultados: false,
            }));
        } catch (err: unknown) {
            let errorType: ErrorResultados = "ERROR_RED";

            // Check if it's a 403 with the expected error code
            if (typeof err === "object" && err !== null && "response" in err) {
                const response = (
                    err as { response: { status: number; data?: { error?: string } } }
                ).response;
                if (
                    response.status === 403 &&
                    response.data?.error ===
                    "RESULTADOS_NO_DISPONIBLES_EN_JORNADA_ACTIVA"
                ) {
                    errorType = "RESULTADOS_NO_DISPONIBLES_EN_JORNADA_ACTIVA";
                }
            }

            setState((prev) => ({
                ...prev,
                errorResultados: errorType,
                cargandoResultados: false,
            }));
        }
    }, []);

    // ── Detect estadoMotor transitions → trigger resultados fetch ──────────
    useEffect(() => {
        const prevEstado = prevEstadoMotorRef.current;
        const currentEstado = state.estadoMotor;

        if (
            currentEstado === "JORNADA_CERRADA_DIA" &&
            prevEstado !== "JORNADA_CERRADA_DIA" &&
            !resultadosFetchedRef.current
        ) {
            resultadosFetchedRef.current = true;
            fetchResultados();
        }

        // Reset the flag when transitioning away from CERRADA
        if (
            currentEstado !== "JORNADA_CERRADA_DIA" &&
            prevEstado === "JORNADA_CERRADA_DIA"
        ) {
            resultadosFetchedRef.current = false;
        }

        prevEstadoMotorRef.current = currentEstado;
    }, [state.estadoMotor, fetchResultados]);

    // ── Polling setup + visibility handling ────────────────────────────────────
    useEffect(() => {
        async function initialize() {
            await fetchParticipacion();
            await fetchEstado();
            startPolling();
        }

        function startPolling() {
            // Clear any existing intervals before starting new ones
            if (participacionIntervalRef.current) {
                clearInterval(participacionIntervalRef.current);
            }
            if (estadoIntervalRef.current) {
                clearInterval(estadoIntervalRef.current);
            }

            participacionIntervalRef.current = setInterval(
                fetchParticipacion,
                PARTICIPACION_INTERVAL_MS
            );
            estadoIntervalRef.current = setInterval(
                fetchEstado,
                ESTADO_INTERVAL_MS
            );
        }

        function stopPolling() {
            if (participacionIntervalRef.current) {
                clearInterval(participacionIntervalRef.current);
                participacionIntervalRef.current = null;
            }
            if (estadoIntervalRef.current) {
                clearInterval(estadoIntervalRef.current);
                estadoIntervalRef.current = null;
            }
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                stopPolling();
            } else {
                // Re-fetch immediately on return, then resume interval
                fetchParticipacion();
                fetchEstado();
                startPolling();
            }
        }

        initialize();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchParticipacion, fetchEstado]);

    return state;
}
