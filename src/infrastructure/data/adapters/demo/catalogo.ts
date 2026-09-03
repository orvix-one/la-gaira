/**
 * Catálogo del dataset de demostración (spec §4.1: datos de demostración
 * controlados). Sintético y determinista; NO son datos reales del negocio.
 */

export interface ProductoDemo {
  code: string;
  name: string;
  categoryName: string;
  subcategoryName: string;
  /** Precio base en BOB. */
  price: number;
}

export const SUCURSALES_DEMO = [
  { code: "scz-centro", name: "Santa Cruz — Centro" },
  { code: "scz-equipetrol", name: "Santa Cruz — Equipetrol" },
  { code: "scz-urubo", name: "Urubó" },
  { code: "scz-ventura", name: "Ventura Mall" },
  { code: "scz-norte", name: "Santa Cruz — Norte" },
  { code: "scz-sur", name: "Santa Cruz — Sur" },
  { code: "cbba-cala", name: "Cochabamba — Cala Cala" },
  { code: "lpz-sopocachi", name: "La Paz — Sopocachi" },
] as const;

const CATEGORIAS: ReadonlyArray<{
  nombre: string;
  subcategorias: readonly [string, string];
  precioBase: number;
  productos: readonly string[];
}> = [
  {
    nombre: "Parrilla",
    subcategorias: ["Cortes", "Especiales"],
    precioBase: 85,
    productos: [
      "Picaña", "Asado de tira", "Chorizo criollo", "Costilla BBQ",
      "Pollo a la brasa", "Churrasco", "Punta de anca", "Vacío",
      "Ojo de bife", "Entraña", "Pechuga grill", "Parrillada familiar",
      "Morcilla", "Riñones", "Tabla mixta", "Tira de asado",
    ],
  },
  {
    nombre: "Platos típicos",
    subcategorias: ["Almuerzos", "Cenas"],
    precioBase: 55,
    productos: [
      "Majadito", "Locro de gallina", "Sopa de maní", "Silpancho",
      "Pique macho", "Chicharrón", "Saice", "Ají de fideo",
      "Picante de pollo", "Charque cruceño", "Fricasé", "Chairo",
      "Ranga", "Sajta de pollo", "Cuñapé al horno", "Arroz con queso",
    ],
  },
  {
    nombre: "Bebidas",
    subcategorias: ["Sin alcohol", "Con alcohol"],
    precioBase: 18,
    productos: [
      "Gaseosa 500ml", "Agua mineral", "Agua saborizada", "Jugo natural",
      "Limonada fresca", "Mocochinchi", "Somó", "Refresco de linaza",
      "Cerveza nacional", "Cerveza importada", "Vino tinto copa", "Vino blanco copa",
      "Singani sour", "Chuflay", "Té con té", "Fernet con cola",
    ],
  },
  {
    nombre: "Cafetería",
    subcategorias: ["Calientes", "Fríos"],
    precioBase: 22,
    productos: [
      "Café americano", "Capuchino", "Espresso", "Latte",
      "Mocaccino", "Té negro", "Té de coca", "Chocolate caliente",
      "Frappé", "Café helado", "Mate de manzanilla", "Cortado",
      "Affogato", "Latte vainilla", "Macchiato caramelo", "Cold brew",
    ],
  },
  {
    nombre: "Postres",
    subcategorias: ["Tortas", "Helados"],
    precioBase: 32,
    productos: [
      "Torta tres leches", "Torta de chocolate", "Cheesecake de maracuyá", "Flan casero",
      "Helado 2 bolas", "Helado 3 bolas", "Brownie con helado", "Tiramisú",
      "Queso con dulce", "Arroz con leche", "Crema volteada", "Suspiro limeño",
      "Pie de limón", "Selva negra", "Copa tropical", "Budín de pan",
    ],
  },
  {
    nombre: "Entradas",
    subcategorias: ["Frías", "Calientes"],
    precioBase: 28,
    productos: [
      "Empanada de queso", "Empanada de carne", "Salteña", "Croqueta de pollo",
      "Palitos de queso", "Papas fritas", "Yuca frita", "Tequeños",
      "Canastitas de pollo", "Tabla de fiambres", "Surtido de quesos", "Pan de ajo",
      "Nachos con queso", "Anticucho", "Choripán", "Humita",
    ],
  },
];

export const PRODUCTOS_DEMO: readonly ProductoDemo[] = CATEGORIAS.flatMap(
  (categoria, catIndex) =>
    categoria.productos.map((nombre, prodIndex) => {
      const numero = catIndex * 16 + prodIndex + 1;
      return {
        code: `PRD-${String(numero).padStart(4, "0")}`,
        name: nombre,
        categoryName: categoria.nombre,
        subcategoryName: categoria.subcategorias[prodIndex % 2],
        price: categoria.precioBase + ((numero * 7) % 5) * 5,
      };
    }),
);
