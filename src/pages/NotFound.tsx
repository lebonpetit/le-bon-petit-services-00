import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center african-pattern">
        <div className="text-center px-4">
          <div className="mb-8">
            <span className="inline-block text-8xl font-heading font-bold text-primary">404</span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">
            Page introuvable
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Page précédente
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
