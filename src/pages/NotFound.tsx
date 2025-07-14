import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/layout";

export default function NotFound() {
  return (
    <Layout hideBreakingNews>
      <div className="container py-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold">पेज नहीं मिला</h2>
          <p className="text-muted-foreground">
            क्षमा करें, आप जिस पेज को खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है।
          </p>
          <div className="pt-4">
            <Button asChild>
              <Link to="/">होमपेज पर जाएँ</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}