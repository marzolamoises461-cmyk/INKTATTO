export interface TattooDesign {
  slug: string
  name: string
  category: string
  image: string
  imageAlt: string
  description: string
  meaning: string
  style: string
  bodyArea: string
  duration: string
}

export const categories = [
  'Todos',
  'Fine line',
  'Microrealismo',
  'Patchwork',
  'Blackwork',
  'Cybersigilism',
  'Y2K',
  'Realismo',
  'Ornamental',
]

export const designs: TattooDesign[] = [
  {
    slug: 'mariposa-fine-line',
    name: 'Mariposa delicada',
    category: 'Fine line',
    image: 'https://inkppl.com/upload/article/female%20conceptual.jpg',
    imageAlt: 'Tatuaje contemporáneo de línea fina con mariposa y composición geométrica en el brazo',
    description: 'Una composición de líneas delicadas, mariposa y elementos gráficos que se adaptan al brazo.',
    meaning: 'Cambio, libertad y crecimiento personal.',
    style: 'Fine line · ilustrativo',
    bodyArea: 'Antebrazo, hombro o clavícula',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'microrealismo-botanico',
    name: 'Rosa en microrealismo',
    category: 'Microrealismo',
    image: 'https://assets.zyrosite.com/cdn-cgi/image/format%3Dauto%2Cw%3D768%2Ch%3D813%2Cfit%3Dcrop/m2W84p5vaqTbjBGy/img_3512-m7V36vljaLS30bqQ.JPG',
    imageAlt: 'Tatuaje de manga con detalles realistas y florales',
    description: 'Detalles realistas de pequeño formato con sombras suaves y composición personalizada.',
    meaning: 'Afecto, memoria y belleza.',
    style: 'Microrealismo · negro y gris',
    bodyArea: 'Antebrazo, brazo o pantorrilla',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'patchwork-mariposas',
    name: 'Patchwork de mariposas y flores',
    category: 'Patchwork',
    image: 'https://cdn.tatspark.com/images/Patchwork-fine-line-tattoo-design-for-women-butterfly-cicada-dandelion-snail-mushroom-on-forearms-e8fe1e69b9_thumbnail.webp',
    imageAlt: 'Brazos con colección patchwork de mariposas, flores e insectos',
    description: 'Piezas pequeñas independientes, distribuidas como una colección personal sobre la piel.',
    meaning: 'Cada símbolo puede representar un recuerdo o una etapa distinta.',
    style: 'Patchwork · fine line',
    bodyArea: 'Brazos, piernas o antebrazos',
    duration: 'Se construye por sesiones independientes.',
  },
  {
    slug: 'blackwork-floral',
    name: 'Floral blackwork',
    category: 'Blackwork',
    image: 'https://skyryedesign.com/wp-content/uploads/2024/05/6f11b7c23fd510810fde341beb552dc3.jpg',
    imageAlt: 'Manga floral en tinta negra con rosas y mariposas',
    description: 'Flores y elementos naturales con negros definidos, contraste y espacios negativos.',
    meaning: 'Fuerza, renovación y conexión con la naturaleza.',
    style: 'Blackwork · botánico',
    bodyArea: 'Brazo, hombro o pierna',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'cybersigilism',
    name: 'Cybersigilism',
    category: 'Cybersigilism',
    image: 'https://d1xdi3noqk7ihj.cloudfront.net/media/images/18_qMB13tW.format-jpeg.jpg',
    imageAlt: 'Manga abstracta contemporánea de tatuajes con líneas y símbolos',
    description: 'Trazos afilados, formas abstractas y simetrías de estética futurista.',
    meaning: 'Identidad, energía y expresión individual.',
    style: 'Cybersigilism · blackwork',
    bodyArea: 'Espalda, columna, brazo o esternón',
    duration: 'Según composición y zona; se confirma en consulta.',
  },
  {
    slug: 'y2k-retro',
    name: 'Mariposa retro Y2K',
    category: 'Y2K',
    image: 'https://cdn.tatspark.com/images/Women-s-patchwork-fine-line-tattoo-idea-butterfly-scorpion-heart-barbed-wire-radio-safety-pin-on-arms-7242e0b955_thumbnail.webp',
    imageAlt: 'Colección de tatuajes pequeños patchwork en los brazos',
    description: 'Inspiración nostálgica de los 2000 reinterpretada con líneas limpias y detalles actuales.',
    meaning: 'Nostalgia, libertad y estilo propio.',
    style: 'Y2K · ornamental contemporáneo',
    bodyArea: 'Hombro, espalda baja o brazo',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'realismo-naturaleza',
    name: 'Naturaleza en realismo',
    category: 'Realismo',
    image: 'https://assets.zyrosite.com/cdn-cgi/image/format%3Dauto%2Cw%3D768%2Ch%3D813%2Cfit%3Dcrop/m2W84p5vaqTbjBGy/img_3512-m7V36vljaLS30bqQ.JPG',
    imageAlt: 'Tatuaje de manga con detalles realistas y florales',
    description: 'Texturas y sombras inspiradas en la naturaleza, con acabado de aspecto fotográfico.',
    meaning: 'Conexión, recuerdo y admiración por la naturaleza.',
    style: 'Realismo · negro y gris',
    bodyArea: 'Antebrazo, brazo o muslo',
    duration: 'Varias sesiones según escala y detalle.',
  },
  {
    slug: 'ornamental-geometrico',
    name: 'Ornamental geométrico',
    category: 'Ornamental',
    image: 'https://drfzw5rbqc1qm.cloudfront.net/production/variants/production/4fqb5302wdxhxkshcyxcrbfrdjgv/img_1636-jpg.jpg/e6e9bc27561993c18ae4b87a6d8593a3a1eb64f8951f4c2c8099f23fee29371b/img_1636-jpg.jpg',
    imageAlt: 'Tatuajes patchwork modernos con símbolos y detalles ornamentales',
    description: 'Motivos decorativos, geometría y puntos que siguen las líneas naturales del cuerpo.',
    meaning: 'Equilibrio, armonía y expresión personal.',
    style: 'Ornamental · dotwork',
    bodyArea: 'Antebrazo, hombro, pecho o espalda',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
]

export const artistProfiles = [
  { slug: 'faver', label: 'Faver', specialty: 'Tatuador principal', experience: 'Creatividad, precisión y pasión en cada diseño.', image: '/images/team/faver.webp' },
  { slug: 'ernestor', label: 'Ernestor', specialty: 'Tatuador artístico', experience: 'Ideas únicas para un tatuaje inolvidable.', image: '/images/team/ernestor.webp' },
  { slug: 'jorge', label: 'Jorge', specialty: 'Tatuador especialista', experience: 'Tu historia, nuestro arte.', image: '/images/team/jorge.webp' },
]
