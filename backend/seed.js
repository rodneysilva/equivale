// Seed data for equivale marketplace
// Run: mongosh mongodb://localhost:27017/equivale seed.js

db = db.getSiblingDB("equivale");

// Clear existing data
db.users.deleteMany({});
db.products.deleteMany({});
db.services.deleteMany({});
db.communities.deleteMany({});
db.transactions.deleteMany({});
db.reviews.deleteMany({});

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

// =============================================
// USERS (8 users + 1 admin)
// =============================================
const users = [
  { _id: "user_admin", name: "Admin Equivale", email: "admin@equivale.com", passwordHash: "$2a$11$placeholder_admin_hash", avatarUrl: null, bio: "Administrador da plataforma equivale.", role: 0, walletBalance: 0, createdAt: daysAgo(90), updatedAt: now },
  { _id: "user_maria", name: "Maria Oliveira", email: "maria@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Apaixonada por artesanato e costura. Trabalho com crochê e patchwork há 10 anos.", role: 1, walletBalance: 350, createdAt: daysAgo(60), updatedAt: now },
  { _id: "user_joao", name: "João Silva", email: "joao@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Desenvolvedor full-stack e professor de programação. Gosto de compartilhar conhecimento.", role: 1, walletBalance: 500, createdAt: daysAgo(55), updatedAt: now },
  { _id: "user_ana", name: "Ana Costa", email: "ana@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Nutricionista e cozinheira amadora. Especialista em comida vegana e saudável.", role: 1, walletBalance: 200, createdAt: daysAgo(45), updatedAt: now },
  { _id: "user_carlos", name: "Carlos Mendes", email: "carlos@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Fotógrafo freelancer e designer gráfico. Crio imagens que contam histórias.", role: 1, walletBalance: 420, createdAt: daysAgo(40), updatedAt: now },
  { _id: "user_lucia", name: "Lúcia Ferreira", email: "lucia@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Professora de yoga e meditação. Terapeuta holística com 15 anos de experiência.", role: 1, walletBalance: 180, createdAt: daysAgo(35), updatedAt: now },
  { _id: "user_pedro", name: "Pedro Santos", email: "pedro@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Marceneiro e restaurador de móveis. Transformo madeira velha em arte.", role: 1, walletBalance: 275, createdAt: daysAgo(30), updatedAt: now },
  { _id: "user_julia", name: "Júlia Almeida", email: "julia@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Musicista e professora de violão. Toco em bares e dou aulas particulares.", role: 1, walletBalance: 310, createdAt: daysAgo(25), updatedAt: now },
  { _id: "user_rafael", name: "Rafael Lima", email: "rafael@email.com", passwordHash: "$2a$11$placeholder_hash", avatarUrl: null, bio: "Jardineiro e paisagista. Cultivo orquídeas e plantas raras.", role: 1, walletBalance: 150, createdAt: daysAgo(20), updatedAt: now }
];

db.users.insertMany(users);
print("✅ " + users.length + " users inserted");

// =============================================
// PRODUCTS (15 produtos variados)
// =============================================
const products = [
  { _id: "prod_01", sellerId: "user_maria", title: "Cachecol de Crochê Artesanal", description: "Cachecol feito à mão com fio de algodão orgânico. Padrão exclusivo em tons terrosos. Tamanho universal.", category: "Artesanato", priceInEquivale: NumberDecimal("45"), images: [], status: 0, createdAt: daysAgo(20), updatedAt: daysAgo(20) },
  { _id: "prod_02", sellerId: "user_maria", title: "Conjunto de Amigurumi - Família de Ursos", description: "Conjunto com 4 ursinhos de crochê (papai, mamãe e 2 filhotes). Feito com fio acrílico premium, seguro para crianças.", category: "Artesanato", priceInEquivale: NumberDecimal("65"), images: [], status: 0, createdAt: daysAgo(15), updatedAt: daysAgo(15) },
  { _id: "prod_03", sellerId: "user_carlos", title: "Kit Fotográfico para Retrato em Casa", description: "Guia completo + templates de iluminação caseira para fotos de retrato profissional. Inclui presets para edição.", category: "Fotografia", priceInEquivale: NumberDecimal("30"), images: [], status: 0, createdAt: daysAgo(18), updatedAt: daysAgo(18) },
  { _id: "prod_04", sellerId: "user_carlos", title: "Impressão Fine Art A3 - Paisagem Brasileira", description: "Impressão em papel algodão 300g de paisagem capturada no litoral paulista. Edição limitada, assinada.", category: "Arte", priceInEquivale: NumberDecimal("55"), images: [], status: 0, createdAt: daysAgo(12), updatedAt: daysAgo(12) },
  { _id: "prod_05", sellerId: "user_pedro", title: "Banqueta de Madeira de Demolição", description: "Banqueta rústica feita com madeira reaproveitada de construções. Acabamento em óleo natural. Cada peça é única.", category: "Madeira", priceInEquivale: NumberDecimal("80"), images: [], status: 0, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { _id: "prod_06", sellerId: "user_pedro", title: "Estante Flutuante de Pallet", description: "Estante feita com pallets tratados e lixados. Perfeita para livros e plantas. 1m x 0.60m.", category: "Madeira", priceInEquivale: NumberDecimal("95"), images: [], status: 0, createdAt: daysAgo(8), updatedAt: daysAgo(8) },
  { _id: "prod_07", sellerId: "user_ana", title: "Kit de Temperos Artesanais - 5 Especiarias", description: "Conjunto com páprica defumada, cúrcuma moída, pimenta dedo-de-moça, alecrim seco e mix de ervas finas. Embalagem sustentável.", category: "Alimentação", priceInEquivale: NumberDecimal("25"), images: [], status: 0, createdAt: daysAgo(14), updatedAt: daysAgo(14) },
  { _id: "prod_08", sellerId: "user_ana", title: "Geleia de Pimenta com Manga", description: "Geleia artesanal de manga com pimenta biquinho. Perfeita para acompanhar queijos e carnes. Pote de 250g.", category: "Alimentação", priceInEquivale: NumberDecimal("20"), images: [], status: 0, createdAt: daysAgo(7), updatedAt: daysAgo(7) },
  { _id: "prod_09", sellerId: "user_rafael", title: "Muda de Orquídea Phalaenopsis", description: "Muda saudável de orquídea Phalaenopsis branca. Inclui substrato e guia de cuidados. A planta vem em vaso de cerâmica.", category: "Jardinagem", priceInEquivale: NumberDecimal("50"), images: [], status: 0, createdAt: daysAgo(16), updatedAt: daysAgo(16) },
  { _id: "prod_10", sellerId: "user_rafael", title: "Kit de Suculentas Raras - 6 Variedades", description: "Conjunto com 6 mudas de suculentas raras em vasinhos de barro. Inclui Echeveria, Haworthia, Lithops e mais.", category: "Jardinagem", priceInEquivale: NumberDecimal("35"), images: [], status: 0, createdAt: daysAgo(5), updatedAt: daysAgo(5) },
  { _id: "prod_11", sellerId: "user_julia", title: "Pulseira de Sementes e Cordão Trançado", description: "Pulseira feita com sementes de açaí e cordão de algodão trançado à mão. Design boho.", category: "Artesanato", priceInEquivale: NumberDecimal("15"), images: [], status: 0, createdAt: daysAgo(11), updatedAt: daysAgo(11) },
  { _id: "prod_12", sellerId: "user_joao", title: "Template de Portfólio para Devs", description: "Template HTML/CSS/JS responsivo para portfólio de desenvolvedores. Inclui seções de projetos, blog e contato.", category: "Tecnologia", priceInEquivale: NumberDecimal("40"), images: [], status: 0, createdAt: daysAgo(13), updatedAt: daysAgo(13) },
  { _id: "prod_13", sellerId: "user_lucia", title: "Kit de Incensos Artesanais - 10 Unidades", description: "Incensos feitos com ervas naturais e óleos essenciais. Aromas: lavanda, sândalo, alecrim, eucalipto e mais.", category: "Bem-estar", priceInEquivale: NumberDecimal("22"), images: [], status: 0, createdAt: daysAgo(9), updatedAt: daysAgo(9) },
  { _id: "prod_14", sellerId: "user_lucia", title: "Vela Aromática de Cera de Soja", description: "Vela de cera de soja 100% natural com óleo essencial de laranja doce e canela. Duração: ~40h.", category: "Bem-estar", priceInEquivale: NumberDecimal("28"), images: [], status: 0, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
  { _id: "prod_15", sellerId: "user_carlos", title: "Presets de Edição de Fotos - Pack Natureza", description: "15 presets para Lightroom com foco em paisagens e natureza brasileira. Tons quentes e vibrantes.", category: "Fotografia", priceInEquivale: NumberDecimal("20"), images: [], status: 0, createdAt: daysAgo(2), updatedAt: daysAgo(2) }
];

db.products.insertMany(products);
print("✅ " + products.length + " products inserted");

// =============================================
// SERVICES (12 serviços variados)
// =============================================
const services = [
  { _id: "serv_01", providerId: "user_joao", title: "Aula Particular de JavaScript/TypeScript", description: "Aula de 1h para iniciantes ou intermediários. Aprendemos na prática: criamos um mini-projeto real juntos.", category: "Educação", priceInEquivale: NumberDecimal("35"), duration: "01:00:00", location: "Online (Google Meet)", status: 0, createdAt: daysAgo(25), updatedAt: daysAgo(25) },
  { _id: "serv_02", providerId: "user_joao", title: "Review e Refatoração de Código", description: "Envie seu código que eu analiso, dou feedback detalhado e sugiro melhorias de performance e boas práticas.", category: "Tecnologia", priceInEquivale: NumberDecimal("50"), duration: "02:00:00", location: "Online (assíncrono)", status: 0, createdAt: daysAgo(18), updatedAt: daysAgo(18) },
  { _id: "serv_03", providerId: "user_ana", title: "Montagem de Cardápio Semanal Vegano", description: "Monto um cardápio completo de 7 dias com receitas, lista de compras e dicas de preparo. 100% vegano.", category: "Culinária", priceInEquivale: NumberDecimal("40"), duration: "00:30:00", location: "Online", status: 0, createdAt: daysAgo(20), updatedAt: daysAgo(20) },
  { _id: "serv_04", providerId: "user_ana", title: "Aula de Culinária - Massa Fresca", description: "Aula de 2h aprendendo a fazer massa fresca (pasta, nhoque e ravioli) do zero. Inclui lista de ingredientes.", category: "Culinária", priceInEquivale: NumberDecimal("55"), duration: "02:00:00", location: "Presencial - São Paulo (Zona Sul)", status: 0, createdAt: daysAgo(12), updatedAt: daysAgo(12) },
  { _id: "serv_05", providerId: "user_carlos", title: "Ensaio Fotográfico Profissional", description: "Ensaio de 1h em estúdio ou local externo. Inclui 15 fotos editadas em alta resolução.", category: "Fotografia", priceInEquivale: NumberDecimal("100"), duration: "01:00:00", location: "São Paulo capital ou online", status: 0, createdAt: daysAgo(15), updatedAt: daysAgo(15) },
  { _id: "serv_06", providerId: "user_carlos", title: "Design de Logo para Seu Projeto", description: "Crio 3 opções de logo para seu projeto/negócio. Inclui revisões e entrega em PNG, SVG e PDF.", category: "Design", priceInEquivale: NumberDecimal("75"), duration: "03:00:00", location: "Online", status: 0, createdAt: daysAgo(8), updatedAt: daysAgo(8) },
  { _id: "serv_07", providerId: "user_lucia", title: "Sessão de Yoga e Meditação", description: "Sessão de 1h combinando técnicas de Hatha Yoga e meditação guiada. Adapta para todos os níveis.", category: "Saúde", priceInEquivale: NumberDecimal("30"), duration: "01:00:00", location: "Online (Zoom) ou presencial", status: 0, createdAt: daysAgo(22), updatedAt: daysAgo(22) },
  { _id: "serv_08", providerId: "user_lucia", title: "Consultoria de Bem-Estar e Hábitos", description: "Avaliação dos seus hábitos diários e plano personalizado de rotina saudável. Inclui acompanhamento por 2 semanas.", category: "Saúde", priceInEquivale: NumberDecimal("60"), duration: "01:30:00", location: "Online", status: 0, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { _id: "serv_09", providerId: "user_pedro", title: "Restauração de Móvel Antigo", description: "Avaliação + restauração de 1 móvel pequeno (cadeira, mesa lateral, criado-mudo). Lixamento, pintura e acabamento.", category: "Madeira", priceInEquivale: NumberDecimal("90"), duration: "05:00:00", location: "Atendimento em domicílio - São Paulo", status: 0, createdAt: daysAgo(17), updatedAt: daysAgo(17) },
  { _id: "serv_10", providerId: "user_julia", title: "Aula de Violão para Iniciantes", description: "Aula de 1h para quem nunca tocou violão. Aprenda acordes básicos e sua primeira música.", category: "Música", priceInEquivale: NumberDecimal("25"), duration: "01:00:00", location: "Online ou presencial - SP", status: 0, createdAt: daysAgo(14), updatedAt: daysAgo(14) },
  { _id: "serv_11", providerId: "user_julia", title: "Seresta Personalizada - 3 Músicas", description: "Gravo 3 músicas de sua escolha em violão e voz, com vídeo de alta qualidade para presentear alguém.", category: "Música", priceInEquivale: NumberDecimal("70"), duration: "02:00:00", location: "Online", status: 0, createdAt: daysAgo(6), updatedAt: daysAgo(6) },
  { _id: "serv_12", providerId: "user_rafael", title: "Projeto de Jardim Pequeno", description: "Elaboro um projeto completo para jardim de até 20m²: plantas ideais, disposição, substrato e cronograma de plantio.", category: "Jardinagem", priceInEquivale: NumberDecimal("45"), duration: "01:00:00", location: "Online com visita opcional", status: 0, createdAt: daysAgo(9), updatedAt: daysAgo(9) }
];

db.services.insertMany(services);
print("✅ " + services.length + " services inserted");

// =============================================
// COMMUNITIES (6 comunidades)
// =============================================
const communities = [
  { _id: "comm_01", name: "Artesãos do Brasil", description: "Comunidade para quem faz artesanato: crochê, tricô, patchwork, cerâmica e muito mais. Compartilhe técnicas, tire dúvidas e troque trabalhos!", bannerUrl: null, creatorId: "user_maria", members: ["user_maria", "user_ana", "user_julia", "user_lucia", "user_rafael"], createdAt: daysAgo(50), updatedAt: daysAgo(5) },
  { _id: "comm_02", name: "Dev Exchange", description: "Desenvolvedores trocando conhecimento e serviços. Código review, pair programming, mentorias e projetos open source juntos.", bannerUrl: null, creatorId: "user_joao", members: ["user_joao", "user_carlos", "user_pedro"], createdAt: daysAgo(40), updatedAt: daysAgo(3) },
  { _id: "comm_03", name: "Cozinha Colaborativa", description: "Receitas, dicas de culinária e troca de alimentos artesanais. Veganos e onívoros todos bem-vindos!", bannerUrl: null, creatorId: "user_ana", members: ["user_ana", "user_maria", "user_joao", "user_carlos", "user_julia", "user_pedro", "user_rafael"], createdAt: daysAgo(35), updatedAt: daysAgo(2) },
  { _id: "comm_04", name: "Bem-Estar e Mindfulness", description: "Espaço para compartilhar práticas de yoga, meditação, alimentação saudável e cuidados com a mente e corpo.", bannerUrl: null, creatorId: "user_lucia", members: ["user_lucia", "user_ana", "user_julia", "user_maria"], createdAt: daysAgo(30), updatedAt: daysAgo(7) },
  { _id: "comm_05", name: "Mão na Massa - Marcenaria", description: "Para marceneiros, carpinteiros e entusiastas de madeira. Projetos DIY, técnicas e troca de serviços de marcenaria.", bannerUrl: null, creatorId: "user_pedro", members: ["user_pedro", "user_joao", "user_rafael"], createdAt: daysAgo(25), updatedAt: daysAgo(10) },
  { _id: "comm_06", name: "Músicos Independentes", description: "Conectando músicos para colaborações, jams e troca de serviços. Violão, canto, produção musical e mais.", bannerUrl: null, creatorId: "user_julia", members: ["user_julia", "user_carlos", "user_lucia", "user_ana"], createdAt: daysAgo(15), updatedAt: daysAgo(1) }
];

db.communities.insertMany(communities);
print("✅ " + communities.length + " communities inserted");

// =============================================
// TRANSACTIONS (10 transações de exemplo)
// =============================================
const transactions = [
  { _id: "txn_01", fromUserId: "user_joao", toUserId: "user_maria", amount: NumberDecimal("45"), description: "Compra: Cachecol de Crochê Artesanal", transactionType: 0, relatedItemId: "prod_01", createdAt: daysAgo(18) },
  { _id: "txn_02", fromUserId: "user_carlos", toUserId: "user_joao", amount: NumberDecimal("50"), description: "Compra: Review e Refatoração de Código", transactionType: 0, relatedItemId: "serv_02", createdAt: daysAgo(16) },
  { _id: "txn_03", fromUserId: "user_maria", toUserId: "user_lucia", amount: NumberDecimal("30"), description: "Compra: Sessão de Yoga e Meditação", transactionType: 0, relatedItemId: "serv_07", createdAt: daysAgo(14) },
  { _id: "txn_04", fromUserId: "user_ana", toUserId: "user_pedro", amount: NumberDecimal("90"), description: "Compra: Restauração de Móvel Antigo", transactionType: 0, relatedItemId: "serv_09", createdAt: daysAgo(12) },
  { _id: "txn_05", fromUserId: "user_julia", toUserId: "user_ana", amount: NumberDecimal("40"), description: "Compra: Cardápio Semanal Vegano", transactionType: 0, relatedItemId: "serv_03", createdAt: daysAgo(10) },
  { _id: "txn_06", fromUserId: "user_rafael", toUserId: "user_carlos", amount: NumberDecimal("100"), description: "Compra: Ensaio Fotográfico Profissional", transactionType: 0, relatedItemId: "serv_05", createdAt: daysAgo(8) },
  { _id: "txn_07", fromUserId: "user_pedro", toUserId: "user_rafael", amount: NumberDecimal("50"), description: "Compra: Muda de Orquídea Phalaenopsis", transactionType: 0, relatedItemId: "prod_09", createdAt: daysAgo(6) },
  { _id: "txn_08", fromUserId: "user_admin", toUserId: "user_joao", amount: NumberDecimal("100"), description: "Bônus de boas-vindas", transactionType: 2, relatedItemId: null, createdAt: daysAgo(55) },
  { _id: "txn_09", fromUserId: "user_admin", toUserId: "user_maria", amount: NumberDecimal("100"), description: "Bônus de boas-vindas", transactionType: 2, relatedItemId: null, createdAt: daysAgo(60) },
  { _id: "txn_10", fromUserId: "user_joao", toUserId: "user_julia", amount: NumberDecimal("25"), description: "Transferência: ajuda com aulas", transactionType: 1, relatedItemId: null, createdAt: daysAgo(4) }
];

db.transactions.insertMany(transactions);
print("✅ " + transactions.length + " transactions inserted");

// =============================================
// REVIEWS (10 reviews de exemplo)
// =============================================
const reviews = [
  { _id: "rev_01", reviewerId: "user_joao", targetUserId: "user_maria", itemId: "prod_01", itemType: "Product", rating: 5, comment: "Cachecol lindo! A Maria foi super atenciosa e a qualidade do trabalho é incrível.", createdAt: daysAgo(17) },
  { _id: "rev_02", reviewerId: "user_carlos", targetUserId: "user_joao", itemId: "serv_02", itemType: "Service", rating: 5, comment: "Excelente review de código! O João identificou bugs que eu não tinha percebido e sugeriu melhorias geniais.", createdAt: daysAgo(15) },
  { _id: "rev_03", reviewerId: "user_maria", targetUserId: "user_lucia", itemId: "serv_07", itemType: "Service", rating: 4, comment: "Sessão muito relaxante. Me senti renovada! Só acho que poderia ter mais variações de postura.", createdAt: daysAgo(13) },
  { _id: "rev_04", reviewerId: "user_ana", targetUserId: "user_pedro", itemId: "serv_09", itemType: "Service", rating: 5, comment: "Pedro é um artesão! Restaurou minha cadeira de forma que ficou melhor que o original.", createdAt: daysAgo(11) },
  { _id: "rev_05", reviewerId: "user_julia", targetUserId: "user_ana", itemId: "serv_03", itemType: "Service", rating: 5, comment: "Cardápio incrível! As receitas são fáceis de seguir e muito saborosas. Já fiz 3 delas!", createdAt: daysAgo(9) },
  { _id: "rev_06", reviewerId: "user_rafael", targetUserId: "user_carlos", itemId: "serv_05", itemType: "Service", rating: 5, comment: "Melhor ensaio que já fiz! Carlos tem um olhar único e as fotos ficaram profissionais.", createdAt: daysAgo(7) },
  { _id: "rev_07", reviewerId: "user_pedro", targetUserId: "user_rafael", itemId: "prod_09", itemType: "Product", rating: 4, comment: "Orquídea chegou saudável e bem embalada. Só demorou um pouco mais do que o esperado.", createdAt: daysAgo(5) },
  { _id: "rev_08", reviewerId: "user_joao", targetUserId: "user_julia", itemId: "serv_10", itemType: "Service", rating: 4, comment: "Júlia é paciente e didática. Em uma aula já consegui tocar minha primeira música completa!", createdAt: daysAgo(13) },
  { _id: "rev_09", reviewerId: "user_lucia", targetUserId: "user_ana", itemId: "prod_08", itemType: "Product", rating: 5, comment: "Geleia deliciosa! O equilíbrio entre doce e picante é perfeito.", createdAt: daysAgo(6) },
  { _id: "rev_10", reviewerId: "user_carlos", targetUserId: "user_pedro", itemId: "prod_06", itemType: "Product", rating: 5, comment: "Estante ficou linda! Acabamento impecável e o Pedro ajudou a instalar. Recomendo demais.", createdAt: daysAgo(3) }
];

db.reviews.insertMany(reviews);
print("✅ " + reviews.length + " reviews inserted");

// Summary
print("\n=== SEED COMPLETE ===");
print("Users:       " + db.users.countDocuments());
print("Products:    " + db.products.countDocuments());
print("Services:    " + db.services.countDocuments());
print("Communities: " + db.communities.countDocuments());
print("Transactions:" + db.transactions.countDocuments());
print("Reviews:     " + db.reviews.countDocuments());
print("====================");
