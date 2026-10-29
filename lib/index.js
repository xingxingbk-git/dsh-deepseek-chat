var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name2, symbol) => (symbol = Symbol[name2]) ? symbol : Symbol.for("Symbol." + name2);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name2, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name: name2, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name2, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name2]() {
    return __privateGet(this, extra);
  }, set [name2](x) {
    return __privateSet(this, extra, x);
  } }, name2));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name2) : __name(target, name2);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name2, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name2 in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name2];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name2] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name2, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/preferences-schema.ts
import schema from "@deepseek-ai/schemastery";

// src/preferences.ts
var DEFAULT_SWITCH_PREFERENCES = Object.freeze({ switchStyle: "text", chatLabel: "CHAT", harnessLabel: "HARNESS" });
var SWITCH_LABEL_LIMIT = 10;
var SWITCH_LABEL_PATTERN = new RegExp("^(?![\\s\\S]*[\\p{Cc}\\p{Cf}\\p{Zl}\\p{Zp}])(?=.*\\S)(?:" + Array.from({ length: 6 }, (_, wide) => `(?=.{1,${SWITCH_LABEL_LIMIT - wide}}$)[\\x20-\\x7e]*(?:[^\\x00-\\x7f][\\x20-\\x7e]*){${wide}}`).join("|") + ")$", "u");

// src/preferences-schema.ts
var SwitchPreferencesConfig = schema.object({
  switchStyle: schema.union(["text", "icon"]).default("text").volatile(),
  chatLabel: schema.string().max(20).pattern(SWITCH_LABEL_PATTERN).default("CHAT").volatile(),
  harnessLabel: schema.string().max(20).pattern(SWITCH_LABEL_PATTERN).default("HARNESS").volatile()
});

// src/server.ts
import "@deepseek-ai/cordis";
import { createHash as createHash2 } from "node:crypto";
import { isAbsolute, resolve } from "node:path";
import { Remote, RemoteError, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";

// src/authorization.ts
import { randomUUID } from "node:crypto";
var WEBSITE_PROFILE_PREFIX = "chat-profile:";
var PROFILE_CONTEXT_UNAVAILABLE = "profile-context-unavailable";
var AuthorizationAuthority = class {
  constructor(profileId, issueEpoch = randomUUID) {
    this.issueEpoch = issueEpoch;
    const epoch = issueEpoch();
    this.state = {
      status: "authorized",
      accountId: profileId ?? `chat-volatile:${epoch}`,
      epoch,
      error: profileId === null ? PROFILE_CONTEXT_UNAVAILABLE : null
    };
  }
  state;
  listeners = /* @__PURE__ */ new Set();
  closed = false;
  getSnapshot() {
    return { ...this.state };
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  publish(next) {
    this.state = next;
    for (const listener of this.listeners) listener();
  }
  refresh(_metadata) {
    if (this.closed) return Promise.reject(new Error("CHAT session service is disposed."));
    return Promise.resolve(this.getSnapshot());
  }
  async *watch(_metadata, signal) {
    let dirty = true;
    let wake;
    const changed = () => {
      dirty = true;
      wake?.();
    };
    const unsubscribe = this.subscribe(changed);
    signal.addEventListener("abort", changed, { once: true });
    try {
      while (!signal.aborted && !this.closed) {
        if (dirty) {
          dirty = false;
          yield this.getSnapshot();
          continue;
        }
        await new Promise((resolve2) => {
          wake = resolve2;
          if (dirty || signal.aborted || this.closed) resolve2();
        });
      }
    } finally {
      unsubscribe();
      signal.removeEventListener("abort", changed);
    }
  }
  dispose() {
    if (this.closed) return;
    this.closed = true;
    this.publish({ status: "unauthorized", accountId: null, epoch: this.issueEpoch(), error: null });
    this.listeners.clear();
  }
};

// src/protocol.ts
import { z } from "zod";
var WEBSITE_SESSION_ORIGIN = "https://chat.deepseek.com";
var identifier = z.string().min(1).max(512);
var authorizationEpochSchema = identifier;
var clientMetadataSchema = z.strictObject({
  version: z.string().min(1).max(100),
  locale: z.string().min(1).max(100),
  timezoneOffsetSeconds: z.number().int().min(-86400).max(86400)
});
var authorizationSchema = z.strictObject({
  status: z.enum(["pending", "authorized", "unauthorized", "unavailable"]),
  accountId: identifier.nullable(),
  epoch: authorizationEpochSchema,
  error: z.string().max(100).nullable()
});
var websiteSessionSchema = z.strictObject({
  token: z.string().min(1).max(16384),
  userId: identifier,
  deviceId: z.string().uuid()
});
var strict = (name2, schema2) => ({
  mode: "strict",
  typeSymbol: `dsh-deepseek-chat#${name2}`,
  create: () => schema2
});
var metadataParameter = {
  name: "metadata",
  wire: "metadata",
  source: "json",
  codec: strict("DshChatClientMetadata", clientMetadataSchema)
};
var epochParameter = {
  name: "epoch",
  wire: "epoch",
  source: "json",
  codec: strict("AuthorizationEpoch", authorizationEpochSchema)
};
var descriptor = (method, stream = false) => ({
  id: `dsh-deepseek-chat#dshDeepseekChat/${method}`,
  service: "dshDeepseekChat",
  namespace: "dshDeepseekChat",
  method,
  invocation: { kind: "direct" },
  parameters: [metadataParameter],
  cancellation: { parameter: "signal" },
  result: strict("AuthorizationState", authorizationSchema),
  ...stream ? { mode: "stream" } : {}
});
var websiteDescriptor = (method, save = false) => ({
  id: `dsh-deepseek-chat#dshDeepseekChat/${method}`,
  service: "dshDeepseekChat",
  namespace: "dshDeepseekChat",
  method,
  invocation: { kind: "direct" },
  parameters: [metadataParameter, epochParameter, ...save ? [{
    name: "session",
    wire: "session",
    source: "json",
    codec: strict("WebsiteSession", websiteSessionSchema)
  }] : []],
  cancellation: { parameter: "signal" },
  result: method === "loadWebsiteSession" ? strict("OptionalWebsiteSession", websiteSessionSchema.nullable()) : strict("WebsiteSessionOperationResult", z.boolean())
});
var DSH_CHAT_DESCRIPTORS = [
  descriptor("authorization"),
  descriptor("watchAuthorization", true),
  websiteDescriptor("loadWebsiteSession"),
  websiteDescriptor("saveWebsiteSession", true),
  websiteDescriptor("clearWebsiteSession")
];
var DSH_CHAT_HOST_CONTRIBUTION = {
  package: "dsh-deepseek-chat",
  face: "host",
  schemas: [],
  // Website credentials are never model-callable services or objects.
  model: { services: [], events: [], objects: [] },
  invocations: DSH_CHAT_DESCRIPTORS
};

// src/website-session-store.ts
import { createHash } from "node:crypto";
import { credentialKey } from "@deepseek-ai/dsh-credentials";
import { z as z2 } from "zod";
var grantSchema = z2.strictObject({
  version: z2.literal(2),
  origin: z2.literal(WEBSITE_SESSION_ORIGIN),
  profileId: z2.string().regex(/^chat-profile:[a-f0-9]{64}$/),
  websiteAccountId: z2.string().min(1).max(512).nullable(),
  session: websiteSessionSchema.nullable()
});
var legacyGrantSchema = z2.strictObject({
  version: z2.literal(1),
  origin: z2.literal(WEBSITE_SESSION_ORIGIN),
  fencedDSHaccountId: z2.string().min(1).max(512),
  session: websiteSessionSchema
});
var WebsiteSessionStore = class {
  constructor(credentials, authority, profileId, legacyIdentity) {
    this.credentials = credentials;
    this.authority = authority;
    this.profileId = profileId;
    this.legacyIdentity = legacyIdentity;
    this.profileKey = profileId !== null && /^chat-profile:[a-f0-9]{64}$/.test(profileId) ? credentialKey("dsh-deepseek-chat", `website-${profileId.slice(WEBSITE_PROFILE_PREFIX.length)}`) : null;
  }
  profileKey;
  pending = Promise.resolve();
  writeRevision = 0;
  clearing = false;
  legacyAttempted = false;
  /** Capture before the controller awaits its fence, so an already-issued RPC stays fenced. */
  captureRevision() {
    return this.writeRevision;
  }
  current(fence, signal) {
    const state = this.authority.getSnapshot();
    return !signal.aborted && state.status === "authorized" && state.error === (this.profileKey === null ? PROFILE_CONTEXT_UNAVAILABLE : null) && (this.profileKey === null || fence.accountId === this.profileId) && state.accountId === fence.accountId && state.epoch === fence.epoch;
  }
  unchanged(fence, signal, revision) {
    return !this.clearing && revision === this.writeRevision && this.current(fence, signal);
  }
  sessionFromRecord(payload) {
    const grant = grantSchema.safeParse(payload);
    if (!grant.success || grant.data.profileId !== this.profileId || !grant.data.session || grant.data.session.userId !== grant.data.websiteAccountId) return null;
    return { ...grant.data.session };
  }
  payload(session) {
    return {
      version: 2,
      origin: WEBSITE_SESSION_ORIGIN,
      profileId: this.profileId,
      websiteAccountId: session?.userId ?? null,
      session
    };
  }
  /** Keep clearing and writes ordered; queued work checks its captured generation again. */
  async exclusive(operation) {
    const previous = this.pending;
    let release;
    this.pending = new Promise((resolve2) => {
      release = resolve2;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
  async migrateLegacy(fence, signal, revision, metadata) {
    const profileKey = this.profileKey;
    if (profileKey === null || this.legacyAttempted || !this.legacyIdentity) return null;
    this.legacyAttempted = true;
    const id = await this.legacyIdentity(metadata, signal);
    if (!id || id.length > 512 || !this.unchanged(fence, signal, revision)) return null;
    const digest = createHash("sha256").update(id, "utf8").digest("hex");
    const key = credentialKey("dsh-chat", `website-${digest}`);
    const previous = await this.credentials.readRecord(key);
    if (!this.unchanged(fence, signal, revision) || previous?.kind !== "grant") return null;
    const oldGrant = legacyGrantSchema.safeParse(previous.payload);
    if (!oldGrant.success || oldGrant.data.fencedDSHaccountId !== id) return null;
    let migrated = false;
    const written = await this.credentials.modifyRecord(profileKey, async (current) => {
      if (current !== void 0 || !this.unchanged(fence, signal, revision)) return void 0;
      migrated = true;
      return { kind: "grant", payload: this.payload(oldGrant.data.session) };
    });
    if (!this.unchanged(fence, signal, revision) || written?.kind !== "grant") return null;
    const session = this.sessionFromRecord(written.payload);
    if (migrated && session) {
      await this.credentials.deleteRecord(key).catch(() => void 0);
    }
    return this.unchanged(fence, signal, revision) ? session : null;
  }
  async load(fence, signal, metadata, revision = this.writeRevision) {
    const profileKey = this.profileKey;
    if (profileKey === null) return null;
    try {
      return await this.exclusive(async () => {
        if (!this.unchanged(fence, signal, revision)) return null;
        const record = await this.credentials.readRecord(profileKey);
        if (!this.unchanged(fence, signal, revision)) return null;
        if (record !== void 0) {
          return record.kind === "grant" ? this.sessionFromRecord(record.payload) : null;
        }
        return metadata ? this.migrateLegacy(fence, signal, revision, metadata) : null;
      });
    } catch {
      throw new Error("\u65E0\u6CD5\u8BFB\u53D6 CHAT \u767B\u5F55\u3002");
    }
  }
  async save(fence, session, signal, revision = this.writeRevision) {
    const profileKey = this.profileKey;
    if (profileKey === null) return false;
    const parsed = websiteSessionSchema.safeParse(session);
    if (!parsed.success || !this.unchanged(fence, signal, revision)) return false;
    try {
      return await this.exclusive(async () => {
        if (!this.unchanged(fence, signal, revision)) return false;
        let accepted = false;
        await this.credentials.modifyRecord(profileKey, async () => {
          if (!this.unchanged(fence, signal, revision)) return void 0;
          accepted = true;
          return { kind: "grant", payload: this.payload(parsed.data) };
        });
        return accepted && this.unchanged(fence, signal, revision);
      });
    } catch {
      throw new Error("\u65E0\u6CD5\u4FDD\u5B58 CHAT \u767B\u5F55\u3002");
    }
  }
  async clear(fence, signal) {
    const profileKey = this.profileKey;
    if (profileKey === null) return this.current(fence, signal);
    if (this.clearing || !this.current(fence, signal)) return false;
    this.clearing = true;
    this.writeRevision++;
    try {
      return await this.exclusive(async () => {
        if (!this.current(fence, signal)) return false;
        let cleared = false;
        await this.credentials.modifyRecord(profileKey, async () => {
          if (!this.current(fence, signal)) return void 0;
          cleared = true;
          return { kind: "grant", payload: this.payload(null) };
        });
        return cleared && this.current(fence, signal);
      });
    } catch {
      throw new Error("\u65E0\u6CD5\u6E05\u9664 CHAT \u767B\u5F55\u3002");
    } finally {
      this.clearing = false;
    }
  }
};

// src/server.ts
var _clearWebsiteSession_dec, _saveWebsiteSession_dec, _loadWebsiteSession_dec, _watchAuthorization_dec, _authorization_dec, _a, _init;
var DshChatController = class extends (_a = TypertRemoteService, _authorization_dec = [Remote], _watchAuthorization_dec = [Remote({ mode: "stream" })], _loadWebsiteSession_dec = [Remote], _saveWebsiteSession_dec = [Remote], _clearWebsiteSession_dec = [Remote], _a) {
  constructor(ctx) {
    super(ctx, "dshDeepseekChat");
    __runInitializers(_init, 5, this);
    __publicField(this, "authority");
    __publicField(this, "websiteSessions");
    __publicField(this, "legacyAccount");
    const profile = ctx.get("profileContext");
    const dir = profile !== null && typeof profile === "object" && "dir" in profile ? profile.dir : void 0;
    const profileId = typeof dir === "string" && dir.length <= 16384 && isAbsolute(dir) && !dir.includes("\0") ? `${WEBSITE_PROFILE_PREFIX}${createHash2("sha256").update(resolve(dir), "utf8").digest("hex")}` : null;
    this.authority = new AuthorizationAuthority(profileId);
    this.websiteSessions = new WebsiteSessionStore(
      ctx.credentials,
      this.authority,
      profileId,
      (metadata, signal) => this.legacyAccountId(metadata, signal)
    );
    ctx.typert.register(DSH_CHAT_HOST_CONTRIBUTION);
    ctx.inject(["deepseekAccount"], (child) => {
      const account = child.deepseekAccount;
      this.legacyAccount = account;
      child.effect(() => () => {
        if (this.legacyAccount === account) this.legacyAccount = void 0;
      });
    });
    ctx.effect(() => () => {
      this.authority.dispose();
    }, "dsh-deepseek-chat profile session lifetime");
  }
  async legacyAccountId(metadata, signal) {
    const account = this.legacyAccount;
    if (!account || signal.aborted) return null;
    let timer;
    let cancelled;
    try {
      return await Promise.race([
        (async () => {
          if ((await account.getState()).status !== "credential-stored" || signal.aborted) return null;
          const profile = await account.getProfile(metadata);
          return !signal.aborted && profile?.status === "ready" ? profile.value.id : null;
        })(),
        new Promise((resolve2) => {
          timer = setTimeout(() => resolve2(null), 1500);
        }),
        new Promise((resolve2) => {
          cancelled = () => resolve2(null);
          signal.addEventListener("abort", cancelled, { once: true });
          if (signal.aborted) cancelled();
        })
      ]);
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
      if (cancelled) signal.removeEventListener("abort", cancelled);
    }
  }
  async authorization(metadata, signal) {
    try {
      signal.throwIfAborted();
      const state = await this.authority.refresh(clientMetadataSchema.parse(metadata));
      signal.throwIfAborted();
      return state;
    } catch {
      throw new RemoteError("gateway/internal", "\u65E0\u6CD5\u8FDE\u63A5 CHAT \u767B\u5F55\u4FDD\u5B58\u670D\u52A1\uFF0C\u8BF7\u68C0\u67E5 DSH \u670D\u52A1\u3002", {});
    }
  }
  async *watchAuthorization(metadata, signal) {
    try {
      yield* this.authority.watch(clientMetadataSchema.parse(metadata), signal);
    } catch {
      throw new RemoteError("gateway/internal", "\u65E0\u6CD5\u8FDE\u63A5 CHAT \u767B\u5F55\u4FDD\u5B58\u670D\u52A1\uFF0C\u8BF7\u68C0\u67E5 DSH \u670D\u52A1\u3002", {});
    }
  }
  async websiteFence(metadata, epoch, signal) {
    signal.throwIfAborted();
    const expectedEpoch = authorizationEpochSchema.parse(epoch);
    const state = await this.authority.refresh(clientMetadataSchema.parse(metadata));
    signal.throwIfAborted();
    const current = this.authority.getSnapshot();
    if (state.status !== "authorized" || state.error !== null && state.error !== PROFILE_CONTEXT_UNAVAILABLE || !state.accountId || state.accountId.length > 512 || state.epoch !== expectedEpoch || current.status !== "authorized" || current.error !== state.error || current.accountId !== state.accountId || current.epoch !== expectedEpoch) return null;
    return { accountId: state.accountId, epoch: expectedEpoch };
  }
  async loadWebsiteSession(metadata, epoch, signal) {
    try {
      const revision = this.websiteSessions.captureRevision();
      const fence = await this.websiteFence(metadata, epoch, signal);
      return fence ? await this.websiteSessions.load(fence, signal, metadata, revision) : null;
    } catch {
      throw new RemoteError("gateway/internal", "\u65E0\u6CD5\u6062\u590D CHAT \u767B\u5F55\uFF0C\u8BF7\u91CD\u8BD5\u3002", {});
    }
  }
  async saveWebsiteSession(metadata, epoch, session, signal) {
    try {
      const revision = this.websiteSessions.captureRevision();
      const parsed = websiteSessionSchema.parse(session);
      const fence = await this.websiteFence(metadata, epoch, signal);
      return fence ? await this.websiteSessions.save(fence, parsed, signal, revision) : false;
    } catch {
      throw new RemoteError("gateway/internal", "\u65E0\u6CD5\u4FDD\u5B58 CHAT \u767B\u5F55\uFF0C\u8BF7\u91CD\u8BD5\u3002", {});
    }
  }
  async clearWebsiteSession(metadata, epoch, signal) {
    try {
      const fence = await this.websiteFence(metadata, epoch, signal);
      return fence ? await this.websiteSessions.clear(fence, signal) : false;
    } catch {
      throw new RemoteError("gateway/internal", "\u65E0\u6CD5\u6E05\u9664 CHAT \u767B\u5F55\uFF0C\u8BF7\u91CD\u8BD5\u3002", {});
    }
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "authorization", _authorization_dec, DshChatController);
__decorateElement(_init, 1, "watchAuthorization", _watchAuthorization_dec, DshChatController);
__decorateElement(_init, 1, "loadWebsiteSession", _loadWebsiteSession_dec, DshChatController);
__decorateElement(_init, 1, "saveWebsiteSession", _saveWebsiteSession_dec, DshChatController);
__decorateElement(_init, 1, "clearWebsiteSession", _clearWebsiteSession_dec, DshChatController);
__decoratorMetadata(_init, DshChatController);
__publicField(DshChatController, "inject", ["credentials", "typert"]);

// src/index.ts
var Config = SwitchPreferencesConfig;
var name = "dsh-deepseek-chat";
var inject = ["typert", "credentials"];
function apply(ctx) {
  new DshChatController(ctx);
  ctx.inject(["settings"], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });
}
export {
  Config,
  apply,
  inject,
  name
};
