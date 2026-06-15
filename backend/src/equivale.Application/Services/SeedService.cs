using equivale.Application.Services;
using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.Interfaces;
using equivale.Domain.ValueObjects;

namespace equivale.Application.Services;

public class SeedService
{
    private readonly IUserRepository _userRepository;
    private readonly ICommunityRepository _communityRepository;
    private readonly IProductRepository _productRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IPasswordHasher _passwordHasher;

    private static readonly string SeedPassword = "Eql@2026";
    private string _passwordHash = string.Empty;

    public SeedService(
        IUserRepository userRepository,
        ICommunityRepository communityRepository,
        IProductRepository productRepository,
        IServiceRepository serviceRepository,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _communityRepository = communityRepository;
        _productRepository = productRepository;
        _serviceRepository = serviceRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<SeedResult> RunAsync(CancellationToken cancellationToken = default)
    {
        _passwordHash = _passwordHasher.Hash(SeedPassword);

        var users = await SeedUsersAsync(cancellationToken);
        var communities = await SeedCommunitiesAsync(users, cancellationToken);
        var products = await SeedProductsAsync(users, communities, cancellationToken);
        var services = await SeedServicesAsync(users, communities, cancellationToken);

        return new SeedResult(users.Count, communities.Count, products, services);
    }

    private async Task<Dictionary<string, User>> SeedUsersAsync(CancellationToken ct)
    {
        var result = new Dictionary<string, User>();
        foreach (var data in Users)
        {
            var email = new Email(data.Email);
            var existing = await _userRepository.GetByEmailAsync(email, ct);
            if (existing is not null)
            {
                result[data.Key] = existing;
                continue;
            }

            var user = new User
            {
                Name = data.Name,
                Email = email,
                PasswordHash = _passwordHash,
                AvatarUrl = data.AvatarUrl,
                Bio = data.Bio,
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
                UpdatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
            };
            user.Credit(500);
            await _userRepository.AddAsync(user, ct);
            result[data.Key] = user;
        }
        return result;
    }

    private async Task<Dictionary<string, Community>> SeedCommunitiesAsync(
        Dictionary<string, User> users, CancellationToken ct)
    {
        var result = new Dictionary<string, Community>();
        foreach (var data in Communities)
        {
            var existing = await _communityRepository.GetByNameAsync(data.Name, ct);
            if (existing is not null)
            {
                result[data.Key] = existing;
                continue;
            }

            var creator = users[data.CreatorKey];
            var moderators = data.ModeratorKeys.Select(k => users[k].Id).ToList();
            if (!moderators.Contains(creator.Id)) moderators.Add(creator.Id);

            var members = data.MemberKeys.Select(k => users[k].Id).ToList();
            members = members.Union(moderators).Distinct().ToList();

            var community = new Community
            {
                Name = data.Name,
                Description = data.Description,
                ImageUrl = data.ImageUrl,
                CoverUrl = data.CoverUrl,
                CreatorId = creator.Id,
                Members = members,
                Moderators = moderators,
                Type = data.Type,
                ProductVisibility = "public",
                CreatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
                UpdatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
            };
            await _communityRepository.AddAsync(community, ct);
            result[data.Key] = community;
        }
        return result;
    }

    private async Task<int> SeedProductsAsync(
        Dictionary<string, User> users,
        Dictionary<string, Community> communities,
        CancellationToken ct)
    {
        var count = 0;
        foreach (var data in Products)
        {
            var seller = users[data.SellerKey];
            var communityId = data.CommunityKey is null ? null : communities[data.CommunityKey].Id;

            var product = new Product
            {
                SellerId = seller.Id,
                Title = data.Title,
                Description = data.Description,
                Category = data.Category,
                PriceInEquivale = new Money(data.Price),
                Images = data.Images,
                Status = ItemStatus.Active,
                Condition = data.Condition,
                CommunityId = communityId,
                Tags = TagGenerator.Generate(data.Title, data.Category, data.Description),
                CreatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
                UpdatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
            };
            await _productRepository.AddAsync(product, ct);
            count++;
        }
        return count;
    }

    private async Task<int> SeedServicesAsync(
        Dictionary<string, User> users,
        Dictionary<string, Community> communities,
        CancellationToken ct)
    {
        var count = 0;
        foreach (var data in Services)
        {
            var provider = users[data.ProviderKey];
            var communityId = data.CommunityKey is null ? null : communities[data.CommunityKey].Id;

            var service = new Service
            {
                ProviderId = provider.Id,
                Title = data.Title,
                Description = data.Description,
                Category = data.Category,
                PriceInEquivale = new Money(data.Price),
                Duration = data.Duration,
                Location = data.Location,
                Status = ItemStatus.Active,
                CommunityId = communityId,
                Tags = TagGenerator.Generate(data.Title, data.Category, data.Description),
                CreatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
                UpdatedAt = DateTime.UtcNow.AddDays(-data.DaysAgo),
            };
            await _serviceRepository.AddAsync(service, ct);
            count++;
        }
        return count;
    }

    public record SeedResult(int Users, int Communities, int Products, int Services);

    // ===================== DATA =====================

    private record UserData(string Key, string Name, string Email, string Bio, string AvatarUrl, int DaysAgo);
    private record CommunityData(string Key, string Name, string Description, string? ImageUrl, string? CoverUrl,
        string CreatorKey, string[] ModeratorKeys, string[] MemberKeys, string Type, int DaysAgo);
    private record ProductData(string Title, string Description, string Category, decimal Price,
        List<string> Images, ProductCondition Condition, string SellerKey, string? CommunityKey, int DaysAgo);
    private record ServiceData(string Title, string Description, string Category, decimal Price,
        TimeSpan? Duration, string? Location, string ProviderKey, string? CommunityKey, int DaysAgo);

    private static string Img(string seed) => $"https://picsum.photos/seed/{seed}/800/800";
    private static string Cover(string seed) => $"https://picsum.photos/seed/{seed}/800/400";

    private static readonly List<UserData> Users = new()
    {
        new("u1", "Marina Costa", "marina.costa@equivale.test", "Artesã e ceramista. Amo transformar barro em arte há mais de 10 anos.", "https://i.pravatar.cc/300?img=5", 90),
        new("u2", "Rafael Oliveira", "rafael.oliveira@equivale.test", "Desenvolvedor full-stack e entusiasta de open source. Compartilho conhecimento por paixão.", "https://i.pravatar.cc/300?img=12", 85),
        new("u3", "Juliana Ferreira", "juliana.ferreira@equivale.test", "Fotógrafa profissional especializada em retratos e natureza. Vegan e amante de animais.", "https://i.pravatar.cc/300?img=20", 80),
        new("u4", "Pedro Almeida", "pedro.almeida@equivale.test", "Marceneiro artesanal. Trabalho com madeira maciça e técnicas tradicionais.", "https://i.pravatar.cc/300?img=33", 75),
        new("u5", "Camila Santos", "camila.santos@equivale.test", "Nutricionista e chef vegana. Crio receitas saudáveis e deliciosas.", "https://i.pravatar.cc/300?img=47", 70),
        new("u6", "Lucas Pereira", "lucas.pereira@equivale.test", "Músico e produtor musical. Toco violão, guitarra e produzo tracks eletrônicas.", "https://i.pravatar.cc/300?img=51", 65),
        new("u7", "Beatriz Rocha", "beatriz.rocha@equivale.test", "Designer gráfica e ilustradora. Crio marcas, stickers e arte digital.", "https://i.pravatar.cc/300?img=44", 60),
        new("u8", "Gabriel Martins", "gabriel.martins@equivale.test", "Jardinheiro urbano e permacultor. Cultivo hortas verticais e plantas medicinais.", "https://i.pravatar.cc/300?img=60", 55),
        new("u9", "Fernanda Lima", "fernanda.lima@equivale.test", "Terapeuta holística e professora de yoga. Foco em bem-estar e mindfulness.", "https://i.pravatar.cc/300?img=32", 50),
        new("u10", "Thiago Souza", "thiago.souza@equivale.test", "Consultor de marketing digital e copywriter. Ajudo pequenos negócios a crescerem.", "https://i.pravatar.cc/300?img=15", 45),
    };

    private static readonly List<CommunityData> Communities = new()
    {
        new("c_arte", "Artes & Artesanato", "Comunidade de artesãos, ceramistas e criadores que valorizam o feito à mão.",
            Img("com-arte"), Cover("cover-arte"),
            "u1", new[] { "u7", "u3" }, new[] { "u4", "u9" }, "open", 80),
        new("c_dev", "Devs Colaborativos", "Desenvolvedores que trocam conhecimento, código e serviços técnicos.",
            Img("com-dev"), Cover("cover-dev"),
            "u2", new[] { "u10" }, new[] { "u7" }, "open", 78),
        new("c_vegano", "Cozinha Vegana", "Receitas, produtos e serviços veganos. Comunidade acolhedora para quem ama plantas e animais.",
            Img("com-vegano"), Cover("cover-vegano"),
            "u5", new[] { "u8" }, new[] { "u3", "u9" }, "open", 75),
        new("c_musica", "Músicos Independentes", "Músicos, produtores e DJs que colaboram, ensinam e criam juntos.",
            Img("com-musica"), Cover("cover-musica"),
            "u6", new[] { "u10", "u2" }, new[] { "u1" }, "open", 70),
        new("c_foto", "Clube da Fotografia", "Fotógrafos amadores e profissionais compartilhando técnica, shoots e equipamentos.",
            Img("com-foto"), Cover("cover-foto"),
            "u3", new[] { "u1", "u7" }, new[] { "u6" }, "open", 68),
        new("c_jardim", "Jardinagem & Permacultura", "Cultivadores urbanos, jardineiros e amantes de plantas verdes.",
            Img("com-jardim"), Cover("cover-jardim"),
            "u8", new[] { "u5", "u9" }, new[] { "u1" }, "open", 65),
    };

    private static readonly List<ProductData> Products = new()
    {
        // Artesanato
        new("Vaso de cerâmica artesanal", "Vaso único feito à mão com argila vermelha, queima lenta. Cada peça é irrepetível.", "Artesanato", 85, new List<string>{ Img("vaso-ceramica") }, ProductCondition.New, "u1", "c_arte", 40),
        new("Bolsa de crochê colorida", "Bolsa artesanal em crochê com fios reciclados. Resistente e sustentável.", "Artesanato", 60, new List<string>{ Img("bolsa-croche") }, ProductCondition.New, "u1", "c_arte", 38),
        new("Porta-joias de madeira decorado", "Porta-joias entalhado à mão com acabamento natural.", "Artesanato", 45, new List<string>{ Img("porta-joias") }, ProductCondition.New, "u1", null, 35),
        new("Velas aromáticas artesanais (kit 3)", "Kit de 3 velas de cera de soja com essências de lavanda, eucalipto e baunilha.", "Artesanato", 35, new List<string>{ Img("velas-kit") }, ProductCondition.New, "u1", "c_arte", 30),
        new("Mandala de macramê", "Mandala decorativa em macramê feita com cordão algodão cru.", "Artesanato", 70, new List<string>{ Img("mandala") }, ProductCondition.New, "u7", "c_arte", 28),

        // Fotografia
        new("Câmera analógica 35mm", "Câmera vintage em ótimo estado, perfeita para quem quer começar com filme.", "Fotografia", 320, new List<string>{ Img("camera-analog") }, ProductCondition.Used, "u3", "c_foto", 42),
        new("Print de paisagem (A3)", "Impressão em papel fosco de paisagem da Serra Gaúcha. Edição limitada.", "Fotografia", 50, new List<string>{ Img("print-paisagem") }, ProductCondition.New, "u3", "c_foto", 36),
        new("Tripé profissional de alumínio", "Tripé robusto com altura até 1,70m. Pouco uso, excelente estado.", "Fotografia", 110, new List<string>{ Img("tripe") }, ProductCondition.Refurbished, "u3", null, 33),
        new("Livro: A Arte da Fotografia", "Livro didático sobre composição e iluminação. Edição em português.", "Fotografia", 25, new List<string>{ Img("livro-foto") }, ProductCondition.Used, "u3", "c_foto", 25),

        // Arte
        new("Quadro abstrato em acrílico", "Tela 60x80cm com pintura acrílica abstrata em tons quentes.", "Arte", 180, new List<string>{ Img("quadro") }, ProductCondition.New, "u7", "c_arte", 37),
        new("Ilustração digital personalizada", "Retrato digital em estilo aquarela, entregue em alta resolução.", "Arte", 90, new List<string>{ Img("ilustracao") }, ProductCondition.New, "u7", "c_arte", 34),
        new("Kit de pincéis profissionais", "Conjunto de 12 pincéis sintéticos para pintura artística.", "Arte", 40, new List<string>{ Img("pincels") }, ProductCondition.New, "u7", null, 22),

        // Madeira
        new("Mesa de centro de madeira maciça", "Mesa artesanal em madeira freijó, acabamento natural. Peça única.", "Madeira", 450, new List<string>{ Img("mesa") }, ProductCondition.New, "u4", null, 41),
        new("Tabua de corte rústica", "Tábua de servir em madeira maciça com acabamento em óleo mineral.", "Madeira", 55, new List<string>{ Img("tabua") }, ProductCondition.New, "u4", "c_arte", 32),
        new("Estante de parede flutuante", "Estante minimalista em madeira reflorestada, fácil instalação.", "Madeira", 120, new List<string>{ Img("estante") }, ProductCondition.New, "u4", null, 27),

        // Alimentação
        new("Granola artesanal vegana (1kg)", "Granola caseira sem açúcar, com castanhas, coco e cacau.", "Alimentação", 28, new List<string>{ Img("granola") }, ProductCondition.New, "u5", "c_vegano", 30),
        new("Mel orgânico puro (500g)", "Mel de florada silvestre, colhido de forma sustentável.", "Alimentação", 35, new List<string>{ Img("mel") }, ProductCondition.New, "u5", "c_vegano", 28),
        new("Kit temperos orgânicos", "6 potes de temperos cultivados sem agrotóxicos.", "Alimentação", 42, new List<string>{ Img("temperos") }, ProductCondition.New, "u8", "c_jardim", 25),
        new("Pão integral artesanal", "Pão de fermentação natural, sem conservantes. Retirada no dia.", "Alimentação", 18, new List<string>{ Img("pao") }, ProductCondition.New, "u5", "c_vegano", 20),

        // Jardinagem
        new("Muda de suculenta rara", "Muda de Echeveria rara em vaso decorativo de cerâmica.", "Jardinagem", 22, new List<string>{ Img("suculenta") }, ProductCondition.New, "u8", "c_jardim", 29),
        new("Kit horta vertical (3 níveis)", "Estrutura completa para horta vertical com 3 vasos e suporte.", "Jardinagem", 95, new List<string>{ Img("horta-vertical") }, ProductCondition.New, "u8", "c_jardim", 26),
        new("Plantas medicinais (kit 4)", "Mudas de camomila, capim-cidreira, hortelã e alecrim.", "Jardinagem", 38, new List<string>{ Img("medicinais") }, ProductCondition.New, "u8", "c_jardim", 18),

        // Tecnologia
        new("Teclado mecânico usado", "Teclado mecânico switch brown, ABNT2. Funcionando perfeitamente.", "Tecnologia", 220, new List<string>{ Img("teclado") }, ProductCondition.Used, "u2", "c_dev", 40),
        new("Raspberry Pi 4 (4GB)", "Placa single-board completa com case e fonte original.", "Tecnologia", 280, new List<string>{ Img("raspberry") }, ProductCondition.Refurbished, "u2", "c_dev", 35),
        new("Monitor 24\" Full HD", "Monitor IPS em ótimo estado, entradas HDMI e DisplayPort.", "Tecnologia", 350, new List<string>{ Img("monitor") }, ProductCondition.Used, "u2", null, 31),

        // Bem-estar
        new("Tapete de yoga antiderrapante", "Tapete ecológico em TPE, 6mm de espessura. Super confortável.", "Bem-estar", 65, new List<string>{ Img("tapete-yoga") }, ProductCondition.New, "u9", null, 28),
        new("Kit incensos naturais (12un)", "Incensos artesanais de ervas, sem química. Cada um com aroma único.", "Bem-estar", 30, new List<string>{ Img("incensos") }, ProductCondition.New, "u9", null, 24),
        new("Cristal de quartzo rosa", "Pedra natural polida para meditação e decoração.", "Bem-estar", 25, new List<string>{ Img("cristal") }, ProductCondition.New, "u9", null, 19),
    };

    private static readonly List<ServiceData> Services = new()
    {
        // Design
        new("Criação de identidade visual", "Desenvolvo logotipo, paleta de cores e manual da marca completo para seu negócio.", "Design", 400, TimeSpan.FromHours(10), "Remoto", "u7", "c_dev", 38),
        new("Design de stickers personalizados", "Criação de 5 stickers digitais no estilo que preferir.", "Design", 60, TimeSpan.FromHours(3), "Remoto", "u7", null, 30),
        new("Diagramação de e-book", "Diagramo seu e-book com layout profissional e exportação em PDF.", "Design", 120, TimeSpan.FromHours(6), "Remoto", "u7", "c_dev", 26),

        // Programação
        new("Consultoria de desenvolvimento", "1 hora de mentoria em arquitetura de software, boas práticas e code review.", "Programação", 80, TimeSpan.FromHours(1), "Remoto", "u2", "c_dev", 40),
        new("Desenvolvimento de API REST", "Crio sua API REST em .NET ou Node.js com documentação Swagger inclusa.", "Programação", 600, TimeSpan.FromHours(20), "Remoto", "u2", "c_dev", 35),
        new("Configuração de site WordPress", "Instalo e configuro seu site WordPress com tema e plugins essenciais.", "Programação", 150, TimeSpan.FromHours(5), "Remoto", "u2", null, 28),

        // Marketing
        new("Estratégia de redes sociais", "Plano de conteúdo mensal para Instagram com calendário e copy pronto.", "Marketing", 250, TimeSpan.FromHours(8), "Remoto", "u10", null, 36),
        new("Copywriting para landing page", "Textos persuasivos e otimizados para conversão na sua landing page.", "Marketing", 180, TimeSpan.FromHours(6), "Remoto", "u10", "c_dev", 30),
        new("Gestão de tráfego pago", "Configuração e otimização de campanhas no Google e Meta Ads.", "Marketing", 300, TimeSpan.FromHours(10), "Remoto", "u10", null, 24),

        // Escrita
        new("Revisão de texto profissional", "Revisão ortográfica, gramatical e de estilo para artigos e e-books.", "Escrita", 50, TimeSpan.FromHours(3), "Remoto", "u10", null, 32),
        new("Redação de artigos para blog", "Artigos de até 1500 palavras otimizados para SEO.", "Escrita", 90, TimeSpan.FromHours(4), "Remoto", "u5", "c_vegano", 25),

        // Consultoria
        new("Consultoria nutricional vegana", "Plano alimentar personalizado vegano com acompanhamento de 30 dias.", "Consultoria", 200, TimeSpan.FromHours(2), "Online", "u5", "c_vegano", 34),
        new("Avaliação de jardim sustentável", "Visita técnica para planejar seu jardim com permacultura.", "Consultoria", 120, TimeSpan.FromHours(3), "Presencial - São Paulo", "u8", "c_jardim", 28),

        // Aulas
        new("Aula de violão popular (1h)", "Aula individual de violão para iniciantes e intermediários.", "Aulas", 45, TimeSpan.FromHours(1), "Online ou Presencial", "u6", "c_musica", 30),
        new("Aula de cerâmica para iniciantes", "Workshop de 3h aprendendo técnicas básicas de modelagem.", "Aulas", 90, TimeSpan.FromHours(3), "Presencial - Atelier", "u1", "c_arte", 27),
        new("Aula de yoga ao vivo", "Sessão de yoga de 1h adaptada ao seu nível, com respiração e meditação.", "Aulas", 50, TimeSpan.FromHours(1), "Online", "u9", null, 22),
        new("Curso de fotografia básica", "4 encontros online cobrindo composição, luz e edição.", "Aulas", 160, TimeSpan.FromHours(8), "Online", "u3", "c_foto", 20),

        // Fotografia
        new("Ensaio fotográfico externo", "Ensaio de 2h em local natural, 15 fotos editadas em alta resolução.", "Fotografia", 280, TimeSpan.FromHours(2), "Presencial", "u3", "c_foto", 33),
        new("Edição de fotos (pacote 20)", "Tratamento e color grading profissional de 20 fotos.", "Fotografia", 70, TimeSpan.FromHours(4), "Remoto", "u3", "c_foto", 26),

        // Outros
        new("Composição de jingle publicitário", "Criação de jingle de até 30 segundos para sua marca.", "Outros", 350, TimeSpan.FromHours(12), "Remoto", "u6", "c_musica", 31),
        new("Produção de beat instrumental", "Beat original personalizado no estilo que preferir.", "Outros", 120, TimeSpan.FromHours(5), "Remoto", "u6", "c_musica", 24),
    };
}
