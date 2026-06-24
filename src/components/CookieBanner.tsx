import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "classroom_cookie_consent";

export function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem(CONSENT_KEY, "accepted");
        setVisible(false);
    };

    const decline = () => {
        localStorage.setItem(CONSENT_KEY, "declined");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[360px] z-50 rounded-xl border bg-background shadow-xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-3">
                <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold leading-tight">Cookies &amp; Sessions</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        We use essential session cookies to keep you signed in. No tracking or advertising cookies are used.
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" onClick={accept} className="flex-1">
                    Accept
                </Button>
                <Button size="sm" variant="outline" onClick={decline} className="flex-1">
                    Decline
                </Button>
            </div>
        </div>
    );
}
