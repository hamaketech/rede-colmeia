import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function PartnersPage() {
  const [partnerName, setPartnerName] = useState("");

  return (
    <section className="page">
      <h2>Partners</h2>
      <Card>
        <CardHeader>
          <CardTitle>Partner onboarding</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <label className="field-label" htmlFor="partner-name">
            Partner name
          </label>
          <Input
            id="partner-name"
            placeholder="Ex: Community Center A"
            value={partnerName}
            onChange={(event) => setPartnerName(event.target.value)}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button">Preview submission</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm partner draft</DialogTitle>
                <DialogDescription>
                  Validate name before moving to full registration.
                </DialogDescription>
              </DialogHeader>
              <p>
                Draft partner: <strong>{partnerName || "No name provided yet"}</strong>
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => toast.success("Partner draft saved for next step.")}
                >
                  Confirm draft
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </section>
  );
}
