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

    private static readonly string SeedPassword = "Eql@2026";
    private string _passwordHash = string.Empty;
    private readonly Random _rng = new(42);

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

    public async Task<SeedResult> RunAsync(SeedOptions opts, CancellationToken ct = default)
    {
        _passwordHash = _passwordHasher.Hash(SeedPassword);

        // Promote known admin user
        await PromoteAdminAsync(ct);

        var users = await SeedUsersAsync(opts.Users, ct);
        var communities = await SeedCommunitiesAsync(opts.Communities, users, ct);
        var products = await SeedProductsAsync(opts.Products, users, communities, ct);
        var services = await SeedServicesAsync(opts.Services, users, communities, ct);
        return new SeedResult(users.Count, communities.Count, products, services);
    }

    private async Task PromoteAdminAsync(CancellationToken ct)
    {
        var adminEmail = new Email("rodneydocarmo@gmail.com");
        var existing = await _userRepository.GetByEmailAsync(adminEmail, ct);
        if (existing is not null && existing.Role != UserRole.Admin)
        {
            existing.Role = UserRole.Admin;
            existing.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(existing, ct);
        }
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
    private static readonly string[] Locations = ["Remoto","Online","Presencial - São Paulo","Presencial - Rio de Janeiro","Híbrido", null];

    // ===================== SEED METHODS =====================

    private static string Img(string seed) => $"https://picsum.photos/seed/{seed}/800/800";
    private static string Cover(string seed) => $"https://picsum.photos/seed/{seed}/800/400";
    private static string Avatar(int n) => $"https://i.pravatar.cc/300?img={((n % 70) + 1)}";

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
                Images = [Img($"prod-{seed}")],
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

    public record SeedResult(int Users, int Communities, int Products, int Services);
}
