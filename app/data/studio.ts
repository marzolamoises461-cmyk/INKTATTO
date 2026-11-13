import fujiSamurai from '../assets/ChatGPT Image 10 sept 2026, 15_29_35.png'
import toriiArtwork from '../assets/ChatGPT Image 10 sept 2026, 15_30_04.png'

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

export const categories = ['Todos', 'Dragones', 'Samuráis', 'Hannya', 'Koi', 'Serpientes', 'Sakura']

export const designs: TattooDesign[] = [
  {
    slug: 'ryu-del-crepusculo',
    name: 'Ryū del crepúsculo',
    category: 'Dragones',
    image: 'https://images.stockcake.com/public/f/0/5/f051293e-c5a8-467b-b11a-80b54846686b_large/japanese-dragon-tattoo-stockcake.jpg',
    imageAlt: 'Tatuaje japonés irezumi de un dragón verde y rojo entre olas, flores de sakura y nubes oscuras',
    description: 'Un dragón japonés asciende entre nubes de tinta y viento, en una composición que sigue el movimiento natural del cuerpo.',
    meaning: 'El dragón representa sabiduría, fuerza y protección; su ascenso evoca transformación y perseverancia.',
    style: 'Irezumi tradicional · negro y rojo',
    bodyArea: 'Espalda, brazo completo o muslo',
    duration: 'Varias sesiones; duración por definir según tamaño y detalle.',
  },
  {
    slug: 'ronin-del-fuji',
    name: 'Rōnin del Fuji',
    category: 'Samuráis',
    image: fujiSamurai,
    imageAlt: 'Guerrero frente al monte Fuji y flores de sakura',
    description: 'Una escena cinematográfica de un guerrero solitario ante el Fuji, enmarcada por pétalos de cerezo.',
    meaning: 'El rōnin simboliza independencia, disciplina y el valor de seguir un camino propio.',
    style: 'Composición japonesa · blackwork y acento carmesí',
    bodyArea: 'Espalda, hombro o pantorrilla',
    duration: 'Varias sesiones; duración por definir según tamaño y detalle.',
  },
  {
    slug: 'hannya-escarlata',
    name: 'Hannya escarlata',
    category: 'Hannya',
    image: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Composición de tatuaje en tinta oscura',
    description: 'Máscara Hannya de trazos expresivos y sombras profundas, equilibrada con detalles rojos.',
    meaning: 'La máscara expresa emociones intensas y también funciona como símbolo de protección frente a la adversidad.',
    style: 'Irezumi · blackwork con acentos rojos',
    bodyArea: 'Hombro, brazo o muslo',
    duration: 'Una o más sesiones, según escala y nivel de detalle.',
  },
  {
    slug: 'koi-corriente-arriba',
    name: 'Koi corriente arriba',
    category: 'Koi',
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Tatuaje de inspiración japonesa en el brazo',
    description: 'Una carpa koi atraviesa el agua en una pieza fluida, pensada para adaptarse a la forma del brazo.',
    meaning: 'La carpa koi representa determinación, paciencia y la capacidad de avanzar contra corriente.',
    style: 'Irezumi tradicional · color y olas',
    bodyArea: 'Brazo, pierna o espalda',
    duration: 'Varias sesiones; duración por definir según tamaño y detalle.',
  },
  {
    slug: 'serpiente-nocturna',
    name: 'Hebi nocturna',
    category: 'Serpientes',
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Diseño de tatuaje oscuro de inspiración japonesa',
    description: 'Una serpiente se enrosca entre hojas y sombras, creando una silueta dinámica y envolvente.',
    meaning: 'La serpiente evoca renovación, adaptación y protección.',
    style: 'Japonés contemporáneo · negro y grises',
    bodyArea: 'Brazo, costillas o pierna',
    duration: 'Una o más sesiones, según escala y nivel de detalle.',
  },
  {
    slug: 'sakura-de-medianoche',
    name: 'Sakura de medianoche',
    category: 'Sakura',
    image: toriiArtwork,
    imageAlt: 'Puerta torii y flores de cerezo bajo un sol rojo',
    description: 'Flores de cerezo enmarcan una puerta torii, con contraste marcado entre tinta y rojo.',
    meaning: 'La sakura recuerda la belleza de lo transitorio y la importancia de cada instante.',
    style: 'Japonés tradicional · línea fina y rojo',
    bodyArea: 'Hombro, brazo o espalda',
    duration: 'Una o más sesiones, según escala y nivel de detalle.',
  },
  {
    slug: 'oni-guardian',
    name: 'Oni guardián',
    category: 'Hannya',
    image: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Arte de tatuaje en blanco y negro',
    description: 'Una figura protectora de carácter intenso, compuesta con líneas contundentes y sombras de grabado.',
    meaning: 'El oni puede representar fuerza y custodia frente a aquello que amenaza el equilibrio.',
    style: 'Irezumi · grabado en negro',
    bodyArea: 'Brazo, espalda o muslo',
    duration: 'Una o más sesiones, según escala y nivel de detalle.',
  },
  {
    slug: 'koi-luna-roja',
    name: 'Koi bajo la luna roja',
    category: 'Koi',
    image: fujiSamurai,
    imageAlt: 'Paisaje japonés nocturno con un sol rojo',
    description: 'Una interpretación gráfica de la carpa koi en diálogo con el agua y el disco rojo.',
    meaning: 'Un motivo de cambio, perseverancia y equilibrio entre fuerza y calma.',
    style: 'Japonés contemporáneo · negro y rojo',
    bodyArea: 'Pantorrilla, brazo o espalda',
    duration: 'Una o más sesiones, según escala y nivel de detalle.',
  },
]

export const artistProfiles = [
  { slug: 'faver', label: 'Faver', specialty: 'Tatuador principal', experience: 'Creatividad, precisión y pasión en cada diseño.', image: '/images/team/faver.webp' },
  { slug: 'ernestor', label: 'Ernestor', specialty: 'Tatuador artístico', experience: 'Ideas únicas para un tatuaje inolvidable.', image: '/images/team/ernestor.webp' },
  { slug: 'jorge', label: 'Jorge', specialty: 'Tatuador especialista', experience: 'Tu historia, nuestro arte.', image: '/images/team/jorge.webp' },
]
