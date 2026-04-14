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
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { toast } from "sonner";

export function PartnersPage() {
  const { t } = useLanguage();
  const [partnerName, setPartnerName] = useState("");

  return (
    <section className="page">
      <h2>{t("partners.title")}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t("partners.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="stack">
          <label className="field-label" htmlFor="partner-name">
            {t("partners.nameLabel")}
          </label>
          <Input
            id="partner-name"
            placeholder={t("partners.namePlaceholder")}
            value={partnerName}
            onChange={(event) => setPartnerName(event.target.value)}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button">{t("partners.previewButton")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("partners.dialogTitle")}</DialogTitle>
                <DialogDescription>{t("partners.dialogDescription")}</DialogDescription>
              </DialogHeader>
              <p>
                {t("partners.draftLabel")}:{" "}
                <strong>{partnerName || t("partners.noName")}</strong>
              </p>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => toast.success(t("partners.toastDraftSaved"))}
                >
                  {t("partners.confirmDraft")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </section>
  );
}
