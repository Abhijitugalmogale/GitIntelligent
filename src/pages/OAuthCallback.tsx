import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchSession } = useAuth();
    const hasCalled = useRef(false);

    useEffect(() => {
        const code = searchParams.get("code");
        if (code && !hasCalled.current) {
            hasCalled.current = true;
            fetch(`/api/auth/callback?code=${code}`)
                .then(async (res) => {
                    if (!res.ok) {
                        console.error("Callback error", await res.text());
                        navigate("/", { replace: true });
                        return;
                    }
                    await fetchSession();
                    navigate("/dashboard", { replace: true });
                })
                .catch((err) => {
                    console.error(err);
                    navigate("/", { replace: true });
                });
        } else if (!code) {
            navigate("/", { replace: true });
        }
    }, [searchParams, navigate, fetchSession]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
                <p className="text-white/70">Completing login...</p>
            </div>
        </div>
    );
}
