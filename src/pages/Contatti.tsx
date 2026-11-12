import { useState, type FormEvent } from "react";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "../components/Button";
import { conPeso } from "../components/Prosa";
import { SectionBrandMark } from "../components/WidgetFrame";
import { MailToLink } from "../components/MailToLink";
import { PageBanner } from "../components/PageBanner";
import { Reveal } from "../components/Reveal";
import { SectionCopy, SectionCopyHead } from "../components/SectionCopy";
import { SectionRails } from "../components/SectionRails";
import { StackDeck, StackSheet } from "../components/StackSheet";
import { openMailto } from "../lib/mailto";
import { getPhoneHref, whatsappChatHref } from "../lib/whatsapp";

const { brand, cta, pages } = siteContent;
const copy = pages.contatti;

function ContactForm() {
  const { form } = copy;
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [oggetto, setOggetto] = useState("");
  const [messaggio, setMessaggio] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const body = `${form.nome}: ${nome.trim()}\n${form.email}: ${email.trim()}\n\n${messaggio.trim()}`;
    openMailto(brand.email, { subject: oggetto.trim(), body });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-8">
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{form.nome}</span>
        <input
          required
          name="nome"
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{form.email}</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{form.oggetto}</span>
        <input
          required
          name="oggetto"
          value={oggetto}
          onChange={(e) => setOggetto(e.target.value)}
          className="border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{form.messaggio}</span>
        <textarea
          required
          name="messaggio"
          rows={5}
          value={messaggio}
          onChange={(e) => setMessaggio(e.target.value)}
          className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <Button type="submit" className="w-full sm:w-auto">
        {form.invia}
      </Button>
    </form>
  );
}

export function Contatti() {
  return (
    <div>
      <PageBanner title={copy.titolo} subtitle={copy.intro} className="mb-6 md:mb-8" />

      <StackDeck>
      <StackSheet className="bg-paper px-6 py-16 md:px-10 md:py-24">
        <SectionRails className="page-shell items-start">
          <Reveal>
            <article>
              <SectionCopy>
                <SectionCopyHead>
                  <Kicker>{copy.moduloKicker}</Kicker>
                  <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                    {copy.moduloTitolo}
                  </h2>
                </SectionCopyHead>
              </SectionCopy>
              <ContactForm />
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="edition-note border-t border-ink/80 pt-6">
              <SectionBrandMark align="start" />
              <h2 className="mt-8 font-display text-2xl font-normal text-ink">{copy.recapitiTitolo}</h2>
              <MailToLink
                email={brand.email}
                className="mt-4 block break-all font-display text-xl italic text-ink underline decoration-ember-soft/50 underline-offset-4 hover:underline"
              >
                {brand.email}
              </MailToLink>
              <p className="edition-note__body mt-8">{conPeso(copy.sede)}</p>
              <p className="edition-note__body">{conPeso(copy.appuntamento)}</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href={whatsappChatHref()}>{cta.whatsappRapido}</Button>
                <Button href={getPhoneHref()} variant="ghost">
                  {cta.chiama}
                </Button>
              </div>
            </article>
          </Reveal>
        </SectionRails>
      </StackSheet>
      </StackDeck>
    </div>
  );
}
