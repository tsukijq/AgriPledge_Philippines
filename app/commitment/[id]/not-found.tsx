import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function CommitmentNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <FileQuestion className="mb-6 h-16 w-16 text-muted-foreground/50" />
          <h1 className="text-2xl font-bold text-foreground">
            Commitment Not Found
          </h1>
          <p className="mt-2 text-muted-foreground">
            The harvest commitment you&apos;re looking for doesn&apos;t exist or may have
            been removed.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline">
              <Link href="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
