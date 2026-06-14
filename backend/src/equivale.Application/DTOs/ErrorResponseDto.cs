namespace equivale.Application.DTOs;

/// <summary>
/// DTO padronizado para respostas de erro da API.
/// </summary>
public record ErrorResponseDto(string Error, string Message);
