import { useState, type FormEvent } from "react";
import { siteContent } from "../data/siteContent";
import { BrandSafetyNote } from "../components/BrandSafetyNote";
import { Button, Kicker } from "../components/Button";
import { SectionBrandMark } from "../components/WidgetFrame";
import { MailToLink } from "../components/MailToLink";
import { PageBanner } from "../components/PageBanner";
import { Reveal } from "../components/Reveal";
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
      <PageBanner title={copy.titolo} className="mb-0" />

      <StackDeck>
      <StackSheet className="bg-ivory px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Kicker>{copy.primoPasso.kicker}</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {copy.primoPasso.titolo}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-base leading-[1.9] text-ink/75">{copy.primoPasso.testo}</p>
          </Reveal>
        </div>
      </StackSheet>

      <StackSheet className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-2 md:gap-20">
          <Reveal>
            <article>
              <Kicker>{copy.canali.kicker}</Kicker>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {copy.canali.titolo}
              </h2>
              <p className="mt-10 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{copy.canali.modulo}</p>
              <ContactForm />
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="bg-mist px-8 py-12 md:px-10 md:py-16">
              <SectionBrandMark align="start" />
              <p className="mt-8 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{copy.canali.email}</p>
              <MailToLink
                email={brand.email}
                className="mt-4 block font-display text-xl italic text-ink underline decoration-ember-soft/50 underline-offset-4 hover:underline"
              >
                {brand.email}
              </MailToLink>
              <p className="mt-10 text-sm leading-[1.9] text-ink/75">{brand.studioDiTeresa}</p>
              <p className="mt-3 text-sm leading-[1.9] text-ink/75">{brand.piva}</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button href={whatsappChatHref()}>{cta.whatsappRapido}</Button>
                <Button href={getPhoneHref()} variant="ghost">
                  {cta.chiama}
                </Button>
              </div>
            </article>
          </Reveal>
        </div>
      </StackSheet>

      <StackSheet className="bg-ivory px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Kicker>{copy.note.kicker}</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {copy.note.titolo}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-base leading-[1.9] text-ink/75">{copy.note.gestione}</p>
            <p className="mt-6 text-base leading-[1.9] text-ink/75">{copy.note.appuntamento}</p>
          </Reveal>
        </div>
      </StackSheet>

      <BrandSafetyNote />
      </StackDeck>
    </div>
  );
}
