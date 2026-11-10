import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { siteContent } from "../data/siteContent";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetFrame } from "./WidgetFrame";

const { nav } = siteContent;

type Props = {
  id: string;
  open: boolean;
  pinned: boolean;
  title: string;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: ReactNode;
};

/** Pannello laterale della navbar desktop: scorre da destra, sotto la barra. */
export function NavSlideOver({
  id,
  open,
  pinned,
  title,
  onClose,
  onMouseEnter,
  onMouseLeave,
  children,
}: Props) {
  const titleId = `${id}-title`;

  return createPortal(
    <>
      {pinned && open ? (
        <button type="button" className="nav-slide-scrim" aria-label={nav.chiudi} onClick={onClose} />
      ) : null}
      <aside
        id={id}
        className={`nav-slide${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal={pinned}
        aria-hidden={!open}
        aria-labelledby={open ? titleId : undefined}
        inert={!open}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <WidgetCloseButton onClick={onClose} />
        <div className="h-full overflow-y-auto px-7 py-10">
          <WidgetFrame title={title || nav.menu} titleId={titleId}>
            {children}
          </WidgetFrame>
        </div>
      </aside>
    </>,
    document.body,
  );
}
