

```markdown
# Regras de Desenvolvimento - InfluenciAI WPF/C#

**Versão**: 1.1  
**Última atualização**: 13/10/2025  
**Stack**: .NET 8 + WPF + Entity Framework Core + PostgreSQL  

---

## 📑 Índice

- [1. Linguagem e Documentação](#1-linguagem-e-documentacao)
- [2. Encoding e Line Endings](#2-encoding-e-line-endings)
- [3. Estrutura de Arquivos](#3-estrutura-de-arquivos)
- [4. Padrões de Código C#](#4-padroes-de-codigo-c)
- [5. Padrões XAML](#5-padroes-xaml)
- [6. Gestão de Ícones](#6-gestao-de-icones)
- [7. MVVM Pattern](#7-mvvm-pattern)
- [8. Injeção de Dependências](#8-injecao-de-dependencias)
- [9. Tratamento de Erros](#9-tratamento-de-erros)
- [10. Testes](#10-testes)
- [11. Performance](#11-performance)
- [12. Segurança](#12-seguranca)
- [13. Checklist de Código](#13-checklist-de-codigo)
- [Recursos Adicionais](#recursos-adicionais)

---

### 1. Linguagem e Documentação

#### Código  
**Inglês obrigatório** para:
- Namespaces, classes, interfaces, enums
- Variáveis, métodos, propriedades
- Comentários técnicos
- Commits, branches, PRs

```csharp
// ✅ CORRETO
public class AnalysisService : IAnalysisService
{
    public async Task<AnalysisResult> AnalyzePostAsync(string postUrl)
    {
        // ...
    }
}

// ❌ ERRADO
public class ServicoAnalise : IServicoAnalise
{
    public async Task<ResultadoAnalise> AnalisarPostAsync(string urlPost)
    {
        // ...
    }
}
```

#### Documentação  
**Português (BR)** para:
- `README.md`, `CHANGELOG.md`
- Documentação de negócio (PRD, blueprints)
- Comentários explicativos de alto nível
- Issues/tasks de gestão

> **Mensagens de UI**: devem estar em **português (BR)**. Use `resx` se houver planos futuros de internacionalização.

```csharp
/// <summary>
/// Calcula a taxa de engajamento de um post do Twitter/X.
/// </summary>
/// <param name="metrics">Métricas públicas do tweet</param>
/// <returns>Taxa de engajamento entre 0.0 e 1.0</returns>
/// <remarks>
/// Fórmula: (likes + retweets + replies + quotes) / impressions
/// </remarks>
public double CalculateEngagement(PublicMetrics metrics)
{
    // ...
}
```

---

### 2. Encoding e Line Endings

#### `.editorconfig` Obrigatório

```ini
# .editorconfig (raiz da solução)
root = true

[*]
charset = utf-8
end_of_line = crlf
insert_final_newline = true
trim_trailing_whitespace = true

# C# files
[*.cs]
charset = utf-8-bom
indent_style = space
indent_size = 4
dotnet_sort_system_directives_first = true
dotnet_separate_import_directive_groups = false

# XAML files
[*.xaml]
charset = utf-8-bom
indent_style = space
indent_size = 4

# JSON, XML
[*.{json,xml}]
indent_size = 2

# Scripts
[*.{ps1,sh}]
end_of_line = crlf
```

#### Regra Crítica: UTF-8 com BOM
- **C# e XAML**: sempre `UTF-8 with BOM`
- **JSON, MD**: `UTF-8 without BOM`
- Visual Studio configura corretamente por padrão

#### Verificação Pré-Commit (`scripts/Check-Encoding.ps1`)

```powershell
$files = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -match '\.(cs|xaml)$' }

foreach ($file in $files) {
    $content = Get-Content $file -Raw -Encoding UTF8
    if ($content -match 'Ã[ƒ‚¯]|Ã¢[Å"ï¿½]|Ã°Å¸') {
        Write-Error "❌ Mojibake detectado em $file"
        Write-Error "Execute: scripts/Repair-Mojibake.ps1 $file"
        exit 1
    }
}
Write-Host "✅ Encoding validado"
```

---

### 3. Estrutura de Arquivos

#### Solução Completa

```
InfluenciAI.sln
│
├── src/
│   ├── 1-Core/
│   │   ├── InfluenciAI.Domain/                # Entidades, Value Objects
│   │   ├── InfluenciAI.Application/           # Use Cases, DTOs
│   │   └── InfluenciAI.Contracts/             # Interfaces compartilhadas
│   ├── 2-Infrastructure/
│   │   ├── InfluenciAI.Infrastructure.Data/   # EF Core, Repositórios
│   │   ├── InfluenciAI.Infrastructure.Cache/  # Redis
│   │   ├── InfluenciAI.Infrastructure.Identity/
│   │   └── InfluenciAI.Infrastructure.External/ # Twitter API, OpenAI
│   ├── 3-Services/
│   │   ├── InfluenciAI.Api/                   # ASP.NET Core Web API
│   │   └── InfluenciAI.Service.Analysis/      # Workers (opcional)
│   ├── 4-Presentation/
│   │   ├── InfluenciAI.Desktop.WPF/           # Cliente Desktop
│   │   │   ├── Views/
│   │   │   ├── ViewModels/
│   │   │   ├── Services/
│   │   │   ├── Controls/
│   │   │   ├── Converters/
│   │   │   └── Resources/
│   │   │       ├── Themes/
│   │   │       ├── Styles/
│   │   │       └── Icons/
│   │   └── InfluenciAI.Desktop.Core/          # Lógica compartilhada
│   └── 5-CrossCutting/
│       ├── InfluenciAI.Common/                # Utilitários
│       └── InfluenciAI.Logging/               # Serilog
│
├── tests/
│   ├── InfluenciAI.Domain.Tests/
│   ├── InfluenciAI.Application.Tests/
│   ├── InfluenciAI.Infrastructure.Tests/
│   ├── InfluenciAI.Api.Tests/
│   └── InfluenciAI.Desktop.Tests/
│
├── tools/
│   ├── DataMigration/
│   └── Scripts/
│
└── docs/
    ├── Architecture/
    ├── API/
    └── UserGuides/
```

#### Organização de Views WPF

```
Views/
├── Auth/
├── Dashboard/
├── Analysis/
├── History/
├── Settings/
└── Shared/
```

---

### 4. Padrões de Código C#

#### Nullable Reference Types

```xml
<PropertyGroup>
  <Nullable>enable</Nullable>
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
</PropertyGroup>
```

#### Async/Await

- Sempre use `async` todo o caminho.
- **Nunca** use `.Result` ou `.Wait()` → risco de deadlock.
- Sempre inclua `CancellationToken`.

#### Naming Conventions

- Classes, métodos, propriedades: `PascalCase`
- Campos privados: `_camelCase`
- Parâmetros/variáveis: `camelCase`
- Interfaces: `I + PascalCase`
- Constantes: `PascalCase` ou `UPPER_CASE`

#### Records para DTOs

Prefira `record` para DTOs imutáveis:

```csharp
public record AnalysisRequest(string Url, string Type);
```

#### LINQ e Pattern Matching

Use `switch` expressions e pattern matching para legibilidade.

---

### 5. Padrões XAML

#### Estrutura de View (exemplo corrigido)

```xaml
<UserControl x:Class="InfluenciAI.Desktop.WPF.Views.Analysis.AnalysisView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             xmlns:vm="clr-namespace:InfluenciAI.Desktop.WPF.ViewModels"
             xmlns:fluent="clr-namespace:FluentIcons.WPF;assembly=FluentIcons.WPF"
             mc:Ignorable="d"
             d:DataContext="{d:DesignInstance Type=vm:AnalysisViewModel, IsDesignTimeCreatable=True}"
             d:DesignHeight="600" d:DesignWidth="800">
    
    <UserControl.Resources>
        <BooleanToVisibilityConverter x:Key="BoolToVis" />
    </UserControl.Resources>
    
    <Grid>
        <!-- Layout -->
    </Grid>
</UserControl>
```

#### Dicas de Performance WPF
- Use `VirtualizingStackPanel` em listas grandes.
- Prefira `StaticResource` em vez de `DynamicResource`.
- Evite `ElementName` binding em listas com muitos itens.
- Não exponha `DataContext` diretamente no XAML — use DI.

---

### 6. Gestão de Ícones

#### Regra Crítica
- **NUNCA** use emojis em C# (`code-behind`).
- **Permitido** em XAML (UTF-8 nativo).

#### FluentIcons (Recomendado)

```xaml
<fluent:SymbolIcon Symbol="Target" FontSize="16" Foreground="White" />
```

#### Converter (corrigido)

```csharp
public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    => throw new NotImplementedException();
```

---

### 7. MVVM Pattern

- Use `CommunityToolkit.Mvvm`.
- Code-behind apenas para `InitializeComponent()`.
- Comunicação entre ViewModels: `WeakReferenceMessenger`.

---

### 8. Injecao de Dependencias

#### Melhoria: Use Scrutor para escaneamento automático (opcional)

```csharp
services.Scan(scan => scan
    .FromAssemblyOf<IAnalysisService>()
    .AddClasses()
    .AsMatchingInterface()
    .WithTransientLifetime());
```

#### Lifetimes
- **Singleton**: serviços globais (`ICacheService`)
- **Scoped**: `DbContext` (mesmo em WPF, útil por operação)
- **Transient**: ViewModels e serviços stateless

---

### 9. Tratamento de Erros

- Use exceções customizadas do domínio.
- Log estruturado com `ILogger`.
- Handler global no `App.xaml.cs`.

---

### 10. Testes

#### Testes de UI
- **Evite testes de UI sempre que possível**.
- Foque em testar **ViewModels** (totalmente testáveis sem UI).
- Se necessário, considere **TestStack.White** ou **WinAppDriver** (avançado).

#### Exemplo de Teste (corrigido)

```csharp
[Fact]
public async Task AnalyzePostAsync_WithValidUrl_ShouldReturnAnalysis()
{
    // Arrange
    var url = "https://x.com/user/status/123456789";
    // ...
}
```

---

### 11. Performance

#### WPF-Specific
- `VirtualizingPanel`
- `UIElement.IsVisible` para evitar atualizações desnecessárias
- `Binding.IsAsync` com cuidado

#### EF Core
- `AsNoTracking()` para leitura
- Paginação com `Skip`/`Take`
- Evite N+1 com `Include` ou projeções

---

### 12. Seguranca

#### Secrets
- **Nunca** commit `appsettings.json` com secrets.
- Use **User Secrets** (dev) e **Azure Key Vault** (prod).

#### HTTPS
> Todas as chamadas HTTP para serviços externos (ex: `InfluenciAI.Api`) **devem usar HTTPS em produção**.

#### Validação
- Use `FluentValidation`.
- **Nunca** concatene strings SQL — EF Core já parametriza.

---

### 13. Checklist de Código

| Categoria       | Item                                                                 | Validação Automática?  |
|-----------------|----------------------------------------------------------------------|------------------------|
| **C#**          | `dotnet format` executado                                            | ✅ Sim                 |
|                 | Nullable habilitado e respeitado                                     | ✅                     |
|                 | Sem `.Result` ou `.Wait()`                                           | ✅                     |
| **XAML**        | UTF-8 with BOM                                                       | ✅ (`Check-Encoding.ps1`) |
|                 | `StaticResource` preferido                                           | ❌                     |
| **Segurança**   | Secrets não commitados                                               | ✅ (`.gitignore` + `git-secrets`) |
|                 | Validação de entrada implementada                                    | ❌                     |
| **Performance** | `AsNoTracking()` em queries de leitura                               | ❌                     |
| **Acessibilidade** | Contraste WCAG AA, tooltips, tab order                            | ❌                     |

> 💡 **Dica**: Adicione um `pre-commit` hook com `dotnet format --verify-no-changes` e `Check-Encoding.ps1`.

---

## Recursos Adicionais

### Pacotes Recomendados

```xml
<!-- UI/MVVM -->
<PackageReference Include="CommunityToolkit.Mvvm" Version="8.2.2" />
<PackageReference Include="ModernWpfUI" Version="0.9.6" />
<PackageReference Include="FluentIcons.WPF" Version="1.1.251" />

<!-- Data/API -->
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />
<PackageReference Include="StackExchange.Redis" Version="2.7.10" />
<PackageReference Include="Refit" Version="7.0.0" />

<!-- Logging -->
<PackageReference Include="Serilog.Extensions.Hosting" Version="8.0.0" />
<PackageReference Include="Serilog.Sinks.Console" Version="5.0.1" />
<PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />

<!-- Testing -->
<PackageReference Include="xunit" Version="2.6.6" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
<PackageReference Include="Moq" Version="4.20.70" />
```

### Ferramentas
- Visual Studio 2022 (v17.8+)
- `dotnet-format`, `dotnet-ef`
- ReSharper ou Rider (opcional)

### Documentação Oficial
- [.NET 8](https://learn.microsoft.com/dotnet/)
- [WPF](https://learn.microsoft.com/dotnet/desktop/wpf/)
- [CommunityToolkit.MVVM](https://learn.microsoft.com/dotnet/communitytoolkit/mvvm/)
- [EF Core](https://learn.microsoft.com/ef/core/)

---

**Última atualização**: 13/10/2025  
**Versão**: 1.1  
**Mantenedor**: Equipe InfluenciAI  
**Próxima revisão**: 13/04/2026
```

---