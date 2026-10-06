import type { ReactNode, SVGProps } from "react";

const svg: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 60 40",
  className: "h-full w-full",
  preserveAspectRatio: "none",
};

function Frame({ children }: { children: ReactNode }) {
  return <svg {...svg}>{children}</svg>;
}

function H(colors: string[]) {
  const h = 40 / colors.length;
  return (
    <Frame>
      {colors.map((c, i) => (
        <rect key={i} y={i * h} width="60" height={h + 0.2} fill={c} />
      ))}
    </Frame>
  );
}

function V(colors: string[]) {
  const w = 60 / colors.length;
  return (
    <Frame>
      {colors.map((c, i) => (
        <rect key={i} x={i * w} width={w + 0.2} height="40" fill={c} />
      ))}
    </Frame>
  );
}

function Plain(color: string, mark?: ReactNode) {
  return (
    <Frame>
      <rect width="60" height="40" fill={color} />
      {mark}
    </Frame>
  );
}

/** Bandiere geometriche (0 raggio) per i paesi rappresentativi del catalogo. */
export function FlagById({ id }: { id: string }) {
  switch (id) {
    case "af":
      return H(["#000", "#D32011", "#007A36"]);
    case "al":
      return Plain("#E41E20", <polygon points="30,10 36,30 24,30" fill="#000" />);
    case "am":
      return H(["#D90012", "#0033A0", "#F2A800"]);
    case "az":
      return H(["#00B5E2", "#ED2939", "#3F9C35"]);
    case "ba":
      return (
        <Frame>
          <rect width="60" height="40" fill="#002395" />
          <polygon points="12,0 48,0 48,40" fill="#FECB00" />
        </Frame>
      );
    case "bd":
      return Plain("#006A4E", <circle cx="26" cy="20" r="9" fill="#F42A41" />);
    case "bg":
      return H(["#fff", "#00966E", "#D62612"]);
    case "bi":
      return H(["#CE1126", "#fff", "#1EB53A"]);
    case "bo":
      return H(["#D52B1E", "#F9E300", "#007934"]);
    case "br":
      return (
        <Frame>
          <rect width="60" height="40" fill="#009C3B" />
          <polygon points="30,6 54,20 30,34 6,20" fill="#FFDF00" />
          <circle cx="30" cy="20" r="6" fill="#002776" />
        </Frame>
      );
    case "bt":
      return H(["#FFDA44", "#FF4E12"]);
    case "bw":
      return H(["#75AADB", "#fff", "#000", "#fff", "#75AADB"]);
    case "by":
      return H(["#C8313E", "#C8313E", "#4AA657"]);
    case "cd":
      return Plain("#007FFF", <rect y="17" width="60" height="6" fill="#F7D618" />);
    case "cf":
      return H(["#003082", "#fff", "#289728", "#FFCE00"]);
    case "cn":
      return Plain("#DE2910", <polygon fill="#FFDE00" points="12,8 14.4,15.2 7.2,11 16.8,11 9.6,15.2" />);
    case "cw":
      return Plain("#002B7F", <rect y="24" width="60" height="6" fill="#F9E814" />);
    case "cz":
      return H(["#fff", "#D7141A"]);
    case "de":
      return H(["#000", "#DD0000", "#FFCE00"]);
    case "dk":
      return (
        <Frame>
          <rect width="60" height="40" fill="#C60C30" />
          <rect x="16" width="6" height="40" fill="#fff" />
          <rect y="17" width="60" height="6" fill="#fff" />
        </Frame>
      );
    case "ee":
      return H(["#0072CE", "#000", "#fff"]);
    case "eo":
      return (
        <Frame>
          <rect width="60" height="40" fill="#099" />
          <rect width="18" height="18" fill="#fff" />
          <polygon points="9,3 11,8 16,8 12,11 14,16 9,13 4,16 6,11 2,8 7,8" fill="#099" />
        </Frame>
      );
    case "er":
      return H(["#43B02A", "#EA2839"]);
    case "es":
      return (
        <Frame>
          <rect width="60" height="40" fill="#C60B1E" />
          <rect y="10" width="60" height="20" fill="#FFC400" />
        </Frame>
      );
    case "et":
      return H(["#078930", "#FCDD09", "#DA121A"]);
    case "fi":
      return (
        <Frame>
          <rect width="60" height="40" fill="#fff" />
          <rect x="16" width="8" height="40" fill="#003580" />
          <rect y="16" width="60" height="8" fill="#003580" />
        </Frame>
      );
    case "fj":
      return H(["#68BFE5", "#68BFE5"]);
    case "fr":
      return V(["#002654", "#fff", "#ED2939"]);
    case "gb":
      return (
        <Frame>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
          <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="12" />
          <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="7" />
        </Frame>
      );
    case "gb-sct":
      return (
        <Frame>
          <rect width="60" height="40" fill="#0065BD" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
        </Frame>
      );
    case "gb-wls":
      return H(["#fff", "#fff", "#C8102E"]);
    case "ge":
      return (
        <Frame>
          <rect width="60" height="40" fill="#fff" />
          <rect x="26" width="8" height="40" fill="#FF0000" />
          <rect y="16" width="60" height="8" fill="#FF0000" />
        </Frame>
      );
    case "gh":
      return H(["#CE1126", "#FCD116", "#006B3F"]);
    case "gr":
      return H(["#0D5EAF", "#fff", "#0D5EAF", "#fff", "#0D5EAF"]);
    case "hk":
      return Plain("#DE2910", <circle cx="30" cy="20" r="8" fill="#fff" />);
    case "hr":
      return H(["#FF0000", "#fff", "#171796"]);
    case "ht":
      return H(["#00209F", "#D21034"]);
    case "hu":
      return H(["#CE2939", "#fff", "#477050"]);
    case "id":
      return H(["#FF0000", "#fff"]);
    case "ie":
      return V(["#169B62", "#fff", "#FF883E"]);
    case "il":
      return (
        <Frame>
          <rect width="60" height="40" fill="#fff" />
          <rect y="6" width="60" height="5" fill="#0038B8" />
          <rect y="29" width="60" height="5" fill="#0038B8" />
          <polygon points="30,12 36,24 24,24" fill="none" stroke="#0038B8" strokeWidth="1.6" />
        </Frame>
      );
    case "in":
      return H(["#FF9933", "#fff", "#138808"]);
    case "iq":
      return H(["#CE1126", "#fff", "#000"]);
    case "ir":
      return H(["#239F40", "#fff", "#DA0000"]);
    case "is":
      return (
        <Frame>
          <rect width="60" height="40" fill="#02529C" />
          <rect x="16" width="8" height="40" fill="#fff" />
          <rect y="16" width="60" height="8" fill="#fff" />
          <rect x="18" width="4" height="40" fill="#DC1E35" />
          <rect y="18" width="60" height="4" fill="#DC1E35" />
        </Frame>
      );
    case "it":
      return V(["#009246", "#fff", "#CE2B37"]);
    case "jp":
      return Plain("#fff", <circle cx="30" cy="20" r="9" fill="#BC002D" />);
    case "ke":
      return H(["#000", "#C8102E", "#006600"]);
    case "kg":
      return Plain("#E8112D", <circle cx="30" cy="20" r="7" fill="#FFEF00" />);
    case "kh":
      return H(["#032EA1", "#E00025", "#032EA1"]);
    case "kr":
      return Plain("#fff", (
        <>
          <circle cx="30" cy="20" r="8" fill="#CD2E3A" />
          <path d="M22 20 A8 8 0 0 0 38 20" fill="#0047A0" />
        </>
      ));
    case "kz":
      return Plain("#00AFCA", <circle cx="30" cy="20" r="7" fill="#FEC50C" />);
    case "la":
      return H(["#CE1126", "#002868", "#CE1126"]);
    case "lk":
      return (
        <Frame>
          <rect width="60" height="40" fill="#FFB700" />
          <rect x="8" y="4" width="44" height="32" fill="#8D153A" />
        </Frame>
      );
    case "ls":
      return H(["#00209F", "#fff", "#009543"]);
    case "lt":
      return H(["#FDB913", "#006A44", "#C1272D"]);
    case "lu":
      return H(["#ED2939", "#fff", "#00A1DE"]);
    case "lv":
      return H(["#9E3039", "#fff", "#9E3039"]);
    case "mg":
      return V(["#fff", "#FC3D32", "#007E3A"]);
    case "mk":
      return Plain("#D20000", <circle cx="30" cy="20" r="6" fill="#FFE600" />);
    case "ml":
      return V(["#14B53A", "#FCD116", "#CE1126"]);
    case "mm":
      return H(["#FECB00", "#34B233", "#EA2839"]);
    case "mn":
      return V(["#C4272F", "#015197", "#C4272F"]);
    case "mt":
      return V(["#fff", "#CF142B"]);
    case "mv":
      return Plain("#D21034", <rect x="12" y="10" width="36" height="20" fill="#007E3A" />);
    case "mw":
      return H(["#000", "#CE1126", "#007A33"]);
    case "mx":
      return V(["#006847", "#fff", "#CE1126"]);
    case "my":
      return H(["#CC0001", "#fff", "#CC0001", "#fff", "#010066"]);
    case "mz":
      return H(["#007168", "#000", "#FCE100", "#D21034"]);
    case "ng":
      return V(["#008751", "#fff", "#008751"]);
    case "nl":
      return H(["#AE1C28", "#fff", "#21468B"]);
    case "no":
      return (
        <Frame>
          <rect width="60" height="40" fill="#BA0C2F" />
          <rect x="16" width="8" height="40" fill="#fff" />
          <rect y="16" width="60" height="8" fill="#fff" />
          <rect x="18" width="4" height="40" fill="#00205B" />
          <rect y="18" width="60" height="4" fill="#00205B" />
        </Frame>
      );
    case "np":
      return Plain("#DC143C", <polygon points="8,4 52,20 8,36" fill="#003893" />);
    case "nz":
      return Plain("#00247D", <path d="M0 0 H30 V20 H0 Z" fill="#012169" />);
    case "pe":
      return V(["#D91023", "#fff", "#D91023"]);
    case "ph":
      return H(["#0038A8", "#CE1126"]);
    case "pk":
      return (
        <Frame>
          <rect width="60" height="40" fill="#01411C" />
          <rect width="16" height="40" fill="#fff" />
        </Frame>
      );
    case "pl":
      return H(["#fff", "#DC143C"]);
    case "pt":
      return (
        <Frame>
          <rect width="60" height="40" fill="#FF0000" />
          <rect width="24" height="40" fill="#006600" />
          <circle cx="24" cy="20" r="7" fill="#FFCC00" />
        </Frame>
      );
    case "py":
      return H(["#D52B1E", "#fff", "#0038A8"]);
    case "ro":
      return V(["#002B7F", "#FCD116", "#CE1126"]);
    case "rs":
      return H(["#C6363C", "#0C4076", "#fff"]);
    case "ru":
      return H(["#fff", "#0039A6", "#D52B1E"]);
    case "rw":
      return H(["#00A1DE", "#FAD201", "#20603D"]);
    case "sa":
      return (
        <Frame>
          <rect width="60" height="40" fill="#006C35" />
          <rect x="10" y="18" width="40" height="3" fill="#fff" />
          <path d="M14 24 H46" stroke="#fff" strokeWidth="2" />
        </Frame>
      );
    case "sc":
      return V(["#D62828", "#FCD856", "#003D88"]);
    case "se":
      return (
        <Frame>
          <rect width="60" height="40" fill="#006AA7" />
          <rect x="16" width="8" height="40" fill="#FECC00" />
          <rect y="16" width="60" height="8" fill="#FECC00" />
        </Frame>
      );
    case "si":
      return H(["#fff", "#0033A0", "#D50000"]);
    case "sk":
      return H(["#fff", "#0B4EA2", "#EE1C25"]);
    case "sl":
      return H(["#1EB53A", "#fff", "#0072C6"]);
    case "sn":
      return V(["#00853F", "#FDEF42", "#E31B23"]);
    case "so":
      return Plain("#4189DD", <polygon points="30,10 32.4,17.4 40,17.4 34,22 36.4,29.4 30,24.8 23.6,29.4 26,22 20,17.4 27.6,17.4" fill="#fff" />);
    case "ss":
      return H(["#000", "#C8102E", "#078930"]);
    case "sz":
      return H(["#3E5EB9", "#FFD900", "#3E5EB9"]);
    case "th":
      return H(["#A51931", "#fff", "#2D2A4A", "#fff", "#A51931"]);
    case "tj":
      return H(["#CC0000", "#fff", "#006600"]);
    case "tl":
      return Plain("#DC241F", <polygon points="0,0 28,20 0,40" fill="#000" />);
    case "tm":
      return Plain("#009639", <rect width="14" height="40" fill="#D22630" />);
    case "tr":
      return Plain("#E30A17", <circle cx="24" cy="20" r="8" fill="#fff" />);
    case "tw":
      return (
        <Frame>
          <rect width="60" height="40" fill="#FE0000" />
          <rect width="30" height="20" fill="#000095" />
        </Frame>
      );
    case "tz":
      return Plain("#1EB53A", <polygon points="0,40 60,0 60,12 12,40" fill="#00A3DD" />);
    case "ua":
      return H(["#005BBB", "#FFD500"]);
    case "ug":
      return H(["#000", "#FCDC04", "#D90000"]);
    case "us":
      return H(["#B22234", "#fff", "#B22234", "#fff", "#3C3B6E"]);
    case "uz":
      return H(["#1EB53A", "#fff", "#0099B5"]);
    case "va":
      return V(["#FFE000", "#fff"]);
    case "vn":
      return Plain("#DA251D", <polygon points="30,8 33,18 44,18 35,24 38,34 30,28 22,34 25,24 16,18 27,18" fill="#FF0" />);
    case "ws":
      return Plain("#CE1126", <rect width="30" height="20" fill="#002B7F" />);
    case "za":
      return H(["#E03C31", "#fff", "#001489", "#fff", "#007749"]);
    case "zm":
      return Plain("#198A00", <rect x="40" width="20" height="40" fill="#DE2010" />);
    case "zw":
      return H(["#006400", "#FFD200", "#CE1126", "#000", "#CE1126"]);
    default:
      return H(["#2B2523", "#7A8B78", "#F9F8F6"]);
  }
}
