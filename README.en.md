![DeepSeek Chat: switch between CHAT and HARNESS](<docs/images/readme-cover.png>)

<h1 align="center">DeepSeek Chat</h1>

<p align="center"><strong>Switch between DeepSeek web chat and your Harness workspace in one click.</strong></p>

<p align="center"><a href="README.md">简体中文</a> · <strong>English</strong></p>

---

DeepSeek Chat is a **DSH Desktop plugin**. Choose **CHAT** to use the real [DeepSeek Chat website](https://chat.deepseek.com/) inside DSH, or choose **HARNESS** to return to your original workspace.

Current version: **0.2.9** · Built for **DSH Desktop** · The CHAT website’s language, appearance and text size follow DSH.

## Features

### Use DeepSeek web chat inside DSH

![CHAT mode: the DSH sidebar alongside DeepSeek web chat](<docs/images/chat-overview.png>)

- Chat on the website inside DSH and browse loaded conversations, pinned chats and date groups in the sidebar.
- Search and open existing conversations, or start one with the top New Chat button.
- Use each conversation’s menu to rename, pin, share or delete it.
- Refresh the website page and conversation list using the icon beside Chats.
- Language, light/dark appearance and content text size follow DSH settings automatically.

### Switch back to HARNESS

![The CHAT and HARNESS switch beside the DeepSeek brand](<docs/images/mode-switch.png>)

Use the **CHAT / HARNESS** switch beside the DeepSeek brand at the top left. Returning to HARNESS restores the previous main panel; switching back to CHAT returns to the retained website page.

### Separate website sign-in and login memory

Open **Settings → Chat settings** to view your website account, check login memory or sign out. CHAT has its own website session, separate from other browsers and the DSH platform account.

After signing in normally, **Website login saved** confirms that the grant has been saved. The plugin attempts to restore it when you reopen the same DSH profile. An expired website grant still requires a new sign-in.

## Installation

### Install by package name (published release)

Enter this in the DSH plugin installer:

```text
dsh-deepseek-chat@0.2.9
```

Or use the CLI:

```bash
dsh plugin --profile desktop add dsh-deepseek-chat@0.2.9
```

Use the same method for a first installation or an update. If DSH’s release age policy temporarily blocks a newly published version, retry later.

### Install from GitHub

Paste this URL into the DSH plugin installer:

```text
https://github.com/xingxingbk-git/dsh-deepseek-chat
```

Or use the CLI:

```bash
dsh plugin --profile desktop add https://github.com/xingxingbk-git/dsh-deepseek-chat
```

This installs the version already pushed to the repository, with no manual build required. Git must be installed; on Windows, install [Git for Windows](https://git-scm.com/install/windows) if needed, then reopen DSH.

### Install a local package

Give the `.tgz` package to the DSH plugin manager, or run:

```bash
dsh plugin --profile desktop add /absolute/path/dsh-deepseek-chat-0.2.9.tgz
```

Replace the path with your package location.

**Fully quit and reopen DSH after installation or an update.** Replace `desktop` with the appropriate name when using another profile. See the [official DSH plugin installation documentation](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish) for more information.

## Getting started

1. Choose **CHAT**, click **Sign in to DeepSeek**, and sign in normally on the website inside the plugin.
2. Your account and conversation list update automatically. Check login memory in **Settings → Chat settings**.
3. Adjust language, appearance and text size in **DSH Settings → General**; CHAT follows automatically.
4. Switch to **HARNESS** whenever you need your original workspace. To sign out of the website, use **Chat settings**.

## Notes and limitations

- **Environment:** DSH Desktop is required. The compatibility range covers 0.2.0-rc.2 and the 0.2.1 release line starting at 0.2.1-rc.1. Versions 0.2.2 and above require adaptation. CHAT is not supported in DSH Web.
- **Conversation list:** The list and search cover only navigation content already loaded by the website. Website layout changes may affect account or list recognition; use the retry action shown in the interface.
- **Sign-in:** Login memory is specific to the same DSH profile. Expired or revoked grants, or changes to the website’s sign-in mechanism, may require signing in again. Permanent sign-in is not guaranteed.
- **Drafts and refresh:** Switching modes retains the website page, but preserve unsent text before refreshing, disabling, uninstalling or quitting DSH. The plugin does not separately back up drafts.
- **Shortcuts and website capabilities:** Existing Harness new-session shortcuts and menus still act on HARNESS. Use CHAT’s top New Chat button for website conversations. Downloads, device permissions and some popups are limited by DSH’s browser security policies.

## Privacy and data

DeepSeek’s website handles chats and account history. To display the account and navigation, the plugin reads visible account names, conversation titles, groups and links. Navigation information is kept only in memory during the current sign-in session.

Login memory contains only the minimum information needed for website authorization. It is managed through the official DSH credentials service and isolated by profile. Signing out clears the plugin’s saved login.

The plugin does not include passwords, cookies or message bodies in login memory, read tokens belonging to DSH or other plugins, or access other browsers’ sign-in data.

## Uninstall

Remove the plugin through the DSH plugin manager, or run:

```bash
dsh plugin --profile desktop remove dsh-deepseek-chat
```
