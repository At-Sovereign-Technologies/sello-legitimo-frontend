import { User, Phone, Mail, Fingerprint, Shield } from "lucide-react";
import type { UserProfile } from "../../types/security";

interface ProfileInfoProps {
    profile: UserProfile;
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
    const fields = [
        { icon: Fingerprint, label: "Documento", value: profile.numeroDocumento },
        { icon: User, label: "Nombre", value: profile.nombre },
        { icon: Phone, label: "Teléfono", value: profile.telefono },
        { icon: Mail, label: "Correo", value: profile.correo },
        { icon: Shield, label: "Rol", value: profile.rol },
    ];

    return (
        <div className="space-y-6">

            <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                    <div
                        key={field.label}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <field.icon size={18} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {field.label}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-gray-900">
                                {field.value || "—"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-900">Estado de seguridad</h3>
                <div className="mt-3 flex items-center gap-3">
                    <span
                        className={`inline-flex h-2.5 w-2.5 rounded-full ${
                            profile.mfaEnabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                    <span className="text-sm text-gray-700">
                        {profile.mfaEnabled
                            ? `MFA activo (${profile.mfaMethod})`
                            : "MFA no configurado"}
                    </span>
                </div>
            </div>
        </div>
    );
}
