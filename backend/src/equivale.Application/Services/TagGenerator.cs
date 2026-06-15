using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace equivale.Application.Services;

public static class TagGenerator
{
    private static readonly HashSet<string> Stopwords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a","o","as","os","de","da","do","das","dos","e","ou","um","uma","uns","umas",
        "para","por","com","sem","em","no","na","nos","nas","que","the","of","and","for",
        "to","in","on","at","by","new","used","novo","usado","recondicionado","para","com"
    };

    public static List<string> Generate(string title, string category, string? description, int max = 6)
    {
        var source = $"{title} {category} {description ?? string.Empty}";
        var normalized = RemoveDiacritics(source).ToLowerInvariant();

        var tokens = Regex.Matches(normalized, "[a-z0-9]{3,}")
            .Select(m => m.Value)
            .Where(t => !Stopwords.Contains(t))
            .Distinct();

        var tags = new List<string>();
        if (!string.IsNullOrWhiteSpace(category))
        {
            var cat = RemoveDiacritics(category).ToLowerInvariant();
            if (!tags.Contains(cat)) tags.Add(cat);
        }

        foreach (var token in tokens)
        {
            if (tags.Count >= max) break;
            if (!tags.Contains(token)) tags.Add(token);
        }

        return tags;
    }

    private static string RemoveDiacritics(string text)
    {
        var sb = new StringBuilder();
        foreach (var c in text.Normalize(NormalizationForm.FormD))
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString();
    }
}
