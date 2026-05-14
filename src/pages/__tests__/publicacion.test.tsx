// ── Tests: Módulo de Publicación Electoral ───────────────────────────────────
// Unit + Integration tests for the publicación module.
//
// Unit:
// - useMotorPublicacion: polling pauses on hidden tab
// - useMotorPublicacion: 403 → RESULTADOS_NO_DISPONIBLES, not ERROR_RED
// - AdvertenciaLegalBanner: rendered text is identical to prop
// - ParticipacionStats: does not render "candidato", "partido", "votos", "resultado"
//
// Integration:
// - Full flow: JORNADA_ACTIVA → CERRADA → results visible
// - Resilience: /participacion network error → last known data persists

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdvertenciaLegalBanner from "../../components/publicacion/AdvertenciaLegalBanner";
import ParticipacionStats from "../../components/publicacion/ParticipacionStats";
import type { ParticipacionPayload } from "../../types/publicacion";

// ── Mock NavBar and Footer to avoid merge conflict issues ────────────────────
vi.mock("../../components/NavBar", () => ({
    default: () => <div data-testid="navbar">NavBar</div>,
}));
vi.mock("../../components/Footer", () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

// ── Mock react-router-dom navigate ──────────────────────────────────────────
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    );
    return { ...actual, useNavigate: () => navigateMock };
});

// ── Mock API module ─────────────────────────────────────────────────────────
vi.mock("../../api/publicacion.api", () => ({
    getParticipacion: vi.fn(),
    getEstadoMotor: vi.fn(),
    getResultadosParciales: vi.fn(),
}));

import {
    getParticipacion,
    getEstadoMotor,
    getResultadosParciales,
} from "../../api/publicacion.api";

const mockGetParticipacion = vi.mocked(getParticipacion);
const mockGetEstadoMotor = vi.mocked(getEstadoMotor);
const mockGetResultadosParciales = vi.mocked(getResultadosParciales);

// ── Sample payloads ─────────────────────────────────────────────────────────
const sampleParticipacion: ParticipacionPayload = {
    totalSufragantes: 1000000,
    porcentajeSobreCenso: 10.5,
    timestampActualizacion: "2026-05-13T10:00:00Z",
    fuente: "SISTEMA_CENTRAL_ELECTORAL",
};

const sampleResultados = {
    advertencia:
        "RESULTADOS PARCIALES ACUMULADOS AL CIERRE DEL DÍA 1 — La jornada electoral continúa. Estos datos pueden influir en su decisión de voto. Los resultados oficiales dependen del escrutinio físico y la declaratoria del CNE.",
    numeroDiaJornada: 1,
    timestampCierreDelDia: "2026-05-13T18:00:00Z",
    totalSufragantes: 1000000,
    porcentajeSobreCenso: 10.5,
    timestampActualizacion: "2026-05-13T18:00:00Z",
    fuente: "SISTEMA_CENTRAL_ELECTORAL",
};

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("AdvertenciaLegalBanner", () => {
    it("renders the advertencia text identically to the prop received", () => {
        const advertencia =
            "RESULTADOS PARCIALES ACUMULADOS AL CIERRE DEL DÍA 1 — La jornada electoral continúa. Estos datos pueden influir en su decisión de voto. Los resultados oficiales dependen del escrutinio físico y la declaratoria del CNE.";

        render(<AdvertenciaLegalBanner advertencia={advertencia} />);

        const banner = screen.getByTestId("advertencia-legal-banner");
        expect(banner).toBeInTheDocument();
        // Text must be rendered EXACTLY as received — no transformation
        expect(banner.textContent).toContain(advertencia);
    });

    it("has role='alert' for accessibility", () => {
        render(<AdvertenciaLegalBanner advertencia="test" />);
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("has aria-live='assertive' for screen readers", () => {
        render(<AdvertenciaLegalBanner advertencia="test" />);
        const banner = screen.getByTestId("advertencia-legal-banner");
        expect(banner).toHaveAttribute("aria-live", "assertive");
    });
});

describe("ParticipacionStats", () => {
    it("renders participation data correctly", () => {
        render(
            <MemoryRouter>
                <ParticipacionStats participacion={sampleParticipacion} />
            </MemoryRouter>
        );

        // Total sufragantes formatted with separators
        expect(screen.getByText(/1.000.000/)).toBeInTheDocument();
        // Percentage with exactly 2 decimals
        expect(screen.getByText("10.50%")).toBeInTheDocument();
    });

    it("does NOT render any DOM node containing forbidden words", () => {
        const { container } = render(
            <MemoryRouter>
                <ParticipacionStats participacion={sampleParticipacion} />
            </MemoryRouter>
        );

        const allText = container.textContent ?? "";
        const forbiddenWords = ["candidato", "partido", "votos", "resultado"];

        forbiddenWords.forEach((word) => {
            expect(allText.toLowerCase()).not.toContain(word);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK TESTS — useMotorPublicacion
// ═══════════════════════════════════════════════════════════════════════════════

// We test the hook indirectly through the pages to avoid needing renderHook
// with complex timer management. The key behaviors are tested via the page
// components which consume the hook.

import ParticipacionEnVivoPage from "../publicacion/ParticipacionEnVivoPage";
import ResultadosParcialPage from "../publicacion/ResultadosParcialPage";

describe("useMotorPublicacion — via ParticipacionEnVivoPage", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockGetParticipacion.mockResolvedValue(sampleParticipacion);
        mockGetEstadoMotor.mockResolvedValue({
            estado: "JORNADA_ACTIVA",
            timestampUltimaVerificacionSrM1: "2026-05-13T10:00:00Z",
            falloSeguroActivo: false,
        });
        mockGetResultadosParciales.mockRejectedValue({
            response: {
                status: 403,
                data: {
                    error: "RESULTADOS_NO_DISPONIBLES_EN_JORNADA_ACTIVA",
                    mensaje: "Los resultados parciales solo se publican al cierre diario de la jornada.",
                },
            },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("pauses polling when tab is hidden", async () => {
        render(
            <MemoryRouter>
                <ParticipacionEnVivoPage />
            </MemoryRouter>
        );

        // Wait for initial fetch
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });

        const initialCallCount = mockGetParticipacion.mock.calls.length;

        // Simulate tab becoming hidden
        Object.defineProperty(document, "hidden", { value: true, writable: true });
        document.dispatchEvent(new Event("visibilitychange"));

        // Advance past several polling intervals
        await act(async () => {
            await vi.advanceTimersByTimeAsync(25_000);
        });

        // No additional calls should have been made while hidden
        const callsWhileHidden = mockGetParticipacion.mock.calls.length;
        expect(callsWhileHidden).toBe(initialCallCount);

        // Simulate tab becoming visible again
        Object.defineProperty(document, "hidden", { value: false, writable: true });
        document.dispatchEvent(new Event("visibilitychange"));

        // Should resume polling
        await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
        });

        expect(mockGetParticipacion.mock.calls.length).toBeGreaterThan(
            callsWhileHidden
        );
    });
});

describe("useMotorPublicacion — 403 handling", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        mockGetParticipacion.mockResolvedValue(sampleParticipacion);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("treats 403 with RESULTADOS_NO_DISPONIBLES code as expected system state, not ERROR_RED", async () => {
        mockGetEstadoMotor.mockResolvedValue({
            estado: "JORNADA_CERRADA_DIA",
            timestampUltimaVerificacionSrM1: "2026-05-13T18:00:00Z",
            falloSeguroActivo: false,
        });

        mockGetResultadosParciales.mockRejectedValue({
            response: {
                status: 403,
                data: {
                    error: "RESULTADOS_NO_DISPONIBLES_EN_JORNADA_ACTIVA",
                    mensaje: "Los resultados parciales solo se publican al cierre diario de la jornada.",
                },
            },
        });

        render(
            <MemoryRouter>
                <ResultadosParcialPage />
            </MemoryRouter>
        );

        // Flush all pending promises and timers
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        // The page should show the "jornada en curso" info since it detected
        // the RESULTADOS_NO_DISPONIBLES error
        expect(screen.getByTestId("estado-jornada-info")).toBeInTheDocument();
    }, 15_000);
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Integration: Full flow JORNADA_ACTIVA → JORNADA_CERRADA_DIA", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("shows informational message during active day, then shows legal banner and results after transition", async () => {
        // Phase 1: JORNADA_ACTIVA
        mockGetParticipacion.mockResolvedValue(sampleParticipacion);
        mockGetEstadoMotor.mockResolvedValue({
            estado: "JORNADA_ACTIVA",
            timestampUltimaVerificacionSrM1: "2026-05-13T10:00:00Z",
            falloSeguroActivo: false,
        });

        render(
            <MemoryRouter>
                <ResultadosParcialPage />
            </MemoryRouter>
        );

        // Flush initial fetches
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        // Should show informational message
        expect(screen.getByTestId("estado-jornada-info")).toBeInTheDocument();

        // No legal banner should be visible
        expect(
            screen.queryByTestId("advertencia-legal-banner")
        ).not.toBeInTheDocument();

        // Phase 2: Transition to JORNADA_CERRADA_DIA
        mockGetEstadoMotor.mockResolvedValue({
            estado: "JORNADA_CERRADA_DIA",
            timestampUltimaVerificacionSrM1: "2026-05-13T18:00:00Z",
            falloSeguroActivo: false,
        });
        mockGetResultadosParciales.mockResolvedValue(sampleResultados);

        // Advance past the estado polling interval (45s) and flush
        await act(async () => {
            await vi.advanceTimersByTimeAsync(46_000);
        });

        // Allow the resultados fetch triggered by state transition to complete
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        // Legal banner should now be visible with exact text
        expect(screen.getByTestId("advertencia-legal-banner")).toBeInTheDocument();

        const banner = screen.getByTestId("advertencia-legal-banner");
        expect(banner.textContent).toContain(sampleResultados.advertencia);
    }, 30_000);
});

describe("Integration: Resilience — network error preserves last known data", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("shows last known participation data with offline warning after network error", async () => {
        // First call succeeds
        mockGetParticipacion.mockResolvedValue(sampleParticipacion);
        mockGetEstadoMotor.mockResolvedValue({
            estado: "JORNADA_ACTIVA",
            timestampUltimaVerificacionSrM1: "2026-05-13T10:00:00Z",
            falloSeguroActivo: false,
        });

        render(
            <MemoryRouter>
                <ParticipacionEnVivoPage />
            </MemoryRouter>
        );

        // Flush initial fetch
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        // Data should be visible
        expect(screen.getByText(/1.000.000/)).toBeInTheDocument();

        // Now simulate network failure
        mockGetParticipacion.mockRejectedValue(new Error("Network Error"));

        // Advance past polling interval (8s) and flush
        await act(async () => {
            await vi.advanceTimersByTimeAsync(9_000);
        });

        // Last known data should still be visible
        expect(screen.getByText(/1.000.000/)).toBeInTheDocument();

        // Offline warning should be visible
        expect(
            screen.getByText(/Último dato disponible — sin conexión/)
        ).toBeInTheDocument();
    }, 15_000);
});
