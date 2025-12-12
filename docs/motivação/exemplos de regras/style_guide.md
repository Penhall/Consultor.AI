# Guia de Estilo Visual - InfluenciAI WPF

**Versão:** 1.0  
**Última atualização:** 13/10/2025  
**Tema Base:** Nord Dark Theme

---

## 📑 Índice

1. [Filosofia de Design](#1-filosofia-de-design)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamentos e Dimensões](#4-espaçamentos-e-dimensões)
5. [Componentes Base](#5-componentes-base)
6. [Ícones e Símbolos](#6-ícones-e-símbolos)
7. [Efeitos Visuais](#7-efeitos-visuais)
8. [Animações](#8-animações)
9. [Templates de Conteúdo](#9-templates-de-conteúdo)
10. [Estados de Interface](#10-estados-de-interface)
11. [Exemplos Práticos](#11-exemplos-práticos)

---

## 1. Filosofia de Design

### Tema Principal: **Nord Dark Theme para Social Analytics**

O InfluenciAI utiliza uma paleta inspirada no **Nord Theme**, adaptada para análise de dados sociais:

- **Alta legibilidade** em sessões longas de análise
- **Cores suaves** que reduzem fadiga visual
- **Contraste equilibrado** para métricas e KPIs
- **Aparência profissional** para apresentações executivas

### Princípios de Design

1. **Data-First**: Métricas são os protagonistas visuais
2. **Consistência**: Mesmo estilo em todas as views
3. **Hierarquia Clara**: Tamanhos e cores indicam importância
4. **Feedback Imediato**: Estados visuais óbvios (loading, success, error)
5. **Responsividade**: Interface adapta-se a diferentes tamanhos de janela

---

## 2. Paleta de Cores

### Cores Base (Nord Polar Night)

```xaml
<!-- Phase1Resources.xaml -->
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">

    <!-- Backgrounds -->
    <SolidColorBrush x:Key="PrimaryBackgroundBrush" Color="#FF2E3440"/>     <!-- Fundo principal -->
    <SolidColorBrush x:Key="SecondaryBackgroundBrush" Color="#FF3B4252"/>   <!-- Cards, panels -->
    <SolidColorBrush x:Key="AccentBackgroundBrush" Color="#FF434C5E"/>      <!-- Hover states -->
    <SolidColorBrush x:Key="BorderBrush" Color="#FF434C5E"/>                <!-- Bordas -->
    
    <!-- Text Colors (Nord Snow Storm) -->
    <SolidColorBrush x:Key="PrimaryTextBrush" Color="#FFECEFF4"/>           <!-- Texto principal -->
    <SolidColorBrush x:Key="SecondaryTextBrush" Color="#FFD8DEE9"/>         <!-- Texto secundário -->
    <SolidColorBrush x:Key="AccentTextBrush" Color="#FF88C0D0"/>            <!-- Links, destaque -->
    <SolidColorBrush x:Key="TextMuted" Color="#FF4C566A"/>                  <!-- Desabilitado -->
    
    <!-- Action Colors (Nord Frost) -->
    <SolidColorBrush x:Key="PrimaryColor" Color="#FF5E81AC"/>               <!-- Ação principal -->
    <SolidColorBrush x:Key="SecondaryColor" Color="#FF81A1C1"/>             <!-- Hover -->
    <SolidColorBrush x:Key="AccentColor" Color="#FF88C0D0"/>                <!-- Accent -->
    
    <!-- Status Colors (Nord Aurora) -->
    <SolidColorBrush x:Key="SuccessColor" Color="#FFA3BE8C"/>               <!-- Verde -->
    <SolidColorBrush x:Key="WarningColor" Color="#FFEBCB8B"/>               <!-- Amarelo -->
    <SolidColorBrush x:Key="ErrorColor" Color="#FFBF616A"/>                 <!-- Vermelho -->
    <SolidColorBrush x:Key="InfoColor" Color="#FFD08770"/>                  <!-- Laranja -->
    
    <!-- Specific Feature Colors -->
    <SolidColorBrush x:Key="AnalysisButtonBrush" Color="#FF5E81AC"/>        <!-- Azul -->
    <SolidColorBrush x:Key="ValidationButtonBrush" Color="#FFA3BE8C"/>      <!-- Verde -->
    <SolidColorBrush x:Key="ReportButtonBrush" Color="#FFB48EAD"/>          <!-- Roxo -->
    
</ResourceDictionary>
```

### Hierarquia de Cores

| Elemento | Cor Base | Hover | Pressed | Disabled |
|----------|----------|-------|---------|----------|
| Botão Primário | #5E81AC | #81A1C1 | #434C5E | #4C566A |
| Botão Secundário | #434C5E | #5E81AC | #3B4252 | #4C566A |
| TextBox | #3B4252 | #434C5E | - | #2E3440 |
| Card | #3B4252 | #434C5E | - | - |

### Uso de Cores por Contexto

```xaml
<!-- Dashboard Background -->
<Grid Background="{StaticResource PrimaryBackgroundBrush}"/>

<!-- Card/Panel -->
<Border Background="{StaticResource SecondaryBackgroundBrush}"
        BorderBrush="{StaticResource BorderBrush}"
        BorderThickness="1"/>

<!-- Texto Principal -->
<TextBlock Text="Análise de Post"
           Foreground="{StaticResource PrimaryTextBrush}"/>

<!-- Métrica Positiva -->
<TextBlock Text="+15.3%"
           Foreground="{StaticResource SuccessColor}"/>

<!-- Erro -->
<TextBlock Text="Falha ao carregar"
           Foreground="{StaticResource ErrorColor}"/>
```

---

## 3. Tipografia

### Famílias de Fonte

```xaml
<!-- Fontes Base -->
<FontFamily x:Key="PrimaryFontFamily">Segoe UI</FontFamily>
<FontFamily x:Key="MonospaceFontFamily">Consolas</FontFamily>
<FontFamily x:Key="HeadingFontFamily">Segoe UI Semibold</FontFamily>
```

**Uso**:
- **Segoe UI**: Interface geral, labels, botões
- **Consolas**: Valores numéricos, IDs, timestamps
- **Segoe UI Semibold**: Títulos, headers

### Escala de Tamanhos

```xaml
<!-- Tamanhos de Fonte -->
<sys:Double x:Key="LargeFontSize">18</sys:Double>      <!-- Headers principais -->
<sys:Double x:Key="TitleFontSize">16</sys:Double>      <!-- Títulos de seção -->
<sys:Double x:Key="SubtitleFontSize">14</sys:Double>   <!-- Subtítulos -->
<sys:Double x:Key="NormalFontSize">12</sys:Double>     <!-- Texto padrão -->
<sys:Double x:Key="SmallFontSize">11</sys:Double>      <!-- Texto secundário -->
<sys:Double x:Key="TinyFontSize">10</sys:Double>       <!-- Status, timestamps -->
```

### Pesos e Estilos

```xaml
<!-- Aplicação de FontWeight -->
<Style x:Key="PageHeaderStyle" TargetType="TextBlock">
    <Setter Property="FontSize" Value="{StaticResource LargeFontSize}"/>
    <Setter Property="FontWeight" Value="Bold"/>
    <Setter Property="Foreground" Value="{StaticResource PrimaryTextBrush}"/>
</Style>

<Style x:Key="SectionHeaderStyle" TargetType="TextBlock">
    <Setter Property="FontSize" Value="{StaticResource TitleFontSize}"/>
    <Setter Property="FontWeight" Value="SemiBold"/>
    <Setter Property="Foreground" Value="{StaticResource PrimaryTextBrush}"/>
</Style>

<Style x:Key="MetricValueStyle" TargetType="TextBlock">
    <Setter Property="FontFamily" Value="{StaticResource MonospaceFontFamily}"/>
    <Setter Property="FontSize" Value="{StaticResource NormalFontSize}"/>
    <Setter Property="FontWeight" Value="Regular"/>
</Style>
```

### Exemplos de Uso

```xaml
<!-- Título de Página -->
<TextBlock Text="Dashboard"
           Style="{StaticResource PageHeaderStyle}"
           Margin="0,0,0,20"/>

<!-- Título de Seção -->
<TextBlock Text="Análises Recentes"
           Style="{StaticResource SectionHeaderStyle}"
           Margin="0,0,0,10"/>

<!-- Label e Valor -->
<StackPanel Orientation="Horizontal" Margin="0,5">
    <TextBlock Text="Curtidas:"
               FontSize="{StaticResource SmallFontSize}"
               FontWeight="SemiBold"
               Foreground="{StaticResource SecondaryTextBrush}"
               Margin="0,0,8,0"/>
    <TextBlock Text="1,254"
               FontFamily="{StaticResource MonospaceFontFamily}"
               FontSize="{StaticResource NormalFontSize}"
               Foreground="{StaticResource SuccessColor}"/>
</StackPanel>
```

---

## 4. Espaçamentos e Dimensões

### Margens Padrão

```xaml
<!-- Definições de Thickness -->
<Thickness x:Key="LargeMargin">20</Thickness>       <!-- Entre seções principais -->
<Thickness x:Key="DefaultMargin">10</Thickness>     <!-- Margem padrão -->
<Thickness x:Key="SmallMargin">5</Thickness>        <!-- Entre elementos próximos -->
<Thickness x:Key="TinyMargin">2</Thickness>         <!-- Ícone + texto -->
```

### Paddings

```xaml
<Thickness x:Key="LargePadding">20</Thickness>      <!-- Panels grandes -->
<Thickness x:Key="DefaultPadding">15</Thickness>    <!-- Panels médios -->
<Thickness x:Key="SmallPadding">8</Thickness>       <!-- Botões, TextBox -->
<Thickness x:Key="TinyPadding">4</Thickness>        <!-- Badges, chips -->
```

### Corner Radius

```xaml
<sys:Double x:Key="LargeCornerRadius">12</sys:Double>    <!-- Cards grandes -->
<sys:Double x:Key="DefaultCornerRadius">8</sys:Double>   <!-- Panels -->
<sys:Double x:Key="SmallCornerRadius">6</sys:Double>     <!-- Botões -->
<sys:Double x:Key="TinyCornerRadius">4</sys:Double>      <!-- TextBox, chips -->
```

### Dimensões de Controles

| Controle | Altura | Largura Mínima | Padding |
|----------|--------|----------------|---------|
| Botão Primário | 36px | 120px | 15,8 |
| Botão Secundário | 32px | 100px | 12,6 |
| TextBox | 32px | - | 10,6 |
| ComboBox | 32px | 150px | 10,6 |
| Card Header | 48px | - | 15 |
| Status Bar | 28px | - | 10,4 |

---

## 5. Componentes Base

### 5.1 Botões

#### Estilo Padrão

```xaml
<Style x:Key="ModernButtonStyle" TargetType="Button">
    <Setter Property="Background" Value="{StaticResource SecondaryBackgroundBrush}"/>
    <Setter Property="Foreground" Value="White"/>
    <Setter Property="BorderBrush" Value="{StaticResource PrimaryColor}"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="Padding" Value="12,6"/>
    <Setter Property="FontSize" Value="{StaticResource SmallFontSize}"/>
    <Setter Property="FontWeight" Value="SemiBold"/>
    <Setter Property="Cursor" Value="Hand"/>
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="Button">
                <Border Background="{TemplateBinding Background}"
                        BorderBrush="{TemplateBinding BorderBrush}"
                        BorderThickness="{TemplateBinding BorderThickness}"
                        CornerRadius="{StaticResource SmallCornerRadius}"
                        Padding="{TemplateBinding Padding}">
                    <ContentPresenter HorizontalAlignment="Center"
                                    VerticalAlignment="Center"/>
                </Border>
                <ControlTemplate.Triggers>
                    <Trigger Property="IsMouseOver" Value="True">
                        <Setter Property="Background" Value="{StaticResource PrimaryColor}"/>
                    </Trigger>
                    <Trigger Property="IsPressed" Value="True">
                        <Setter Property="Background" Value="{StaticResource AccentBackgroundBrush}"/>
                    </Trigger>
                    <Trigger Property="IsEnabled" Value="False">
                        <Setter Property="Background" Value="{StaticResource TextMuted}"/>
                        <Setter Property="Foreground" Value="#FF888888"/>
                        <Setter Property="Cursor" Value="Arrow"/>
                    </Trigger>
                </ControlTemplate.Triggers>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>
```

#### Botão Primário

```xaml
<Style x:Key="PrimaryButtonStyle" BasedOn="{StaticResource ModernButtonStyle}" TargetType="Button">
    <Setter Property="Background" Value="{StaticResource PrimaryColor}"/>
    <Setter Property="MinHeight" Value="36"/>
    <Setter Property="MinWidth" Value="120"/>
    <Setter Property="FontSize" Value="{StaticResource NormalFontSize}"/>
</Style>

<!-- Uso -->
<Button Content="Analisar Post"
        Style="{StaticResource PrimaryButtonStyle}"
        Command="{Binding AnalyzeCommand}"/>
```

#### Botões de Ação Específicos

```xaml
<!-- Botão de Análise -->
<Style x:Key="AnalysisButtonStyle" BasedOn="{StaticResource PrimaryButtonStyle}" TargetType="Button">
    <Setter Property="Background" Value="{StaticResource AnalysisButtonBrush}"/>
</Style>

<!-- Botão de Validação -->
<Style x:Key="ValidationButtonStyle" BasedOn="{StaticResource PrimaryButtonStyle}" TargetType="Button">
    <Setter Property="Background" Value="{StaticResource ValidationButtonBrush}"/>
</Style>

<!-- Botão de Relatório -->
<Style x:Key="ReportButtonStyle" BasedOn="{StaticResource PrimaryButtonStyle}" TargetType="Button">
    <Setter Property="Background" Value="{StaticResource ReportButtonBrush}"/>
</Style>
```

### 5.2 TextBox

```xaml
<Style x:Key="ModernTextBoxStyle" TargetType="TextBox">
    <Setter Property="Background" Value="{StaticResource SecondaryBackgroundBrush}"/>
    <Setter Property="Foreground" Value="{StaticResource PrimaryTextBrush}"/>
    <Setter Property="BorderBrush" Value="{StaticResource BorderBrush}"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="Padding" Value="10,6"/>
    <Setter Property="FontSize" Value="{StaticResource NormalFontSize}"/>
    <Setter Property="Height" Value="32"/>
    <Setter Property="VerticalContentAlignment" Value="Center"/>
    <Style.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter Property="BorderBrush" Value="{StaticResource PrimaryColor}"/>
        </Trigger>
        <Trigger Property="IsFocused" Value="True">
            <Setter Property="BorderBrush" Value="{StaticResource AccentColor}"/>
        </Trigger>
    </Style.Triggers>
</Style>

<!-- Uso -->
<TextBox Style="{StaticResource ModernTextBoxStyle}"
         Text="{Binding PostUrl, UpdateSourceTrigger=PropertyChanged}"
         Watermark="Cole a URL do post aqui..."/>
```

### 5.3 ComboBox

```xaml
<Style x:Key="ModernComboBoxStyle" TargetType="ComboBox">
    <Setter Property="Background" Value="{StaticResource SecondaryBackgroundBrush}"/>
    <Setter Property="Foreground" Value="{StaticResource PrimaryTextBrush}"/>
    <Setter Property="BorderBrush" Value="{StaticResource BorderBrush}"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="Padding" Value="10,6"/>
    <Setter Property="FontSize" Value="{StaticResource NormalFontSize}"/>
    <Setter Property="Height" Value="32"/>
    <Style.Triggers>
        <Trigger Property="IsMouseOver" Value="True">
            <Setter Property="BorderBrush" Value="{StaticResource PrimaryColor}"/>
        </Trigger>
    </Style.Triggers>
</Style>

<!-- Uso -->
<ComboBox Style="{StaticResource ModernComboBoxStyle}"
          ItemsSource="{Binding AnalysisTypes}"
          SelectedItem="{Binding SelectedAnalysisType}"/>
```

### 5.4 Panels e Borders

#### Card Base

```xaml
<Style x:Key="CardStyle" TargetType="Border">
    <Setter Property="Background" Value="{StaticResource SecondaryBackgroundBrush}"/>
    <Setter Property="BorderBrush" Value="{StaticResource BorderBrush}"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="CornerRadius" Value="{StaticResource DefaultCornerRadius}"/>
    <Setter Property="Padding" Value="{StaticResource DefaultPadding}"/>
    <Setter Property="Margin" Value="{StaticResource SmallMargin}"/>
</Style>

<!-- Uso -->
<Border Style="{StaticResource CardStyle}">
    <StackPanel>
        <TextBlock Text="Total de Análises" Style="{StaticResource SectionHeaderStyle}"/>
        <TextBlock Text="247" FontSize="32" FontWeight="Bold"/>
    </StackPanel>
</Border>
```

#### Metric Card

```xaml
<Style x:Key="MetricCardStyle" BasedOn="{StaticResource CardStyle}" TargetType="Border">
    <Setter Property="MinHeight" Value="100"/>
    <Setter Property="MinWidth" Value="200"/>
</Style>

<!-- Uso com DataTemplate -->
<DataTemplate x:Key="MetricCardTemplate">
    <Border Style="{StaticResource MetricCardStyle}">
        <Grid>
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="*"/>
                <RowDefinition Height="Auto"/>
            </Grid.RowDefinitions>
            
            <!-- Label -->
            <TextBlock Grid.Row="0"
                       Text="{Binding Label}"
                       FontSize="{StaticResource SmallFontSize}"
                       Foreground="{StaticResource SecondaryTextBrush}"/>
            
            <!-- Valor -->
            <TextBlock Grid.Row="1"
                       Text="{Binding Value}"
                       FontSize="28"
                       FontWeight="Bold"
                       Foreground="{StaticResource PrimaryTextBrush}"
                       HorizontalAlignment="Center"
                       VerticalAlignment="Center"/>
            
            <!-- Variação -->
            <TextBlock Grid.Row="2"
                       Text="{Binding Change, StringFormat='{}{0:+0.0%;-0.0%;0%}'}"
                       FontSize="{StaticResource TinyFontSize}"
                       Foreground="{Binding ChangeColor}"
                       HorizontalAlignment="Right"/>
        </Grid>
    </Border>
</DataTemplate>
```

### 5.5 ProgressBar

```xaml
<Style x:Key="ModernProgressBarStyle" TargetType="ProgressBar">
    <Setter Property="Background" Value="{StaticResource SecondaryBackgroundBrush}"/>
    <Setter Property="Foreground" Value="{StaticResource AccentColor}"/>
    <Setter Property="Height" Value="8"/>
    <Setter Property="BorderThickness" Value="0"/>
    <Setter Property="Template">
        <Setter.Value>
            <ControlTemplate TargetType="ProgressBar">
                <Border Background="{TemplateBinding Background}"
                        CornerRadius="4">
                    <Grid>
                        <Border Name="PART_Track"
                                CornerRadius="4"/>
                        <Border Name="PART_Indicator"
                                Background="{TemplateBinding Foreground}"
                                HorizontalAlignment="Left"
                                CornerRadius="4"/>
                    </Grid>
                </Border>
            </ControlTemplate>
        </Setter.Value>
    </Setter>
</Style>

<!-- Uso -->
<ProgressBar Style="{StaticResource ModernProgressBarStyle}"
             Value="{Binding Progress}"
             Maximum="100"/>
```

---

## 6. Ícones e Símbolos

### FluentIcons (Obrigatório)

```xaml
xmlns:fluent="clr-namespace:FluentIcons.WPF;assembly=FluentIcons.WPF"

<!-- Uso Básico -->
<fluent:SymbolIcon Symbol="Target" 
                   FontSize="16" 
                   Foreground="White"/>

<!-- Com Margin -->
<StackPanel Orientation="Horizontal">
    <fluent:SymbolIcon Symbol="Info" 
                       FontSize="14" 
                       Margin="0,0,5,0"
                       Foreground="{StaticResource InfoColor}"/>
    <TextBlock Text="Informação importante" VerticalAlignment="Center"/>
</StackPanel>
```

### Mapeamento de Ícones do Sistema

```csharp
// IconStringToSymbolConverter.cs
public static class IconMapping
{
    public static readonly Dictionary<string, Symbol> Icons = new()
    {
        // Ações
        ["ANALYZE"] = Symbol.ChartMultiple,
        ["VALIDATE"] = Symbol.CheckmarkCircle,
        ["COMPARE"] = Symbol.ArrowCompare,
        ["EXPORT"] = Symbol.ArrowExport,
        ["REFRESH"] = Symbol.ArrowClockwise,
        
        // Navegação
        ["DASHBOARD"] = Symbol.Home,
        ["HISTORY"] = Symbol.History,
        ["SETTINGS"] = Symbol.Settings,
        ["PROFILE"] = Symbol.Person,
        
        // Status
        ["SUCCESS"] = Symbol.CheckmarkCircle,
        ["ERROR"] = Symbol.ErrorCircle,
        ["WARNING"] = Symbol.Warning,
        ["INFO"] = Symbol.Info,
        ["LOADING"] = Symbol.ProgressRing,
        
        // Social
        ["TWITTER"] = Symbol.Share,
        ["INSTAGRAM"] = Symbol.Image,
        ["LINKEDIN"] = Symbol.People,
        
        // Dados
        ["METRICS"] = Symbol.DataBarVertical,
        ["INSIGHTS"] = Symbol.LightbulbFilament,
        ["REPORT"] = Symbol.Document,
        ["CHART"] = Symbol.ChartLine
    };
}
```

### Botões com Ícones

```xaml
<!-- Botão Icon-Only -->
<Button Style="{StaticResource IconButtonStyle}"
        ToolTip="Atualizar dados"
        Command="{Binding RefreshCommand}">
    <fluent:SymbolIcon Symbol="ArrowClockwise" FontSize="16"/>
</Button>

<!-- Botão Icon + Text -->
<Button Style="{StaticResource PrimaryButtonStyle}"
        Command="{Binding AnalyzeCommand}">
    <StackPanel Orientation="Horizontal">
        <fluent:SymbolIcon Symbol="ChartMultiple" 
                           FontSize="14" 
                           Margin="0,0,8,0"/>
        <TextBlock Text="Analisar" VerticalAlignment="Center"/>
    </StackPanel>
</Button>
```

---

## 7. Efeitos Visuais

### Drop Shadows

```xaml
<!-- Sombra para Botões -->
<DropShadowEffect x:Key="ButtonShadowEffect"
                  BlurRadius="8"
                  Direction="315"
                  Opacity="0.3"
                  ShadowDepth="2"
                  Color="Black"/>

<!-- Sombra para Hover -->
<DropShadowEffect x:Key="ButtonHoverShadowEffect"
                  BlurRadius="12"
                  Direction="315"
                  Opacity="0.5"
                  ShadowDepth="4"
                  Color="Black"/>

<!-- Sombra para Cards -->
<DropShadowEffect x:Key="CardShadowEffect"
                  BlurRadius="10"
                  Direction="315"
                  Opacity="0.2"
                  ShadowDepth="3"
                  Color="Black"/>
```

### Aplicação de Efeitos

```xaml
<!-- Em botões -->
<Button Style="{StaticResource PrimaryButtonStyle}">
    <Button.Effect>
        <DropShadowEffect BlurRadius="8" Direction="315" Opacity="0.3" ShadowDepth="2"/>
    </Button.Effect>
</Button>

<!-- Em cards -->
<Border Style="{StaticResource CardStyle}">
    <Border.Effect>
        <DropShadowEffect BlurRadius="10" Direction="315" Opacity="0.2" ShadowDepth="3"/>
    </Border.Effect>
</Border>
```

### Glow Effect (Focus)

```xaml
<!-- Efeito de brilho para elementos em foco -->
<DropShadowEffect x:Key="FocusGlowEffect"
                  ShadowDepth="0"
                  BlurRadius="8"
                  Color="{Binding Source={StaticResource AccentColor}, Path=Color}"
                  Opacity="0.6"/>

<!-- Aplicação -->
<TextBox Style="{StaticResource ModernTextBoxStyle}">
    <TextBox.Triggers>
        <Trigger Property="IsFocused" Value="True">
            <Setter Property="Effect" Value="{StaticResource FocusGlowEffect}"/>
        </Trigger>
    </TextBox.Triggers>
</TextBox>
```

---

## 8. Animações

### Fade In

```xaml
<Storyboard x:Key="FadeInAnimation">
    <DoubleAnimation Storyboard.TargetProperty="Opacity"
                     From="0"
                     To="1"
                     Duration="0:0:0.3"
                     EasingFunction="{StaticResource EaseOutQuad}"/>
</Storyboard>

<!-- EasingFunction -->
<QuadraticEase x:Key="EaseOutQuad" EasingMode="EaseOut"/>
```

### Slide In

```xaml
<Storyboard x:Key="SlideInFromRightAnimation">
    <DoubleAnimation Storyboard.TargetProperty="(UIElement.RenderTransform).(TranslateTransform.X)"
                     From="100"
                     To="0"
                     Duration="0:0:0.4"
                     EasingFunction="{StaticResource EaseOutQuad}"/>
    <DoubleAnimation Storyboard.TargetProperty="Opacity"
                     From="0"
                     To="1"
                     Duration="0:0:0.3"/>
</Storyboard>
```

### Loading Spinner

```xaml
<Storyboard x:Key="LoadingAnimation" RepeatBehavior="Forever">
    <DoubleAnimation Storyboard.TargetProperty="(UIElement.RenderTransform).(RotateTransform.Angle)"
                     From="0"
                     To="360"
                     Duration="0:0:1.2"/>
</Storyboard>

<!-- Aplicação -->
<fluent:SymbolIcon Symbol="ProgressRing" 
                   FontSize="24"
                   RenderTransformOrigin="0.5,0.5">
    <fluent:SymbolIcon.RenderTransform>
        <RotateTransform/>
    </fluent:SymbolIcon.RenderTransform>
    <fluent:SymbolIcon.Triggers>
        <EventTrigger RoutedEvent="Loaded">
            <BeginStoryboard Storyboard="{StaticResource LoadingAnimation}"/>
        </EventTrigger>
    </fluent:SymbolIcon.Triggers>
</fluent:SymbolIcon>
```

### Durações Recomendadas

| Animação | Duração | Easing | Uso |
|----------|---------|--------|-----|
| Hover Transition | 0.1s | Linear | Mudança de cor |
| Fade In/Out | 0.3s | EaseOut | Aparecer/desaparecer |
| Slide In/Out | 0.4s | EaseOut | Panels, modais |
| Loading Rotation | 1.2s | Linear | Indicador loading |
| Success Flash | 0.5s | EaseInOut | Feedback |

---

## 9. Templates de Conteúdo

### Loading State

```xaml
<DataTemplate x:Key="LoadingTemplate">
    <StackPanel HorizontalAlignment="Center" 
                VerticalAlignment="Center"
                Orientation="Horizontal">
        <fluent:SymbolIcon Symbol="ProgressRing" 
                           FontSize="24"
                           Margin="0,0,10,0">
            <!-- Animação de rotação -->
        </fluent:SymbolIcon>
        <TextBlock Text="Carregando..."
                   FontSize="{StaticResource NormalFontSize}"
                   Foreground="{StaticResource SecondaryTextBrush}"
                   VerticalAlignment="Center"/>
    </StackPanel>
</DataTemplate>
```

### Empty State

```xaml
<DataTemplate x:Key="EmptyStateTemplate">
    <StackPanel HorizontalAlignment="Center" 
                VerticalAlignment="Center">
        <fluent:SymbolIcon Symbol="DocumentEmpty" 
                           FontSize="48"
                           Foreground="{StaticResource TextMuted}"
                           Margin="0,0,0,15"/>
        <TextBlock Text="Nenhuma análise encontrada"
                   FontSize="{StaticResource SubtitleFontSize}"
                   Foreground="{StaticResource SecondaryTextBrush}"
                   TextAlignment="Center"
                   Margin="0,0,0,5"/>
        <TextBlock Text="Comece analisando seu primeiro post"
                   FontSize="{StaticResource SmallFontSize}"
                   Foreground="{StaticResource TextMuted}"
                   TextAlignment="Center"/>
    </StackPanel>
</DataTemplate>
```

### Error State

```xaml
<DataTemplate x:Key="ErrorTemplate">
    <Border Background="{StaticResource SecondaryBackgroundBrush}"
            BorderBrush="{StaticResource ErrorColor}"
            BorderThickness="1"
            CornerRadius="6"
            Padding="15">
        <StackPanel>
            <StackPanel Orientation="Horizontal" Margin="0,0,0,8">
                <fluent:SymbolIcon Symbol="ErrorCircle" 
                                   FontSize="16"
                                   Foreground="{StaticResource ErrorColor}"
                                   Margin="0,0,8,0"/>
                <TextBlock Text="Erro ao carregar dados"
                           FontWeight="SemiBold"
                           Foreground="{StaticResource ErrorColor}"/>
            </StackPanel>
            <TextBlock Text="{Binding ErrorMessage}"
                       FontSize="{StaticResource SmallFontSize}"
                       Foreground="{StaticResource SecondaryTextBrush}"
                       TextWrapping="Wrap"/>
        </StackPanel>
    </Border>
</DataTemplate>
```

---

## 10. Estados de Interface

### Status Badge

```xaml
<Style x:Key="StatusBadgeStyle" TargetType="Border">
    <Setter Property="CornerRadius" Value="12"/>
    <Setter Property="Padding" Value="8,4"/>
    <Setter Property="HorizontalAlignment" Value="Left"/>
</Style>

<!-- Uso -->
<Border Style="{StaticResource StatusBadgeStyle}"
        Background="{StaticResource SuccessColor}">
    <StackPanel Orientation="Horizontal">
        <fluent:SymbolIcon Symbol="CheckmarkCircle" 
                           FontSize="12"
                           Margin="0,0,5,0"/>
        <TextBlock Text="Concluído" 
                   FontSize="{StaticResource TinyFontSize}"
                   FontWeight="SemiBold"/>
    </StackPanel>
</Border>
```

### Tooltip Customizado

```xaml
<Style x:Key="ModernTooltipStyle" TargetType="ToolTip">
    <Setter Property="Background" Value="{StaticResource SecondaryBackgroundBrush}"/>
    <Setter Property="Foreground" Value="{StaticResource PrimaryTextBrush}"/>
    <Setter Property="BorderBrush" Value="{StaticResource BorderBrush}"/>
    <Setter Property="BorderThickness" Value="1"/>
    <Setter Property="Padding" Value="8,4"/>
    <Setter Property="FontSize" Value="{StaticResource SmallFontSize}"/>
</Style>

<!-- Aplicação global -->
<Style TargetType="ToolTip" BasedOn="{StaticResource ModernTooltipStyle}"/>
```

---

## 11. Exemplos Práticos

### Dashboard Header

```xaml
<Grid Height="60" 
      Background="{StaticResource PrimaryBackgroundBrush}">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*"/>
        <ColumnDefinition Width="Auto"/>
    </Grid.ColumnDefinitions>
    
    <!-- Título -->
    <StackPanel Grid.Column="0" 
                VerticalAlignment="Center"
                Margin="20,0">
        <TextBlock Text="Dashboard"
                   Style="{StaticResource PageHeaderStyle}"/>
        <TextBlock Text="Visão geral das suas análises"
                   FontSize="{StaticResource SmallFontSize}"
                   Foreground="{StaticResource SecondaryTextBrush}"/>
    </StackPanel>
    
    <!-- Ações -->
    <StackPanel Grid.Column="1" 
                Orientation="Horizontal"
                VerticalAlignment="Center"
                Margin="20,0">
        <Button Style="{StaticResource PrimaryButtonStyle}"
                Command="{Binding NewAnalysisCommand}">
            <StackPanel Orientation="Horizontal">
                <fluent:SymbolIcon Symbol="Add" FontSize="14" Margin="0,0,5,0"/>
                <TextBlock Text="Nova Análise"/>
            </StackPanel>
        </Button>
    </StackPanel>
</Grid>
```

### Analysis Card

```xaml
<Border Style="{StaticResource CardStyle}">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
        </Grid.RowDefinitions>
        
        <!-- Header -->
        <Grid Grid.Row="0" Margin="0,0,0,10">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="Auto"/>
            </Grid.ColumnDefinitions>
            
            <TextBlock Grid.Column="0"
                       Text="Análise #3504"
                       Style="{StaticResource SectionHeaderStyle}"/>
            
            <Border Grid.Column="1"
                    Style="{StaticResource StatusBadgeStyle}"
                    Background="{StaticResource SuccessColor}">
                <TextBlock Text="Concluído" FontSize="10"/>
            </Border>
        </Grid>
        
        <!-- Metadata -->
        <StackPanel Grid.Row="1" Margin="0,0,0,15">
            <TextBlock Text="{Binding CreatedAt, StringFormat='dd/MM/yyyy HH:mm'}"
                       FontSize="{StaticResource TinyFontSize}"
                       Foreground="{StaticResource TextMuted}"/>
            <TextBlock Text="{Binding PostUrl}"
                       FontSize="{StaticResource SmallFontSize}"
                       Foreground="{StaticResource AccentTextBrush}"
                       TextTrimming="CharacterEllipsis"/>
        </StackPanel>
        
        <!-- Metrics -->
        <ItemsControl Grid.Row="2"
                      ItemsSource="{Binding Metrics}">
            <ItemsControl.ItemTemplate>
                <DataTemplate>
                    <Grid Margin="0,3">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="100"/>
                            <ColumnDefinition Width="*"/>
                        </Grid.ColumnDefinitions>
                        
                        <TextBlock Grid.Column="0"
                                   Text="{Binding Label}"
                                   FontSize="{StaticResource SmallFontSize}"
                                   Foreground="{StaticResource SecondaryTextBrush}"/>
                        
                        <TextBlock Grid.Column="1"
                                   Text="{Binding Value}"
                                   FontFamily="{StaticResource MonospaceFontFamily}"
                                   FontSize="{StaticResource SmallFontSize}"
                                   Foreground="{StaticResource PrimaryTextBrush}"
                                   HorizontalAlignment="Right"/>
                    </Grid>
                </DataTemplate>
            </ItemsControl.ItemTemplate>
        </ItemsControl>
    </Grid>
</Border>
```

---

## Checklist de Implementação

Ao criar uma nova View:

### ✅ Estrutura
- [ ] UserControl com DataContext tipado
- [ ] Resources locais quando necessário
- [ ] Grid como root element com definições claras

### ✅ Cores e Estilos
- [ ] Usa cores de `Phase1Resources.xaml`
- [ ] Usa estilos globais (`ModernButtonStyle`, etc.)
- [ ] StaticResource preferido sobre DynamicResource
- [ ] BorderBrush e Background consistentes

### ✅ Tipografia
- [ ] Tamanhos de fonte corretos
- [ ] FontWeight apropriado (Bold para headers)
- [ ] Consolas para valores numéricos

### ✅ Espaçamento
- [ ] Margins e Paddings padronizados
- [ ] CornerRadius consistente
- [ ] Grid/StackPanel spacing lógico

### ✅ Ícones
- [ ] FluentIcons usado (não emojis em code-behind)
- [ ] Tooltips em ícones sem texto
- [ ] Tamanho e cor apropriados

### ✅ Interatividade
- [ ] Hover states implementados
- [ ] Disabled states visíveis
- [ ] Loading states com animação
- [ ] Error handling visual

### ✅ Performance
- [ ] VirtualizingStackPanel em listas grandes
- [ ] Bindings otimizados (Mode explícito)
- [ ] Animações suaves (< 0.5s)

---

**Última atualização:** 13/10/2025  
**Versão:** 1.0  
**Mantenedor:** Equipe InfluenciAI