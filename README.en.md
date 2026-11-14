![DeepSeek Chat: switch between web chat and your workspace](<docs/images/readme-cover.png>)

<h1 align="center">DeepSeek Chat</h1>

<p align="center"><strong>Switch between the DeepSeek website and your workspace inside DeepSeek Harness.</strong></p>

<p align="center"><a href="README.md">简体中文</a> · <strong>English</strong></p>

---

DeepSeek Chat is a **DSH Desktop plugin**: choose **CHAT** to use the real [DeepSeek Chat website](https://chat.deepseek.com/) inside DSH, and **HARNESS** to return to your previous workspace. The website keeps its own sign-in; the plugin never reuses your DSH account.

Current release **0.2.29** · Built for **DSH Desktop** · The website follows DSH language, appearance and text size.

## Highlights

- **One-click CHAT / HARNESS switching** next to the brand mark, with the website's conversations, pins and date groups in the sidebar.
- **Shortcut switching**: `Tab` toggles between modes by default; two custom bindings are supported.
- **Website caching**: keep, delay-release or release immediately, trading switch speed against Developer Tools (F12).
- **Attachment downloads**: code blocks, images and common attachments can be saved locally; external links open in your browser.
- **Native look**: language, theme and text size follow DSH.

## Getting the most out of it

The plugin is designed for a **"discuss first, build second"** workflow:

1. Switch to **CHAT** and settle the plan in the website chat (this does not spend Harness tokens).
2. Copy the conclusion, or share the conversation link.
3. Switch back to **HARNESS** with the shortcut.
4. Paste the conclusion to your agent so it builds exactly what was agreed.

Why this helps:

- **Fewer tokens**: planning happens in the website chat, outside the Harness context.
- **Smaller context**: only the agreed conclusion reaches the agent, not the whole discussion.
- **More precise**: the agent starts from a settled plan instead of dozens of trials.

Two typical cases:

- **Requirement shaping**: break down requirements and compare options in CHAT, then implement in HARNESS.
- **Debugging**: paste the error into CHAT to understand the cause, then hand the conclusion back to HARNESS.

## Quick start

1. Install the plugin (see *Install*), then **fully quit and reopen DSH**.
2. Switch to **CHAT**, click **Sign in to DeepSeek**, and sign in on the embedded website page.
3. The account and conversation list sync automatically; **Settings → Chat settings** shows the account and preferences.
4. Switch to **HARNESS** whenever you need your previous panels back.

## Install

### From npm (current release)

Enter in the DSH plugin installer:

```text
dsh-deepseek-chat@0.2.29
```

Or use the CLI:

```bash
dsh plugin --profile desktop add dsh-deepseek-chat@0.2.29
```

### From GitHub

```text
https://github.com/xingxingbk-git/dsh-deepseek-chat
```

```bash
dsh plugin --profile desktop add https://github.com/xingxingbk-git/dsh-deepseek-chat
```

Requires Git on the machine; on Windows install [Git for Windows](https://git-scm.com/install/windows) and reopen DSH.

### From a local package

```bash
dsh plugin --profile desktop add /absolute/path/dsh-deepseek-chat-0.2.29.tgz
```

**Fully quit and reopen DSH** after installing or updating. Replace `desktop` with your profile name when using another profile.

## Features

### CHAT and HARNESS

![CHAT mode: DSH sidebar with the DeepSeek website chat](<docs/images/chat-overview.png>)

- Browse, search and open website conversations in the DSH sidebar; start a chat with the top *New chat* control.
- The conversation menu supports rename, pin, share and delete; the refresh icon reloads the page and list.
- Returning to HARNESS restores your previous panels; going back to CHAT returns to the page you were on (subject to the cache policy).

### Website sign-in

CHAT uses the website's own sign-in flow; the plugin never reads passwords or cookies. Third-party sign-in (Google, Apple, WeChat, enterprise SSO, ...) shows the provider's official page inside CHAT and returns to DeepSeek chat automatically; ordinary account/password sign-in keeps working. Login memory stores only the minimum grant information and is isolated per DSH profile.

> Known issue: a reported occasional blank page or error after ordinary account/password sign-in has not been reproduced and its cause is unknown. If it happens, retry or use another sign-in method and report the OS and DSH version.

### Mode switcher

![Text style CHAT and HARNESS switcher](<docs/images/mode-switch-text.webp>)

**Settings → Chat settings → Switch buttons** offers text and icon styles. In text style both labels are editable (up to 10 columns; full-width characters count as two) and applied after **Save**; narrow sidebars truncate them with a tooltip.

### Shortcuts

**Settings → Chat settings → Shortcuts**:

- The switch is on by default; enabling it shows the left and right capture fields plus a Save button; changes apply after Save.
- Both default to `Tab`, which toggles between modes. When they are different, the left field switches to CHAT and the right field switches to HARNESS.
- Combinations are supported (e.g. `Ctrl+Shift+X`; the Meta key is shown as `Cmd` on macOS); focus a field and press the keys, `Esc` cancels and `Backspace` clears. An emptied field shows an in-field hint and Save stays disabled.
- Two identical bindings are intentional: pressing once toggles once, not a conflict.
- Shortcuts fire whenever the DSH window is focused, including while a **HARNESS text field** or the **CHAT website composer** is focused; the plugin takes priority over the field or page. The only exception is the settings field that records a new binding. If a key collides with the IME or the page, record another combination in settings.
- If a captured combination is reserved by the system or browser, the field warns about the conflict and does not store it.
- The `?` next to the title explains the scope.

### Cache policy

**Settings → Chat settings → Cache policy**:

| Policy | Returning to CHAT | Developer Tools (F12) |
| --- | --- | --- |
| Keep cached (default) | No reload | Unavailable while cached |
| Release immediately | Reloads | Available in HARNESS |
| Release after delay | Reload-free for N seconds | Available after release |

The delay accepts 5–3600 seconds.

### Downloads and links

- Code-block *Download*, Mermaid SVG/PNG/source exports, images and common attachments (PDF, Office, archives, media) save locally, up to 16 MB per file.
- External links open in your default browser; failures show a non-blocking notice.
- Right-click *Save as*, file uploads inside the website and microphone access remain limited by the DSH host.
- Attachment saving depends on the DSH file-save capability; on older DSH versions attachments may fail with a notice while everything else keeps working.

## Limitations

- **DSH Desktop only**; see *Compatibility*. DSH Web is not supported.
- Shortcuts fire whenever the DSH window is focused (including text fields) but cannot be registered system-wide; OS-level combinations (such as Cmd+Tab on macOS) cannot be intercepted, so pick another binding. Using `Tab` takes over Tab inside fields and the page (focus navigation/indentation) — change it if that collides.
- F12 is unavailable while the page is cached; choose immediate or delayed release to use it.
- Downloads only cover user-clicked common formats up to 16 MB; right-click saves, iframe downloads and programmatic downloads are not handled.
- File-picker and microphone permissions are owned by the DSH host.
- Sidebar branding and *New chat* adaptation rely on the official shell; other sidebar UI plugins may trigger compatibility mode (restorable from Chat settings).
- Website layout changes can affect account or conversation recognition; the UI shows a status or compatibility notice and offers retries.
- The plugin never reads chat bodies, cookies, passwords or DSH tokens; see *Privacy*.

## Privacy and data

DeepSeek's website handles chats and account history. To show the account and navigation, the plugin reads visible account names, conversation titles, groups and links, kept in memory only while signed in.

Login memory stores only the minimum needed for website authorization, managed by the official DSH credentials service and isolated per profile. Signing out clears it.

The plugin never stores passwords, cookies or message bodies, never reads tokens of DSH or other plugins, and never accesses other browsers' sign-in data.

## Compatibility

Works with the latest **DSH Desktop 0.2.2 release line** (RCs and stable releases). DSH 0.2.3+ requires re-adaptation.

## Uninstall

Remove the plugin from the DSH plugin manager, or run:

```bash
dsh plugin --profile desktop remove dsh-deepseek-chat
```
