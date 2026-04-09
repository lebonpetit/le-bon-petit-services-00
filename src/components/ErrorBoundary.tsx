import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md">
                        <h2 className="text-2xl font-bold text-destructive">Une erreur est survenue</h2>
                        <p className="text-muted-foreground">
                            {this.state.error?.message || "Une erreur inattendue s'est produite."}
                        </p>
                        <Button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.reload();
                            }}
                            variant="outline"
                        >
                            Rafraîchir la page
                        </Button>
                        <Button
                            onClick={() => {
                                window.location.href = '/';
                            }}
                        >
                            Retour à l'accueil
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
