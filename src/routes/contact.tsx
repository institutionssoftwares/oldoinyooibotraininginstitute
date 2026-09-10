import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { INSTITUTION, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact OOTI | Loitokitok Town, behind KPLC" },
      {
        name: "description",
        content:
          "Contact Oldoinyo Oibor Training Institute in Loitokitok Town, behind KPLC. Call 0748573166, WhatsApp us or send a message online.",
      },
      { property: "og:title", content: "Contact Oldoinyo Oibor Training Institute" },
      {
        property: "og:description",
        content: "Call, WhatsApp, email or visit us in Loitokitok Town, behind KPLC.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full_name") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!fullName || !message) return;

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      full_name: fullName,
      message,
      email: String(form.get("email") ?? "").trim() || null,
      phone: String(form.get("phone") ?? "").trim() || null,
      subject: String(form.get("subject") ?? "").trim() || null,
    });
    setSending(false);

    if (error) {
      toast.error("Your message could not be sent. Please try again.");
      return;
    }
    setSent(true);
    toast.success("Message sent. We will get back to you.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to us"
        description={`Visit the institute at ${INSTITUTION.location}, or reach us by phone, WhatsApp or email.`}
      />

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <ContactCard icon={MapPin} label="Location" value={INSTITUTION.location} />
            <ContactCard
              icon={Phone}
              label="Phone"
              value={INSTITUTION.phone}
              href={`tel:${INSTITUTION.phone}`}
            />
            <ContactCard
              icon={MessageCircle}
              label="WhatsApp"
              value={INSTITUTION.phone}
              href={whatsappLink()}
            />
            <ContactCard
              icon={Mail}
              label="Email"
              value={INSTITUTION.email}
              href={`mailto:${INSTITUTION.email}`}
            />
          </div>

          {sent ? (
            <div className="rounded-xl border border-border bg-surface p-8 shadow-card">
              <h2 className="font-display text-xl font-bold">Thank you</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your message has reached the institute. A member of staff will respond as soon as
                possible.
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="grid gap-5 rounded-xl border border-border bg-card p-8 shadow-card"
            >
              <h2 className="font-display text-xl font-bold">Send a message</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full name *</Label>
                  <Input id="full_name" name="full_name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" name="message" rows={5} required />
              </div>
              <Button type="submit" variant="gold" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="size-5 text-gold" aria-hidden="true" />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </>
  );
  const className =
    "flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-card";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${className} hover:shadow-lift`}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}
