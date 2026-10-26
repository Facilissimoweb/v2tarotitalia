# Archivio Itha · Crocicchio di Ecate

Modulo **isolato** e **non montato** nell’app pubblica Tarot Italia.

Contiene UI, contesto, mazzo, prompt Groq e decodifica della precedente esperienza Itha.
Destinato a una futura app dedicata (es. `tarotitalia.com/app` / `tarotitalia.app`).

## Regole

- Non importare Provider/Modal/Launch in `App.tsx`, layout, area riservata o dock.
- Copy di riferimento: `siteContent.itha` in `src/data/siteContent.ts`.
- API legacy: `api/itha-decode.ts` (resta sul server, non esposta dall’UI).

Per riattivare: collegare `IthaProvider` + `IthaModal` e un entry point UI dedicato.
