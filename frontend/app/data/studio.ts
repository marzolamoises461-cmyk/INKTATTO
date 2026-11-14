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
  'Blackwork',
  'Geométrico',
  'Realismo',
  'Neo-tradicional',
  'Japonés',
  'Ornamental',
  'Acuarela',
]

export const designs: TattooDesign[] = [
  {
    slug: 'botanica-fina',
    name: 'Botánica fina',
    category: 'Fine line',
    image: 'https://limova-public-v2.s3.eu-central-1.amazonaws.com/blog-images/blog-image-1780664028508-7399j0ve.jpeg',
    imageAlt: 'Ejemplo de tatuaje floral de línea fina',
    description: 'Flores y ramas delicadas construidas con líneas ligeras y espacios limpios.',
    meaning: 'Naturaleza, crecimiento y conexión con los pequeños detalles.',
    style: 'Fine line · tinta negra',
    bodyArea: 'Antebrazo, clavícula o costillas',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'guardian-blackwork',
    name: 'Guardián en negro',
    category: 'Blackwork',
    image: 'https://inkedmythos.fra1.digitaloceanspaces.com/featured/blackwork-realism-irezumi-tattoos-beginners-guide-featured.jpg',
    imageAlt: 'Tatuaje de león con sombreado oscuro y alto contraste',
    description: 'Composición de alto contraste que utiliza masas negras, sombras y espacios negativos.',
    meaning: 'Fuerza, protección y carácter.',
    style: 'Blackwork · negro sólido y sombras',
    bodyArea: 'Brazo, pantorrilla o espalda',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'zorro-geometrico',
    name: 'Zorro geométrico',
    category: 'Geométrico',
    image: 'https://www.magnumxiiitattoo.com/wp-content/uploads/2020/05/geo.jpg',
    imageAlt: 'Tatuaje de animal construido con formas geométricas',
    description: 'Formas geométricas y líneas precisas crean una figura moderna y equilibrada.',
    meaning: 'Inteligencia, adaptación y equilibrio.',
    style: 'Geométrico · linework',
    bodyArea: 'Antebrazo, brazo o muslo',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'retrato-leon',
    name: 'Mirada del león',
    category: 'Realismo',
    image: 'https://inkedmythos.fra1.digitaloceanspaces.com/featured/blackwork-realism-irezumi-tattoos-beginners-guide-featured.jpg',
    imageAlt: 'Retrato realista de un león tatuado en el antebrazo',
    description: 'Retrato de gran detalle con degradados, textura y profundidad tonal.',
    meaning: 'Valentía, liderazgo y protección.',
    style: 'Realismo · negro y gris',
    bodyArea: 'Antebrazo, hombro o pantorrilla',
    duration: 'Varias sesiones según escala y detalle.',
  },
  {
    slug: 'flor-neo-tradicional',
    name: 'Peonía contemporánea',
    category: 'Neo-tradicional',
    image: 'https://www.magnumtattoosupplies.co.uk/cdn/shop/articles/tattoo-style-guide-for-newbies_c5f55b7a-a7ba-4ce4-ae72-a5af49535d76.png?v=1761291362',
    imageAlt: 'Ejemplos de tatuajes neo-tradicionales con color y contornos marcados',
    description: 'Contornos definidos, color intenso y detalles ilustrativos con volumen.',
    meaning: 'Belleza, transformación y confianza.',
    style: 'Neo-tradicional · color',
    bodyArea: 'Brazo, muslo o pantorrilla',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'oni-japones',
    name: 'Oni moderno',
    category: 'Japonés',
    image: 'https://mallina-tattoo.ru/images/blog/11/1.jpg',
    imageAlt: 'Máscara japonesa Oni en un tatuaje de brazo',
    description: 'Inspiración japonesa con figuras mitológicas, movimiento y contraste marcado.',
    meaning: 'Protección, determinación y fuerza ante la adversidad.',
    style: 'Neo-irezumi · negro y color',
    bodyArea: 'Brazo completo, espalda o muslo',
    duration: 'Varias sesiones según escala y detalle.',
  },
  {
    slug: 'mandala-ornamental',
    name: 'Mandala ornamental',
    category: 'Ornamental',
    image: 'https://i.etsystatic.com/54611824/r/il/099853/6307112491/il_1588xN.6307112491_eg3t.jpg',
    imageAlt: 'Diseños ornamentales y mandalas de tatuaje',
    description: 'Patrones simétricos, repetición de motivos y detalles decorativos.',
    meaning: 'Armonía, concentración y equilibrio interior.',
    style: 'Ornamental · mandala y dotwork',
    bodyArea: 'Hombro, pecho, antebrazo o espalda',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
  {
    slug: 'carpa-acuarela',
    name: 'Koi en acuarela',
    category: 'Acuarela',
    image: 'https://thebestnumbingcream.com/cdn/shop/articles/tattoo_trends_2025.png?v=1747412512',
    imageAlt: 'Ejemplos de tatuajes florales y de color con efecto acuarela',
    description: 'Manchas de color y trazos fluidos crean una sensación pictórica y ligera.',
    meaning: 'Libertad, cambio y perseverancia.',
    style: 'Acuarela · color',
    bodyArea: 'Brazo, hombro o espalda',
    duration: 'Según tamaño y detalle; se confirma en consulta.',
  },
]

export const artistProfiles = [
  { slug: 'faver', label: 'Faver', specialty: 'Tatuador principal', experience: 'Creatividad, precisión y pasión en cada diseño.', image: '/images/team/faver.webp' },
  { slug: 'ernestor', label: 'Ernestor', specialty: 'Tatuador artístico', experience: 'Ideas únicas para un tatuaje inolvidable.', image: '/images/team/ernestor.webp' },
  { slug: 'jorge', label: 'Jorge', specialty: 'Tatuador especialista', experience: 'Tu historia, nuestro arte.', image: '/images/team/jorge.webp' },
]
