# 🎨 Prompts para generar imágenes de jugadores (chilena) — Google AI Studio

Guía para generar una imagen por jugador haciendo una **chilena** (bicycle kick)
con IA, en un estilo consistente que combine con el juego.

## ⚠️ Léelo primero (importante)

- **No uses el nombre real del futbolista** (ej. "Lionel Messi"). Google AI
  Studio normalmente **rechaza** generar personas reales famosas, y usar su cara
  real implica derechos de imagen. Por eso estos prompts describen a un
  **jugador genérico** con los **colores de la selección + dorsal**, que es lo
  que de verdad identifica a cada uno en el juego.
- Si aun así quieres intentar la versión con la cara real, hazlo **solo para tu
  copia local/privada**, bajo tu responsabilidad, y NO subas esas imágenes al
  repositorio público.

## 🚀 Cómo generarlas en Google AI Studio

1. Entra a **https://aistudio.google.com**.
2. Elige un modelo con **generación de imágenes** (Imagen / Gemini con imágenes).
3. Pega el prompt del jugador que quieras (abajo).
4. Genera, descarga el PNG.
5. (Opcional, para usarla en el juego) Guárdala como
   `assets/jugadores/<id>.png` y descomenta la línea `foto:` de ese jugador en
   `js/data/jugadores.js`. El juego la usará automáticamente.

> 💡 **Para que las 10 se vean como un SET:** usa siempre la misma "Base de
> estilo" y solo cambia la parte de `[KIT / número]`. Así todas tienen el mismo
> look.

---

## 🧱 Base de estilo (la misma para todos)

```
Dynamic stylized sports illustration, vibrant cel-shaded comic art style,
a male footballer performing a dramatic overhead bicycle kick (chilena),
body horizontal and inverted in mid-air, one leg extended striking the ball,
motion lines and dust, dramatic stadium floodlights at night, low dramatic
camera angle, clean vector-like shading, full body visible, generic athletic
athlete (NOT a specific real person, no recognizable face), transparent
background, high detail, 4k.
KIT: <-- aquí va la parte de cada jugador
```

Pega la "Base de estilo" + la línea `KIT` del jugador que quieras.

---

## ⭐ Los 3 que pediste primero

### Luis Díaz (Colombia) 🇨🇴
```
KIT: bright yellow jersey, blue shorts, red socks, jersey number 7,
Colombia national team colors (yellow, blue, red).
```

### Cristiano Ronaldo (Portugal) 🇵🇹
```
KIT: dark red jersey with green accents, jersey number 7, Portugal national
team colors (deep red and green), muscular athletic build.
```

### Lionel Messi (Argentina) 🇦🇷
```
KIT: light blue and white vertical striped jersey, white shorts, jersey
number 10, Argentina national team colors (sky blue and white), smaller agile build.
```

---

## 👥 Los demás jugadores del proyecto

### Kylian Mbappé (Francia) 🇫🇷
```
KIT: blue jersey, white shorts, red socks, jersey number 10, France national
team colors (blue, white, red), fast lean sprinter build.
```

### Neymar Jr (Brasil) 🇧🇷
```
KIT: yellow jersey with green trim, blue shorts, jersey number 10, Brazil
national team colors (yellow, green, blue), flashy agile build.
```

### Erling Haaland (Noruega) 🇳🇴
```
KIT: red jersey, navy blue shorts, jersey number 9, Norway national team
colors (red and navy blue), tall powerful build, blond hair.
```

### Kevin De Bruyne (Bélgica) 🇧🇪
```
KIT: red jersey with yellow accents, jersey number 17, Belgium national team
colors (red, yellow, black), athletic build, ginger hair.
```

### Mohamed Salah (Egipto) 🇪🇬
```
KIT: red jersey with black accents, jersey number 11, Egypt national team
colors (red and black), curly hair and beard, agile build.
```

### Luka Modrić (Croacia) 🇭🇷
```
KIT: red and white checkered jersey, jersey number 10, Croatia national team
colors (red and white check pattern), slim midfielder build, long hair.
```

### Heung-min Son (Corea del Sur) 🇰🇷
```
KIT: white jersey with red accents, jersey number 7, South Korea national team
colors (white and red), athletic balanced build.
```

---

## 🔄 ¿La quieres para el AVATAR del juego en vez de una chilena?

La chilena se ve genial como póster, pero el juego dibuja al jugador **de pie**
bajo el balón. Si la imagen es para el avatar dentro del juego, cambia la pose
en la Base de estilo por esta:

```
... a male footballer STANDING, full body, facing forward, juggling a soccer
ball on one foot, feet at the bottom of the frame, vertical portrait
composition, transparent background ...
```

Y guárdala con **fondo transparente** (PNG) como `assets/jugadores/<id>.png`.

---

## 🆔 Tabla rápida (id = nombre de archivo)

| Jugador | id (nombre de archivo) | Dorsal |
|---|---|---|
| Messi | `messi` | 10 |
| Cristiano Ronaldo | `cristiano` | 7 |
| Luis Díaz | `luisdiaz` | 7 |
| Mbappé | `mbappe` | 10 |
| Neymar | `neymar` | 10 |
| Haaland | `haaland` | 9 |
| De Bruyne | `debruyne` | 17 |
| Salah | `salah` | 11 |
| Modrić | `modric` | 10 |
| Son | `son` | 7 |

> Ej.: la imagen de Luis Díaz va en `assets/jugadores/luisdiaz.png`.
