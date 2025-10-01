# Configurazione Email Template Supabase

## Accesso ai metadati utente nel template email

Con le modifiche al codice di registrazione, ora i metadati dell'utente includono:
- `company_token`: Il token della società
- `company_name`: Il nome completo della società
- `full_name`: Nome completo dell'utente
- `username`: Username dell'utente
- `role`: Ruolo dell'utente

## Template Email per Conferma Account

Vai su **Supabase Dashboard > Authentication > Email Templates > Confirm signup**

### Template HTML consigliato:

```html
<h2>Conferma il tuo account</h2>

<p>Ciao {{ .UserMetaData.full_name | default .Email }},</p>

<p>Grazie per esserti registrato! Clicca sul link sottostante per confermare il tuo account:</p>

<p><a href="{{ .ConfirmationURL }}">Conferma Account</a></p>

<div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px;">
  <h3>Dettagli Società</h3>
  <p><strong>Nome Società:</strong> {{ .UserMetaData.company_name }}</p>
  <p><strong>Token Società:</strong> <code style="background-color: #e9ecef; padding: 2px 4px; border-radius: 3px;">{{ .UserMetaData.company_token }}</code></p>
  <p><strong>Ruolo:</strong> {{ .UserMetaData.role | title }}</p>
</div>

<p>Se non hai richiesto questa registrazione, puoi ignorare questa email.</p>

<hr>
<p style="font-size: 12px; color: #666;">
  Questo link scadrà in 24 ore per motivi di sicurezza.
</p>
```

### Template Testo consigliato:

```text
Conferma il tuo account

Ciao {{ .UserMetaData.full_name | default .Email }},

Grazie per esserti registrato! Visita il link sottostante per confermare il tuo account:

{{ .ConfirmationURL }}

Dettagli Società:
- Nome Società: {{ .UserMetaData.company_name }}
- Token Società: {{ .UserMetaData.company_token }}
- Ruolo: {{ .UserMetaData.role }}

Se non hai richiesto questa registrazione, puoi ignorare questa email.

Questo link scadrà in 24 ore per motivi di sicurezza.
```

## Variabili disponibili nei template Supabase:

- `{{ .Email }}` - Email dell'utente
- `{{ .ConfirmationURL }}` - URL di conferma
- `{{ .UserMetaData.NOME_CAMPO }}` - Metadati personalizzati dell'utente
- `{{ .SiteURL }}` - URL del sito configurato

## Filtri utilizzabili:

- `| default "valore"` - Valore di fallback
- `| title` - Prima lettera maiuscola
- `| upper` - Tutto maiuscolo
- `| lower` - Tutto minuscolo

## Note:

1. I metadati sono disponibili solo dopo la registrazione
2. Il template usa la sintassi Go template
3. Testa sempre il template prima di pubblicarlo
4. Personalizza i colori e stili secondo il tuo brand