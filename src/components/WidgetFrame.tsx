import type { ReactNode } from "react";

type Props = {
  title: string;
  titleId?: string;
  children: ReactNode;
};

/** Guscio di widget e modali: logo ufficiale sempre in alto, prima di titolo e testi. */
export function WidgetFrame({ title, titleId, children }: Props) {
  return (
    <div data-widget-frame>
      <img src="/logo.svg" alt="" className="mx-auto h-11 w-11" />
      <h2
        id={titleId}
        className="mt-6 text-center font-display text-2xl font-light leading-snug tracking-tight text-ink md:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </div>
  );
}