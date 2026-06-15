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
        ("Artes & Artesanato", "Comunidade de artesãos e criadores que valorizam o feito à mão."),
        ("Devs Colaborativos", "Desenvolvedores que trocam conhecimento e serviços técnicos."),
        ("Cozinha Vegana", "Receitas, produtos e serviços veganos para quem ama plantas."),
        ("Músicos Independentes", "Músicos e produtores que colaboram e criam juntos."),
        ("Clube da Fotografia", "Fotógrafos compartilhando técnica, shoots e equipamentos."),
        ("Jardinagem & Permacultura", "Cultivadores urbanos e amantes de plantas."),
        ("Madeira & Marcenaria", "Marceneiros e artesãos da madeira."),
        ("Bem-estar & Saúde Natural", "Terapeutas e entusiastas de vida saudável."),
        ("DIY & Makers", "Makers, inventores e entusiastas de faça-você-mesmo."),
        ("Cultura Alternativa", "Arte alternativa, música indie e estilo de vida não convencional.")
    ];

    private static readonly Dictionary<string, string[]> ProductTemplates = new()
    {
        ["Artesanato"] = ["Vaso de cerâmica","Bolsa de crochê","Porta-joias entalhado","Velas aromáticas","Mandala de macramê","Colar de sementes","Renda bordada","Sabonete artesanal","Dreamcatcher","Tapete tecido à mão"],
        ["Fotografia"] = ["Câmera analógica","Print de paisagem","Tripé profissional","Lente 50mm","Bolsa para câmera","Polaroid","Filtro ND","Cartão SD 128GB","Iluminador de ring light","Backdrop de tecido"],
        ["Arte"] = ["Quadro abstrato","Ilustração digital","Kit de pincéis","Aquarela emoldurada","Poster de arte","Tela em branco","Escultura em gesso","Serigrafia limitada","Caneta nanquim set","Kit de tintas acrílicas"],
        ["Madeira"] = ["Mesa de centro","Tábua de corte","Estante flutuante","Banco rústico","Cabideiro de parede","Bowls de madeira","Prancha de corte","Relógio de tronco","Caixa organizadora","Mesa de jantar"],
        ["Alimentação"] = ["Granola artesanal","Mel orgânico","Kit de temperos","Pão integral","Bombom de cacau","Geleia de pimenta","Kombucha","Biscoito amanteigado","Doce de leite vegano","Chá artesanal"],
        ["Jardinagem"] = ["Muda de suculenta","Kit horta vertical","Plantas medicinais","Cactos variados","Vasos de cimento","Sementes orgânicas","Orquídea","Bonsai","Trepadeira","Kit vasinho decorativo"],
        ["Tecnologia"] = ["Teclado mecânico","Raspberry Pi","Monitor 24 polegadas","Headphone Bluetooth","Hub USB-C","Arduino + sensores","Mouse gamer","Webcam HD","SSD 512GB","Power bank 20000mAh"],
        ["Bem-estar"] = ["Tapete de yoga","Kit de incensos","Cristal de quartzo","Difusor de aromas","Óleos essenciais","Bloco de yoga","Rolo de massagem","Vela de meditação","Mala de cristais","Kit acupuntura auricular"]
    };

    private static readonly Dictionary<string, string[]> ServiceTemplates = new()
    {
        ["Design"] = ["Criação de identidade visual","Design de stickers","Diagramação de e-book","Capa de livro","Logo minimalista","Design de cardápio","Banners para redes sociais","Wireframe de app"],
        ["Programação"] = ["Consultoria de desenvolvimento","Desenvolvimento de API","Configuração WordPress","Correção de bugs","Bot para Discord","Automação de planilhas","Integração de pagamento","Deploy de aplicação"],
        ["Marketing"] = ["Estratégia de redes sociais","Copywriting para landing","Gestão de tráfego pago","Roteiro para vídeo","E-mail marketing","Auditoria de SEO","Plano de conteúdo","Consultoria de marca"],
        ["Escrita"] = ["Revisão de texto","Redação de artigos","Tradução EN-PT","Roteiro para podcast","Descrição de produtos","E-book ghostwriter","Legenda para Instagram","Edação de TCC"],
        ["Consultoria"] = ["Consultoria nutricional","Avaliação de jardim","Design de interiores","Consultoria financeira","Mentoria de carreira","Avaliação de gadgets","Consultoria de imagem","Planejamento estratégico"],
        ["Aulas"] = ["Aula de violão","Aula de cerâmica","Aula de yoga","Curso de fotografia","Aula de desenho","Workshop de jardinagem","Aula de pão artesanal","Aula de idiomas"],
        ["Fotografia"] = ["Ensaio fotográfico","Edição de fotos","Edição de vídeo","Fotografia de produto","Making of de evento","Restauro de fotos antigas","Composite digital","Cover de perfil"],
        ["Outros"] = ["Composição de jingle","Produção de beat","Mixagem de áudio","Aulas de canto","Roteiro musical","Locução comercial","Produção de clipe","Sound design"]
    };

    private static readonly string[] ProductAdjectives = ["premium","artesanal","exclusivo","sustentável","vintage","natural","orgânico","handmade","edición limitada","reforçado"];
    private static readonly string[] ServiceAdjectives = ["personalizado","profissional","completo","expresso","premium","intensivo","individual","em grupo"];
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

            var seed = UniqueId();
            var daysAgo = _rng.Next(1, 80);
            var community = new Community
            {
                Name = name,
                Description = theme.Desc,
                ImageUrl = Img($"com-{seed}"),
                CoverUrl = Cover($"cover-{seed}"),
                CreatorId = creator.Id,
                Members = members,
                Moderators = moderators,
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
        var categories = ProductTemplates.Keys.ToList();
        var created = 0;

        for (var i = 0; i < count; i++)
        {
            var category = Pick(categories);
            var baseName = Pick(ProductTemplates[category]);
            var adjective = _rng.NextDouble() > 0.4 ? $" {Pick(ProductAdjectives)}" : "";
            var title = $"{baseName}{adjective}";
            var seller = Pick(userList);
            var community = _rng.NextDouble() > 0.4 && communityList.Count > 0 ? Pick(communityList) : null;
            var seed = UniqueId();
            var condition = _rng.NextDouble() > 0.7 ? (_rng.NextDouble() > 0.5 ? ProductCondition.Used : ProductCondition.Refurbished) : ProductCondition.New;

            var product = new Product
            {
                SellerId = seller.Id,
                Title = title,
                Description = $"{title}. Produto da categoria {category}. " + Pick(Bios),
                Category = category,
                PriceInEquivale = new Money(_rng.Next(15, 500)),
                ShippingCost = _rng.Next(0, 30),
                Images = [GetProductImage(category)],
                Status = ItemStatus.Active,
                Condition = condition,
                CommunityId = community?.Id,
                Tags = TagGenerator.Generate(title, category, null),
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
        var categories = ServiceTemplates.Keys.ToList();
        var created = 0;

        for (var i = 0; i < count; i++)
        {
            var category = Pick(categories);
            var baseName = Pick(ServiceTemplates[category]);
            var adjective = _rng.NextDouble() > 0.5 ? $" {Pick(ServiceAdjectives)}" : "";
            var title = $"{baseName}{adjective}";
            var provider = Pick(userList);
            var community = _rng.NextDouble() > 0.5 && communityList.Count > 0 ? Pick(communityList) : null;
            var hours = _rng.Next(1, 15);

            var service = new Service
            {
                ProviderId = provider.Id,
                Title = title,
                Description = $"Serviço de {title}. Atendimento {Pick(ServiceAdjectives)}. " + Pick(Bios),
                Category = category,
                PriceInEquivale = new Money(_rng.Next(30, 600)),
                Images = [GetServiceImage(category)],
                Duration = TimeSpan.FromHours(hours),
                Location = Pick(Locations),
                Status = ItemStatus.Active,
                CommunityId = community?.Id,
                Tags = TagGenerator.Generate(title, category, null),
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
