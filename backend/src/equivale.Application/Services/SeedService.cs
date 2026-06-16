using equivale.Application.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;

namespace equivale.Application.Services;

public class SeedOptions
{
    public int Users { get; set; } = 14;
    public int Communities { get; set; } = 8;
    public int Products { get; set; } = 50;
    public int Services { get; set; } = 30;
    public bool ResetCollections { get; set; } = false;
}

public class SeedService
{
    private readonly IUserRepository _userRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IProductRepository _productRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IBaseRepository<Review> _reviewRepository;

    private static readonly string SeedPassword = "Eql@2026";
    private string _passwordHash = string.Empty;
    private Random _rng = new(42);

    public SeedService(
        IUserRepository userRepository,
        ICommunityRepository communityRepository,
        IProductRepository productRepository,
        IServiceRepository serviceRepository,
        IPasswordHasher passwordHasher,
        ITransactionRepository transactionRepository,
        IBaseRepository<Review> reviewRepository)
    {
        _userRepository = userRepository;
        _communityRepository = communityRepository;
        _productRepository = productRepository;
        _serviceRepository = serviceRepository;
        _passwordHasher = passwordHasher;
        _transactionRepository = transactionRepository;
        _reviewRepository = reviewRepository;
    }

    public async Task<SeedResult> RunAsync(SeedOptions opts, CancellationToken ct = default)
    {
        _passwordHash = _passwordHasher.Hash(SeedPassword);

        if (opts.ResetCollections)
        {
            await ResetCollectionsAsync(ct);
            // Reset RNG for deterministic data after clearing
            _rng = new Random(42);
        }

        // Promote known admin user
        await PromoteAdminAsync(ct);

        // Ensure treasury user exists for fee collection
        await EnsureTreasuryUserAsync(ct);

        // Get admin user to include in seed data
        var adminUser = await _userRepository.GetByEmailAsync(new Email("rodneydocarmo@gmail.com"), ct);

        var users = await SeedUsersAsync(opts.Users, ct);
        if (adminUser is not null) users["admin"] = adminUser;
        var communities = await SeedCommunitiesAsync(opts.Communities, users, ct);
        var products = await SeedProductsAsync(opts.Products, users, communities, ct);
        var services = await SeedServicesAsync(opts.Services, users, communities, ct);
        var transactions = await SeedTransactionsAsync(users, ct);
        var reviews = await SeedReviewsAsync(ct);
        return new SeedResult(users.Count, communities.Count, products, services, transactions, reviews);
    }

    private async Task ResetCollectionsAsync(CancellationToken ct)
    {
        await _productRepository.DeleteAllAsync(ct);
        await _serviceRepository.DeleteAllAsync(ct);
        await _communityRepository.DeleteAllAsync(ct);
        await _userRepository.DeleteAllAsync(ct);
        await _transactionRepository.DeleteAllAsync(ct);
        await _reviewRepository.DeleteAllAsync(ct);
    }

    private async Task PromoteAdminAsync(CancellationToken ct)
    {
        var adminEmail = new Email("rodneydocarmo@gmail.com");
        var existing = await _userRepository.GetByEmailAsync(adminEmail, ct);
        if (existing is not null)
        {
            if (existing.Role != UserRole.Admin)
            {
                existing.Role = UserRole.Admin;
                existing.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(existing, ct);
            }
        }
        else
        {
            // Create admin user if doesn't exist (after reset)
            var admin = new User
            {
                Name = "Rodney",
                Email = adminEmail,
                PasswordHash = _passwordHasher.Hash("123Mudar!"),
                Bio = "Administrador da plataforma equivale.",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow.AddDays(-100),
                UpdatedAt = DateTime.UtcNow.AddDays(-100),
            };
            admin.Credit(10000);
            await _userRepository.AddAsync(admin, ct);
        }
    }

    private async Task EnsureTreasuryUserAsync(CancellationToken ct)
    {
        var treasuryEmail = new Email("tesouraria@equivale");
        var existing = await _userRepository.GetByEmailAsync(treasuryEmail, ct);
        if (existing is not null) return;
        var treasury = new User
        {
            Name = "Tesouraria Eqüivale",
            Email = treasuryEmail,
            PasswordHash = _passwordHash,
            Bio = "Conta da tesouraria para arrecadação de taxas da plataforma.",
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        await _userRepository.AddAsync(treasury, ct);
    }

    private async Task<int> SeedTransactionsAsync(Dictionary<string, User> users, CancellationToken ct)
    {
        var userList = users.Values.ToList();
        if (userList.Count < 3) return 0;

        var products = await _productRepository.GetAllAsync(ct);
        var services = await _serviceRepository.GetAllAsync(ct);
        var statuses = new[] { TransactionStatus.OrderPlaced, TransactionStatus.OrderConfirmed, TransactionStatus.Shipped, TransactionStatus.Delivered, TransactionStatus.Finished, TransactionStatus.Cancelled };
        var count = 0;

        foreach (var user in userList)
        {
            foreach (var status in statuses)
            {
                var product = products.FirstOrDefault(p => p.SellerId != user.Id);
                var service = services.FirstOrDefault(s => s.ProviderId != user.Id);
                var useProduct = _rng.NextDouble() > 0.5;

                string sellerId, itemId, itemTitle; decimal price, shipping; TransactionItemType itemType;

                if (useProduct && product is not null)
                { sellerId = product.SellerId; itemId = product.Id; itemTitle = product.Title; price = product.PriceInEquivale.Amount; itemType = TransactionItemType.Product; shipping = product.ShippingCost; }
                else if (service is not null)
                { sellerId = service.ProviderId; itemId = service.Id; itemTitle = service.Title; price = service.PriceInEquivale.Amount; itemType = TransactionItemType.Service; shipping = 0; }
                else continue;

                var qty = _rng.Next(1, 3);
                var daysAgo = _rng.Next(1, 30);
                var total = price * qty + shipping;
                var tx = new Transaction
                {
                    BuyerId = user.Id, SellerId = sellerId, ItemType = itemType, ItemId = itemId, ItemTitle = itemTitle,
                    Quantity = qty, UnitPrice = new Money(price), ShippingCost = shipping, TotalPrice = new Money(total),
                    Status = status,
                    OrderPlacedAt = DateTime.UtcNow.AddDays(-daysAgo),
                    CreatedAt = DateTime.UtcNow.AddDays(-daysAgo), UpdatedAt = DateTime.UtcNow.AddDays(-daysAgo),
                };

                if (status >= TransactionStatus.OrderConfirmed) tx.OrderConfirmedAt = DateTime.UtcNow.AddDays(-daysAgo + 1);
                if (status >= TransactionStatus.Shipped) { tx.ShippedAt = DateTime.UtcNow.AddDays(-daysAgo + 2); tx.TrackingInfo = $"Rastreio {_rng.Next(10000, 99999)}"; }
                if (status >= TransactionStatus.Delivered) tx.DeliveredAt = DateTime.UtcNow.AddDays(-daysAgo + 3);
                if (status == TransactionStatus.Finished) tx.FinishedAt = DateTime.UtcNow.AddDays(-daysAgo + 4);
                if (status == TransactionStatus.Cancelled) { tx.CancelledAt = DateTime.UtcNow.AddDays(-daysAgo + 1); }

                await _transactionRepository.AddAsync(tx, ct);
                count++;

                // Seller-side transaction
                var buyer = userList.FirstOrDefault(u => u.Id != user.Id && u.Id != sellerId);
                if (buyer is null) continue;
                var tx2 = new Transaction
                {
                    BuyerId = buyer.Id, SellerId = user.Id, ItemType = itemType, ItemId = itemId, ItemTitle = itemTitle,
                    Quantity = 1, UnitPrice = new Money(price), ShippingCost = shipping, TotalPrice = new Money(price + shipping),
                    Status = status,
                    OrderPlacedAt = DateTime.UtcNow.AddDays(-daysAgo - 5),
                    CreatedAt = DateTime.UtcNow.AddDays(-daysAgo - 5), UpdatedAt = DateTime.UtcNow.AddDays(-daysAgo - 5),
                };
                if (status >= TransactionStatus.OrderConfirmed) tx2.OrderConfirmedAt = DateTime.UtcNow.AddDays(-daysAgo - 4);
                if (status >= TransactionStatus.Shipped) { tx2.ShippedAt = DateTime.UtcNow.AddDays(-daysAgo - 3); tx2.TrackingInfo = $"Rastreio {_rng.Next(10000, 99999)}"; }
                if (status >= TransactionStatus.Delivered) tx2.DeliveredAt = DateTime.UtcNow.AddDays(-daysAgo - 2);
                if (status == TransactionStatus.Finished) tx2.FinishedAt = DateTime.UtcNow.AddDays(-daysAgo - 1);
                if (status == TransactionStatus.Cancelled) { tx2.CancelledAt = DateTime.UtcNow.AddDays(-daysAgo - 4); }

                await _transactionRepository.AddAsync(tx2, ct);
                count++;
                if (count >= userList.Count * 14) break;
            }
        }
        return count;
    }

    private async Task<int> SeedReviewsAsync(CancellationToken ct)
    {
        var allTransactions = await _transactionRepository.GetAllAsync(ct);
        var completed = allTransactions.Where(t => t.Status == TransactionStatus.Finished).ToList();
        if (completed.Count == 0) return 0;

        var existingReviews = await _reviewRepository.GetAllAsync(ct);
        var reviewedTxIds = existingReviews.Select(r => r.TransactionId).ToHashSet();

        var reviewComments = new[]
        {
            "Excelente! Entrega rápida e produto de ótima qualidade.",
            "Muito bom, recomendo! Vendedor atencioso.",
            "Transação perfeita, tudo conforme combinado.",
            "Produto chegou em perfeito estado. Obrigado!",
            "Ótimo atendimento, super recomendo.",
            "Rápido e confiável. Voltarei a comprar.",
            "Qualidade excelente pelo preço.",
            "Serviço prestado com profissionalismo.",
            "Muito satisfeito com a compra!",
            "Comunicação clara e entrega no prazo.",
            null, null, null // some without comment
        };

        var count = 0;
        foreach (var tx in completed)
        {
            if (reviewedTxIds.Contains(tx.Id)) continue;

            // Buyer rates seller
            await _reviewRepository.AddAsync(new Review
            {
                ReviewerId = tx.BuyerId,
                TargetUserId = tx.SellerId,
                TransactionId = tx.Id,
                ItemId = tx.ItemId,
                ItemType = tx.ItemType.ToString(),
                Rating = _rng.Next(3, 6),
                Comment = Pick(reviewComments),
                CreatedAt = tx.FinishedAt ?? DateTime.UtcNow,
            }, ct);
            count++;

            // Seller rates buyer
            await _reviewRepository.AddAsync(new Review
            {
                ReviewerId = tx.SellerId,
                TargetUserId = tx.BuyerId,
                TransactionId = tx.Id,
                ItemId = tx.ItemId,
                ItemType = tx.ItemType.ToString(),
                Rating = _rng.Next(4, 6),
                Comment = Pick(reviewComments),
                CreatedAt = tx.FinishedAt ?? DateTime.UtcNow,
            }, ct);
            count++;
        }
        return count;
    }

    // ===================== WORD BANKS =====================

    private static readonly string[] FirstNames = [
        "Marina","Rafael","Juliana","Pedro","Camila","Lucas","Beatriz","Gabriel",
        "Fernanda","Thiago","Ana","Carlos","Patricia","Bruno","Sofia","Diego",
        "Larissa","Felipe","Carla","Rodrigo","Bruna","Vinicius","Amanda","Leandro",
        "Tatiane","Marcelo","Isabela","Ricardo","Daniela","Eduardo","Vanessa","Gustavo"
    ];

    private static readonly string[] LastNames = [
        "Costa","Oliveira","Ferreira","Almeida","Santos","Pereira","Rocha","Martins",
        "Lima","Souza","Ribeiro","Nunes","Carvalho","Gomes","Barbosa","Cardoso",
        "Teixeira","Moreira","Alves","Mendes","Castro","Araujo","Pinto","Cavalcanti"
    ];

    private static readonly string[] Bios = [
        "Artesã e ceramista apaixonada por criar peças únicas.",
        "Desenvolvedor full-stack que ama compartilhar conhecimento.",
        "Fotógrafa profissional especializada em natureza e retratos.",
        "Marceneiro artesanal focado em técnicas tradicionais.",
        "Chef vegana que cria receitas saudáveis e saborosas.",
        "Músico e produtor com paixão por sons independentes.",
        "Designer e ilustradora com olhar para detalhes.",
        "Jardinheiro urbano e permacultor sustentável.",
        "Terapeuta holística dedicada ao bem-estar integral.",
        "Consultor de marketing e copywriter criativo.",
        "Artista plástica especializada em aquarela botânica.",
        "Chef confeiteiro artesanal sem glúten.",
        "Arquiteta focada em design sustentável.",
        "Técnico de eletrônica e maker DIY."
    ];

    private static readonly (string Name, string Desc)[] CommunityThemes = [
        ("Artes & Artesanato", "Comunidade de artesãos, ceramistas e criadores que valorizam o feito à mão. Compartilhamos técnicas, materiais sustentáveis e apoiamos o comércio justo entre produtores independentes."),
        ("Devs Colaborativos", "Desenvolvedores que trocam conhecimento, código e serviços técnicos. Open source, mutualismo digital e tecnologia a serviço de pessoas, não de corporações."),
        ("Cozinha Vegana", "Receitas, produtos e serviços veganos. Comunidade acolhedora para quem ama plantas, animais e comida de verdade. Sem exploração animal, com sabor de verdade."),
        ("Músicos Independentes", "Músicos, produtores e DJs que colaboram, ensinam e criam juntos. Cenário independente, sem gravadoras, direto do artista para quem escuta."),
        ("Clube da Fotografia", "Fotógrafos amadores e profissionais compartilhando técnica, equipamentos e shoots. Arte visual como ferramenta de expressão e resistência."),
        ("Jardinagem & Permacultura", "Cultivadores urbanos, jardineiros e amantes de plantas. Autonomia alimentar, permacultura e conexão com a terra em plena cidade."),
        ("Madeira & Marcenaria", "Marceneiros e artesãos da madeira. Móveis sob medida, utensílios e restauração. Trabalho manual com materiais nobres e reflorestados."),
        ("Bem-estar & Saúde Natural", "Terapeutas, professores de yoga e entusiastas de vida saudável. Medicina natural, mindfulness e cuidado integral sem depender de indústria farmacêutica."),
        ("DIY & Makers", "Makers, inventores e entusiastas de faça-você-mesmo. Eletrônica, impressão 3D, upcycling e tecnologia aberta para todos."),
        ("Cultura Alternativa", "Arte alternativa, música indie e estilo de vida não convencional. Espaço livre para expressão sem amarras do mercado mainstream.")
    ];

    // Produtos com descricões detalhadas e realistas
    private record ProductSeed(string Name, string Desc, int MinPrice, int MaxPrice);

    private static readonly Dictionary<string, ProductSeed[]> ProductData = new()
    {
        ["Artesanato"] = [
            new("Vaso de cerâmica artesanal", "Peça única feita à mão com argila vermelha natural, queima em forno tradicional a 1200°C. Textura orgânica com acabamento fosco. Cada vaso tem tonalidade própria — nenhum é igual ao outro. Ideal para plantas ou decoração minimalista. Altura: 18cm.", 65, 120),
            new("Bolsa de crochê colorida", "Bolsa artesanal em crochê com fios de algodão reciclado de indústria têxtil. Alça reforçada, forro interno e bolso. Resiste a até 5kg. Cada peça leva 12 horas de trabalho manual. Sustentável e única.", 50, 90),
            new("Kit velas aromáticas (3 unidades)", "Conjunto de 3 velas de cera de soja 100% natural, sem parafina. Essências de lavanda, eucalipto e baunilha. Pavio de algodão. Queima limpa por aproximadamente 25 horas cada. Embalagem em kraft reciclável.", 28, 55),
            new("Mandala de macramê", "Mandala decorativa em macramê feita com cordão de algodão cru 4mm. Trabalho artesanal com nós tradicionais. Pronta para pendurar. Diâmetro: 45cm. Leva a energia de artesanato manual para qualquer ambiente.", 55, 95),
            new("Sabonete artesanal herbal (kit 4)", "Quatro barras de sabonete natural feito pelo método frio. Ervas: alecrim, lavanda, camomila e hortelã. Sem corantes artificiais, sem sulfatos. Hidratante com óleo de coco e manteiga de karité. 100g cada.", 18, 35),
            new("Colar de sementes da Amazônia", "Colar artesanal com sementes de açaí, jenipapo e tucum. Fio de algodão encerado. Peça que conecta com a floresta e valoriza o trabalho de comunidades extrativistas. Comprimento ajustável.", 25, 50),
            new("Porta-joias de madeira decorado", "Caixa organizadora em madeira maciça de pinus reflorestado. Interior forrado com tecido de algodão. Trabalho de entalhe manual. Compartimentos para anéis, brincos e colares. 20x15x8cm.", 35, 70),
        ],
        ["Fotografia"] = [
            new("Câmera analógica 35mm", "Câmera vintage dos anos 90 em excelente estado de conservação. Lente 50mm f/2.0 incluída. Funcionando perfeitamente — testada com rolo. Ideal para quem quer começar com filme fotográfico. Acompanha alça.", 250, 450),
            new("Print fotográfico A3 (paisagem)", "Impressão fine art em papel algodão acid-free 310g. Foto de paisagem da Serra Gaúcha ao amanhecer. Cores profundas, longevidade de 100+ anos. Edição limitada de 30 cópias, numerada e assinada.", 40, 80),
            new("Tripé profissional de alumínio", "Tripé robusto com altura máxima de 170cm e carga até 8kg. Cabeça esférica com quick-release. Bolha de nível. Peso: 1.8kg. Perfeito para fotografia noturna e longa exposição. Pouco uso.", 80, 180),
            new("Lente prime 50mm f/1.8", "Lente fixa 50mm com abertura f/1.8. Nítida, leve (160g) e ideal para retratos com desfoque cremoso. Compatível com mounts Canon/Nikon/Sony (especificar na compra). Estado impecável.", 120, 280),
            new("Bolsa para câmera à prova d'água", "Mochila fotográfica resistente à água com divisórias modulares. Espaço para câmera + 3 lentes + laptop 15''. Alças ergonômicas. Material reciclado. Resistente a choques.", 70, 150),
            new("Iluminador ring light 18''", "Ring light profissional 18 polegadas com ajuste de temperatura de cor (3200K-5500K). 3 modos de cor, controle remoto. Suporte de mesa e tripé inclusos. Alimentação USB. Ideal para content creators.", 45, 100),
        ],
        ["Arte"] = [
            new("Quadro abstrato em acrílico 60x80", "Tela 100% algodão 60x80cm. Pintura acrílica original em tons quentes — terracota, mostarda e verde-musgo. Trabalho texturizado com espátula. Assinado pelo artista. Pronto para pendurar.", 150, 350),
            new("Ilustração digital personalizada", "Retrato digital em estilo aquarela, entregue em arquivo PNG de alta resolução (300 DPI) para impressão. Turnaround de 5 dias úteis. Você envia a foto de referência. Direito de uso pessoal incluído.", 70, 150),
            new("Kit 12 pincéis sintéticos premium", "Conjunto profissional de 12 pincéis com cerdas sintéticas (cruelty-free). Inclui chanfrados, lebres e detalhe. Cabos de madeira laqueada. Estojo de tecido incluso. Para acrílico, óleo e aquarela.", 30, 65),
            new("Aquarela botânica emoldurada", "Pintura aquarela original de planta tropical (monstera). Papel cold-pressed 300g. Moldura de madeira natural inclusa. Dimensão final: 30x40cm. Peça única, não reproduzida.", 90, 200),
            new("Poster de arte geométrica A2", "Poster de arte abstrata geométrica, impressão giclée em papel fosco 250g. Cores vibrantes em paleta terrosa. Tamanho A2 (42x59cm). Sem moldura. Arquivo original da artista.", 25, 50),
        ],
        ["Madeira"] = [
            new("Mesa de centro em freijó", "Mesa artesanal em madeira maciça freijó. Tampo 120x60cm. Acabamento natural com óleo vegetal. Estrutura em cavaletes. Cada peça tem veios únicos. Fabricada sob encomenda, entrega em 15 dias.", 350, 600),
            new("Tábua de corte rústica", "Tábua de servir em madeira maciça de ipê. 40x25x2cm. Acabamento com óleo mineral food-safe. Tratamento anti-bacteriano natural. Alça esculpida. Ideal para queijos, frios e apresentação.", 35, 75),
            new("Estante de parede flutuante", "Estante minimalista em madeira reflorestada. 60x20cm. Fixação invisível com suportes inclusos. Suporta até 15kg. Acabamento natural mate. Kit com parafusos e buchas. Fácil instalação.", 45, 95),
            new("Jogo de bowls de madeira (3)", "Três tigelas de madeira maciça em tamanhos graduais (10/14/18cm). Feitas em torno. Tratadas com óleo de coco food-safe. Cada conjunto tem veios únicos. Para servir saladas, frutas ou decoração.", 45, 90),
            new("Banco rústico de tronco", "Banco feito de tronco maciço de eucalipto reflorestado. Lixado e envernizado naturalmente. Altura: 45cm. Diâmetro: 35cm. Cada peça é única na forma. Ideal para varandas e ambientes rústicos.", 80, 180),
        ],
        ["Alimentação"] = [
            new("Granola artesanal vegana (1kg)", "Granola caseira sem açúcar refinado. Aveia, castanha-do-pará, coco, cacau 70%, melado de cana. Assada em forno lenha. Sem conservantes. Pacote de 1kg. Rende aproximadamente 20 porções.", 22, 38),
            new("Mel orgânico puro (500g)", "Mel de florada silvestre, colhido de forma sustentável em apiário familiar. Não pasteurizado — mantém enzimas e propólis naturais. Pote de vidro 500g. Cristaliza naturalmente (sinal de pureza).", 25, 45),
            new("Kit 6 temperos orgânicos", "Seis potes de temperos cultivados sem agrotóxicos: orégano, alecrim, manjericão, cúrcuma, pimenta-do-reino e páprica defumada. Colhidos e secos artesanalmente. Potes de 50g cada.", 28, 55),
            new("Bombom de chocolate 70% (kit 12)", "Doze bombons de chocolate amargo 70% cacau, sem leite. Recheios variados: maracujá, cupuaçu e castanha. Feito com cacau de origem única (Bahia). Embalagem compostável.", 28, 48),
            new("Geleia artesanal de pimenta", "Geleia caseira de pimenta biquinho com açúcar demerara. Doce no início, levemente picante no final. Pote 200g. Perfeita com queijos e carnes. Sem corantes ou conservantes.", 15, 28),
            new("Kombucha orgânico (1L)", "Kombucha fermentado naturalmente com chá verde e frutas vermelhas. Efervescente, levemente ácido. Rico em probióticos. Garrafa de vidro 1L. Manter refrigerado. Lote artesanal pequeno.", 18, 32),
        ],
        ["Jardinagem"] = [
            new("Muda de suculenta Echeveria rara", "Muda de Echeveria em vaso decorativo de cerâmica. Espécie rara com tonalidade rosada nas pontas. Fácil cuidado — rega 1x por semana. Adapta-se a ambientes internos com luz indireta.", 18, 35),
            new("Kit horta vertical (3 níveis)", "Estrutura completa para horta vertical com 3 vasos de fibra de coco. Suporte de aço galvanizado. Inclui substruto e sementes de cheiro-verde. Montagem simples. Ideal para apartamentos.", 70, 120),
            new("Plantas medicinais (kit 4)", "Quatro mudas de plantas medicinais: camomila, capim-cidreira, hortelã e alecrim. Vasos biodegradáveis. Cada muda vem com instruções de cultivo e uso medicinal. Kit perfeito para chás caseiros.", 25, 45),
            new("Kit 3 cactos variados", "Três mini cactos em vasos de cerâmica artesanal. Espécies diferentes, ideais para decoração de mesa e parapeitos. Quase não precisam de água. Resistentes e charmosos.", 22, 40),
            new("Sementes orgânicas (8 variedades)", "Pacote com 8 variedades de sementes para horta: alface, rúcula, tomate cereja, cebolinha, coentro, cenoura, beterraba e pimentão. Sementes crioulas não transgênicas. Rendimento alto.", 12, 25),
        ],
        ["Tecnologia"] = [
            new("Teclado mecânico switch brown", "Teclado mecânico ABNT2 com switches brown (tactile). Keycaps PBT. USB-C removível. Structure: alumínio. Perfeito para programação e escrita. Estado impecável, 6 meses de uso.", 150, 280),
            new("Raspberry Pi 4 (4GB) + case", "Placa single-board Raspberry Pi 4 modelo B com 4GB RAM. Acompanha case oficial preto, fonte USB-C 15W e heatsinks. Funcionando. Ideal para projetos DIY, retro gaming ou servidor doméstico.", 200, 350),
            new("Monitor IPS 24'' Full HD", "Monitor 24 polegadas IPS 1080p. 75Hz, 5ms, entradas HDMI e DisplayPort. Ajuste de inclinação. Cor calibrada. Perfeito para home office. Estado excelente, sem pixels mortos.", 250, 400),
            new("Headphone Bluetooth ANC", "Fone sem fio com cancelamento ativo de ruído. 40h de bateria. Bluetooth 5.2. Driver 40mm. Som equilibrado. Dobrável. Acompanha case. Recondicionado e testado pela fabricante.", 120, 220),
            new("Arduino Uno R3 + kit 15 sensores", "Kit completo para projetos eletrônicos: placa Arduino Uno R3 compatível, protoboard, jumpers e 15 sensores (temperatura, luz, distância, movimento, etc.). Manual de projetos incluso.", 80, 150),
            new("Hub USB-C 7 em 1", "Hub com HDMI 4K@30Hz, 3x USB 3.0, leitor de cartão SD/microSD, USB-C PD 100W. Body em alumínio. Compacto e portátil. Compatível com Mac, Windows e Linux.", 60, 110),
        ],
        ["Bem-estar"] = [
            new("Tapete de yoga ecológico 6mm", "Tapete de yoga em TPE (material ecológico, sem PVC). 6mm de espessura. Antiderrapante dupla face. Leve (900g). Cor terrosa. Resistente e fácil de limpar. Com alça de transporte.", 45, 85),
            new("Kit 5 óleos essenciais puros", "Cinco óleos essenciais 100% puros: lavanda, eucalipto, hortelã-pimenta, tea tree e alecrim. Frascos âmbar 10ml com gotejador. Certificados. Para difusor, massagem ou aromaterapia.", 38, 70),
            new("Difusor de aromas ultrassônico", "Difusor com 300ml de capacidade. Luz LED ajustável em 7 cores. Timer 1h/3h/6h. Desliga automático sem água. Funciona como umidificador. Design minimalista em madeira e branco.", 45, 85),
            new("Cristal de quartzo rosa polido", "Pedra natural de quartzo rosa polida, aproximadamente 400g. Cada cristal é único. Usado em meditação e decoração. Vem com saquinho de algodão. Origem: Minas Gerais.", 18, 40),
            new("Kit 10 incensos naturais", "Dez varetas de incenso artesanal sem carvão. Ervas: sálvia branca, palo santo, lavanda e cedro. Feito à mão. Queuda de 30 min cada. Sem fragrâncias sintéticas. Embalagem kraft.", 15, 30),
        ],
    };

    private static readonly Dictionary<string, (string Name, string Desc, int MinPrice, int MaxHours)[]> ServiceData = new()
    {
        ["Design"] = [
            ("Criação de identidade visual completa", "Desenvolvimento de identidade visual completa: logotipo, paleta de cores, tipografia e manual de marca. Entrego 3 propostas iniciais, rounds de revisão inclusos. Arquivos finais em AI, EPS, PNG e SVG. Pronto para uso digital e impresso.", 300, 12),
            ("Design de stickers personalizados", "Criação de 5 stickers digitais no estilo que preferir. Entrego em PNG transparente em alta resolução. Ideal para WhatsApp, Telegram ou impressão. Briefing rápido, entrega em 48h.", 40, 3),
            ("Capa de livro ou e-book", "Design de capa profissional para publicação digital ou impressa. Inclui conceito, tipografia e tratamento de imagem. Entrego 2 propostas com revisões. Arquivo final em PDF e JPG 300DPI.", 80, 5),
        ],
        ["Programação"] = [
            ("Consultoria de arquitetura de software (1h)", "Uma hora de mentoria técnica em arquitetura de software, boas práticas e code review. Atendimento via Google Meet. Ideal para times que estão escalando ou empreendedores com dúvidas técnicas. Gravação inclusa.", 60, 1),
            ("Desenvolvimento de API REST", "Criação de API REST em .NET ou Node.js com documentação Swagger, autenticação JWT e testes. Definimos escopo juntos. Código limpo, documentado e com CI/CD básico configurado.", 400, 20),
            ("Configuração de site WordPress", "Instalação e configuração completa de WordPress: tema, plugins essenciais, SEO básico, velocidade e segurança. Até 5 páginas. Treinamento para gestão de conteúdo incluso.", 120, 5),
        ],
        ["Marketing"] = [
            ("Estratégia de redes sociais (mensal)", "Plano de conteúdo mensal para Instagram com calendário, copy pronto para posts e sugestões de imagens. Inclui análise de concorrentes e definição de hashtags. Foco em engajamento orgânico.", 200, 8),
            ("Copywriting para landing page", "Textos persuasivos e otimizados para conversão na sua landing page. Headline, subheadline, benefícios, CTA e prova social. Pesquisa de público-alvo inclusa. Entrega em 3 dias.", 120, 5),
            ("Roteiro para vídeo institucional", "Roteiro completo para vídeo promocional ou institucional de até 3 minutos. Estrutura narrativa, direção de arte sugerida e marcações de tempo. Entrego 2 versões para escolha.", 80, 4),
        ],
        ["Escrita"] = [
            ("Revisão de texto profissional", "Revisão ortográfica, gramatical e de estilo para artigos, e-books e trabalhos acadêmicos. Até 5.000 palavras. Entrego com track changes e comentários. Desconto para volume.", 35, 3),
            ("Redação de artigo SEO (1500 palavras)", "Artigo otimizado para SEO com pesquisa de palavras-chave. Até 1.500 palavras, formatação pronta para publicar. Inclui meta description e sugestão de título. Conteúdo original, sem IA.", 70, 5),
            ("Tradução inglês-português", "Tradução profissional inglês-português para artigos, documentos e materiais de marketing. Até 1.000 palavras. Preservo tom e contexto cultural. Entrega em 48h.", 45, 3),
        ],
        ["Consultoria"] = [
            ("Consultoria nutricional vegana", "Plano alimentar personalizado vegano com acompanhamento de 30 dias. Inclui avaliação inicial, plano de refeições e 2 consultas de retorno. Online ou presencial em São Paulo.", 180, 3),
            ("Design de interiores sustentável", "Consultoria de design de interiores com foco em materiais sustentáveis e reaproveitamento. Inclui mood board, paleta e sugestão de mobiliário. Para um ambiente de até 30m².", 250, 6),
            ("Mentoria de carreira em tecnologia", "Uma hora de mentoria para transição de carreira ou crescimento na área de tecnologia. Review de LinkedIn, preparação para entrevistas e plano de desenvolvimento. Online.", 80, 1),
        ],
        ["Aulas"] = [
            ("Aula de violão popular (1h)", "Aula individual de violão para iniciantes e intermediários. MPB, samba e pop. Aprendizado por cifra e escuta. Online ou presencial em São Paulo. Material de apoio incluso.", 40, 1),
            ("Aula de cerâmica para iniciantes", "Workshop prático de 3 horas aprendendo técnicas básicas de modelagem em argila. Cada aluno leva para casa 2 peças. Atelier equipado. Grupos de até 4 pessoas. Presencial.", 90, 3),
            ("Aula de yoga ao vivo (1h)", "Sessão de yoga de 1 hora adaptada ao seu nível. Inclui respiração (pranayama), posturas (asanas) e meditação guiada. Online via Meet. Sequência personalizada para suas necessidades.", 45, 1),
        ],
        ["Fotografia"] = [
            ("Ensaio fotográfico externo", "Ensaio de 2 horas em local natural (parque ou praia). 15 fotos editadas em alta resolução entregues em 7 dias. Direção de pose inclusa. Indicação de maquiagem e figurante se necessário. Presencial.", 250, 3),
            ("Edição de fotos (pacote 20)", "Tratamento profissional de 20 fotos: ajuste de cor, contraste, retirada de imperfeições e color grading. Entrego em JPG e TIFF. Turnaround de 3 dias úteis. Para portfólio ou e-commerce.", 60, 4),
            ("Fotografia de produto (10 itens)", "Fotografia profissional de 10 produtos para e-commerce. Fundo branco ou lifestyle. 3 ângulos por produto. Edição inclusa. Entrega em 5 dias. Estúdio próprio com iluminação profissional.", 150, 5),
        ],
        ["Outros"] = [
            ("Composição de jingle publicitário", "Criação de jingle de até 30 segundos para sua marca. Inclui melodia, arranjo simples e locução opcional. Entrego em MP3 e WAV. Direitos de uso comercial inclusos.", 280, 10),
            ("Produção de beat instrumental", "Beat original instrumental personalizado no estilo que preferir (trap, lo-fi, eletrônico). Arquivo multitrack (stems) incluso. Direitos de uso para 1 música. 2 rounds de revisão.", 100, 5),
            ("Mixagem e masterização de áudio", "Mixagem e masterização profissional de 1 faixa (até 5 minutos). Entrego em WAV 24bit/48kHz pronto para streaming. Plugin suite profissional. Inclui 2 revisões.", 120, 6),
        ],
    };

    private static readonly string?[] Locations = ["Remoto","Online","Presencial - São Paulo","Presencial - Rio de Janeiro","Híbrido", null];

    // ===================== SEED METHODS =====================

    private static string Img(string seed) => $"https://picsum.photos/seed/{seed}/800/800";
    private static string Cover(string seed) => $"https://picsum.photos/seed/{seed}/800/400";
    private static string Avatar(int n) => $"https://i.pravatar.cc/300?img={((n % 70) + 1)}";

    // Imagens reais do Unsplash por categoria
    private static readonly Dictionary<string, string[]> ProductImagesByCategory = new()
    {
        ["Artesanato"] = [
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1606760227091-3dd827fa2d7b?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1531951657915-ef3b14e8d599?w=800&h=800&fit=crop",
        ],
        ["Fotografia"] = [
            "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=800&h=800&fit=crop",
        ],
        ["Arte"] = [
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1513519245088-0e12902e3556?w=800&h=800&fit=crop",
        ],
        ["Madeira"] = [
            "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1555041469-a586c9ea1bcf?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=800&fit=crop",
        ],
        ["Alimentação"] = [
            "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=800&h=800&fit=crop",
        ],
        ["Jardinagem"] = [
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop",
        ],
        ["Tecnologia"] = [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop",
        ],
        ["Bem-estar"] = [
            "https://images.unsplash.com/photo-1591291621164-2c6367723315?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1600612253971-4224dcf20c7c?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop",
        ],
    };

    private static readonly Dictionary<string, string[]> ServiceImagesByCategory = new()
    {
        ["Design"] = [
            "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=800&fit=crop",
        ],
        ["Programação"] = [
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=800&fit=crop",
        ],
        ["Marketing"] = [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=800&fit=crop",
        ],
        ["Escrita"] = [
            "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=800&fit=crop",
        ],
        ["Consultoria"] = [
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=800&fit=crop",
        ],
        ["Aulas"] = [
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=800&fit=crop",
        ],
        ["Fotografia"] = [
            "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=800&fit=crop",
        ],
        ["Outros"] = [
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&h=800&fit=crop",
        ],
    };

    private string GetProductImage(string category)
    {
        if (ProductImagesByCategory.TryGetValue(category, out var imgs)) return imgs[_rng.Next(imgs.Length)];
        return Img($"prod-{UniqueId()}");
    }

    private string GetServiceImage(string category)
    {
        if (ServiceImagesByCategory.TryGetValue(category, out var imgs)) return imgs[_rng.Next(imgs.Length)];
        return Img($"svc-{UniqueId()}");
    }

    private T Pick<T>(IList<T> list) => list[_rng.Next(list.Count)];
    private string UniqueId() => Guid.NewGuid().ToString("N")[..12];

    private async Task<Dictionary<string, User>> SeedUsersAsync(int count, CancellationToken ct)
    {
        var result = new Dictionary<string, User>();
        var created = 0;
        var attempts = 0;
        while (created < count && attempts < count * 3)
        {
            attempts++;
            var first = Pick(FirstNames);
            var last = Pick(LastNames);
            var name = $"{first} {last}";
            var emailKey = $"{first.ToLower()}.{last.ToLower()}{_rng.Next(10, 999)}";
            var email = $"{emailKey}@equivale.test";
            var evo = new Email(email);

            var existing = await _userRepository.GetByEmailAsync(evo, ct);
            if (existing is not null) continue;

            var daysAgo = _rng.Next(1, 90);
            var user = new User
            {
                Name = name,
                Email = evo,
                PasswordHash = _passwordHash,
                AvatarUrl = Avatar(created + 1),
                Bio = Pick(Bios),
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow.AddDays(-daysAgo),
                UpdatedAt = DateTime.UtcNow.AddDays(-daysAgo),
            };
            user.Credit(_rng.Next(100, 1000));
            await _userRepository.AddAsync(user, ct);
            result[$"u{created}"] = user;
            created++;
        }
        return result;
    }

    private async Task<Dictionary<string, Community>> SeedCommunitiesAsync(int count, Dictionary<string, User> users, CancellationToken ct)
    {
        var result = new Dictionary<string, Community>();
        if (users.Count == 0) return result;

        var created = 0;
        var attempts = 0;
        while (created < count && attempts < count * 3)
        {
            attempts++;
            var theme = CommunityThemes[created % CommunityThemes.Length];
            var suffix = created >= CommunityThemes.Length ? $" {_rng.Next(2, 99)}" : "";
            var name = theme.Name + suffix;

            var existing = await _communityRepository.GetByNameAsync(name, ct);
            if (existing is not null) { result[$"c{created}"] = existing; created++; continue; }

            var userList = users.Values.ToList();
            var creator = Pick(userList);
            var moderators = userList.OrderBy(_ => _rng.Next()).Take(_rng.Next(2, 4)).Select(u => u.Id).ToList();
            if (!moderators.Contains(creator.Id)) moderators.Add(creator.Id);
            var members = userList.OrderBy(_ => _rng.Next()).Take(_rng.Next(3, Math.Min(8, userList.Count))).Select(u => u.Id).Union(moderators).Distinct().ToList();

            // Map moderator Ids to Names (deduped, preserving order)
            var modUserMap = userList.Where(u => moderators.Contains(u.Id)).ToDictionary(u => u.Id);
            var moderatorNames = moderators.Where(id => modUserMap.ContainsKey(id)).Select(id => modUserMap[id].Name).Distinct().ToList();

            var seed = UniqueId();
            var daysAgo = _rng.Next(1, 80);
            var community = new Community
            {
                Name = name,
                Description = theme.Desc,
                ImageUrl = Img($"com-{seed}"),
                CoverUrl = Cover($"cover-{seed}"),
                CreatorId = creator.Id,
                CreatorName = creator.Name,
                Members = members,
                Moderators = moderators,
                ModeratorNames = moderatorNames,
                Type = _rng.NextDouble() > 0.8 ? "private" : "open",
                ProductVisibility = "public",
                CreatedAt = DateTime.UtcNow.AddDays(-daysAgo),
                UpdatedAt = DateTime.UtcNow.AddDays(-daysAgo),
            };
            await _communityRepository.AddAsync(community, ct);
            result[$"c{created}"] = community;
            created++;
        }
        return result;
    }

    private async Task<int> SeedProductsAsync(int count, Dictionary<string, User> users, Dictionary<string, Community> communities, CancellationToken ct)
    {
        if (users.Count == 0) return 0;
        var userList = users.Values.ToList();
        var communityList = communities.Values.ToList();
        var categories = ProductData.Keys.ToList();
        var created = 0;

        for (var i = 0; i < count; i++)
        {
            var category = Pick(categories);
            var seed = Pick(ProductData[category].ToList());
            var seller = Pick(userList);
            var community = _rng.NextDouble() > 0.4 && communityList.Count > 0 ? Pick(communityList) : null;
            var condition = _rng.NextDouble() > 0.7 ? (_rng.NextDouble() > 0.5 ? ProductCondition.Used : ProductCondition.Refurbished) : ProductCondition.New;

            var product = new Product
            {
                SellerId = seller.Id,
                SellerName = seller.Name,
                SellerAvatarUrl = seller.AvatarUrl,
                Title = seed.Name,
                Description = seed.Desc,
                Category = category,
                PriceInEquivale = new Money(_rng.Next(seed.MinPrice, seed.MaxPrice + 1)),
                ShippingCost = _rng.Next(0, 30),
                Images = [GetProductImage(category)],
                Status = ItemStatus.Active,
                Condition = condition,
                CommunityId = community?.Id,
                CommunityName = community?.Name,
                Tags = TagGenerator.Generate(seed.Name, category, seed.Desc),
                CreatedAt = DateTime.UtcNow.AddDays(-_rng.Next(1, 60)),
                UpdatedAt = DateTime.UtcNow.AddDays(-_rng.Next(0, 30)),
            };
            await _productRepository.AddAsync(product, ct);
            created++;
        }
        return created;
    }

    private async Task<int> SeedServicesAsync(int count, Dictionary<string, User> users, Dictionary<string, Community> communities, CancellationToken ct)
    {
        if (users.Count == 0) return 0;
        var userList = users.Values.ToList();
        var communityList = communities.Values.ToList();
        var categories = ServiceData.Keys.ToList();
        var created = 0;

        for (var i = 0; i < count; i++)
        {
            var category = Pick(categories);
            var seed = Pick(ServiceData[category].ToList());
            var provider = Pick(userList);
            var community = _rng.NextDouble() > 0.5 && communityList.Count > 0 ? Pick(communityList) : null;

            var service = new Service
            {
                ProviderId = provider.Id,
                ProviderName = provider.Name,
                ProviderAvatarUrl = provider.AvatarUrl,
                Title = seed.Name,
                Description = seed.Desc,
                Category = category,
                PriceInEquivale = new Money(_rng.Next(seed.MinPrice, seed.MinPrice + 200)),
                Images = [GetServiceImage(category)],
                Duration = TimeSpan.FromHours(_rng.Next(1, seed.MaxHours + 1)),
                Location = Pick(Locations),
                Status = ItemStatus.Active,
                CommunityId = community?.Id,
                CommunityName = community?.Name,
                Tags = TagGenerator.Generate(seed.Name, category, seed.Desc),
                CreatedAt = DateTime.UtcNow.AddDays(-_rng.Next(1, 50)),
                UpdatedAt = DateTime.UtcNow.AddDays(-_rng.Next(0, 25)),
            };
            await _serviceRepository.AddAsync(service, ct);
            created++;
        }
        return created;
    }

    public record SeedResult(int Users, int Communities, int Products, int Services, int Transactions, int Reviews);
}
