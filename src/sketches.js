/* Definition sketches: static SVG that labels the variables an entry uses. Not data-driven. */
const wrap = (title, body, h = 200) => `<svg class="sketch" viewBox="0 0 640 ${h}" role="img" aria-label="${title}">${body}</svg>`;

export const sketches = {
  vcurve: wrap('Vertical curve: PVC, PVI, PVT, length L, grades g1 and g2, offset E and turning point',
    `<path class="sk-thin" d="M60,150 L320,60 L580,130"/>
     <path class="sk-main" d="M60,150 L170,112 Q320,60 470,98 L580,130"/>
     <circle class="sk-pt" cx="170" cy="112" r="3.5"/><circle class="sk-pt" cx="320" cy="60" r="3.5"/><circle class="sk-pt" cx="470" cy="98" r="3.5"/>
     <text class="sk-t" x="170" y="132" text-anchor="middle">PVC</text><text class="sk-t" x="320" y="50" text-anchor="middle">PVI</text><text class="sk-t" x="470" y="118" text-anchor="middle">PVT</text>
     <text class="sk-t" x="100" y="128">g1</text><text class="sk-t" x="540" y="108">g2</text>
     <line class="sk-dim" x1="170" y1="170" x2="470" y2="170"/><line class="sk-dim" x1="170" y1="164" x2="170" y2="176"/><line class="sk-dim" x1="470" y1="164" x2="470" y2="176"/>
     <text class="sk-t" x="320" y="186" text-anchor="middle">L = K·A</text>
     <line class="sk-dim" x1="320" y1="60" x2="320" y2="82"/><text class="sk-t" x="328" y="78">E = AL/800</text>
     <line class="sk-dim" x1="170" y1="150" x2="290" y2="150"/><text class="sk-t" x="230" y="146" text-anchor="middle">x</text>
     <text class="sk-t sk-sm" x="60" y="26">A = g2 − g1 (%). Crest shown; sag is the mirror image.</text>`),
  hcurve: wrap('Circular curve elements: radius R, deflection angle Δ, tangent T, length L, external E, middle ordinate M, long chord LC',
    `<path class="sk-thin" d="M80,170 L320,40 L560,170"/>
     <path class="sk-main" d="M120,148 A270,270 0 0 1 520,148"/>
     <line class="sk-thin" x1="120" y1="148" x2="320" y2="300"/><line class="sk-thin" x1="520" y1="148" x2="320" y2="300"/>
     <line class="sk-dim" x1="120" y1="148" x2="520" y2="148"/><text class="sk-t" x="320" y="164" text-anchor="middle">LC</text>
     <line class="sk-dim" x1="320" y1="40" x2="320" y2="148"/><text class="sk-t" x="326" y="70">E</text><text class="sk-t" x="326" y="132">M</text>
     <circle class="sk-pt" cx="120" cy="148" r="3.5"/><circle class="sk-pt" cx="520" cy="148" r="3.5"/><circle class="sk-pt" cx="320" cy="40" r="3.5"/>
     <text class="sk-t" x="108" y="170" text-anchor="middle">PC</text><text class="sk-t" x="532" y="170" text-anchor="middle">PT</text><text class="sk-t" x="320" y="30" text-anchor="middle">PI (Δ)</text>
     <text class="sk-t" x="200" y="84">T</text><text class="sk-t" x="432" y="84">T</text><text class="sk-t" x="320" y="104" text-anchor="middle">L</text>
     <text class="sk-t" x="236" y="236">R</text><text class="sk-t" x="396" y="236">R</text>
     <text class="sk-t sk-sm" x="320" y="296" text-anchor="middle">center</text>`, 300),
  hso: wrap('Horizontal sightline offset: sight distance S along the inside lane, offset HSO from the lane centerline to the obstruction',
    `<path class="sk-main" d="M60,170 A420,420 0 0 1 580,170"/>
     <path class="sk-thin" d="M60,150 A400,400 0 0 1 580,150"/>
     <line class="sk-dash" x1="150" y1="118" x2="490" y2="118"/>
     <rect class="sk-fill" x="150" y="40" width="340" height="78"/>
     <text class="sk-t" x="320" y="80" text-anchor="middle">keep clear</text>
     <line class="sk-dim" x1="320" y1="118" x2="320" y2="84"/><text class="sk-t" x="328" y="104">HSO</text>
     <text class="sk-t" x="320" y="140" text-anchor="middle">sight line, length S</text>
     <text class="sk-t sk-sm" x="60" y="196">Centerline of inside lane (radius R)</text>`),
  isd: wrap('Intersection sight triangle: decision point on the minor road, sight distance ISD along the major road',
    `<rect class="sk-fill" x="0" y="60" width="640" height="60"/><line class="sk-dash" x1="0" y1="90" x2="640" y2="90"/>
     <rect class="sk-fill" x="300" y="120" width="60" height="80"/>
     <path class="sk-tri" d="M330,160 L80,105 L330,105 Z"/><path class="sk-tri" d="M330,160 L580,75 L330,75 Z"/>
     <circle class="sk-pt" cx="330" cy="160" r="4"/><text class="sk-t" x="340" y="176">decision point</text>
     <line class="sk-dim" x1="80" y1="48" x2="330" y2="48"/><text class="sk-t" x="205" y="42" text-anchor="middle">ISD (from left)</text>
     <line class="sk-dim" x1="330" y1="30" x2="580" y2="30"/><text class="sk-t" x="455" y="24" text-anchor="middle">ISD (from right)</text>
     <line class="sk-dim" x1="372" y1="120" x2="372" y2="160"/><text class="sk-t sk-sm" x="378" y="144">14.5 ft (18 desirable)</text>`),
  lon: wrap('Barrier length of need: runout length LR, lateral extent LA, barrier offset L2, tangent length L1 and flare',
    `<rect class="sk-fill" x="0" y="40" width="640" height="40"/><text class="sk-t sk-sm" x="8" y="64">traffic →</text>
     <line class="sk-thin" x1="0" y1="80" x2="640" y2="80"/>
     <rect class="sk-haz" x="520" y="150" width="60" height="30"/><text class="sk-t" x="550" y="196" text-anchor="middle">hazard</text>
     <line class="sk-dash" x1="120" y1="80" x2="580" y2="180"/><text class="sk-t" x="120" y="100">runout line</text>
     <path class="sk-rail" d="M250,124 L330,104 L540,104"/>
     <line class="sk-dim" x1="120" y1="28" x2="580" y2="28"/><text class="sk-t" x="350" y="22" text-anchor="middle">L_R</text>
     <line class="sk-dim" x1="250" y1="140" x2="540" y2="140"/><text class="sk-t" x="395" y="154" text-anchor="middle">X (length of need)</text>
     <line class="sk-dim" x1="600" y1="80" x2="600" y2="180"/><text class="sk-t" x="606" y="134">L_A</text>
     <line class="sk-dim" x1="560" y1="80" x2="560" y2="104"/><text class="sk-t sk-sm" x="562" y="98">L_2</text>
     <line class="sk-dim" x1="330" y1="92" x2="540" y2="92"/><text class="sk-t sk-sm" x="435" y="90" text-anchor="middle">L_1</text>
     <text class="sk-t sk-sm" x="250" y="136">flare b:a</text>`)
};
