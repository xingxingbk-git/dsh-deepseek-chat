import { websiteCommandScript } from '../../src/website-navigation.ts'

// Redacted public DOM from a real password-login failure: the account avatar
// is a div containing one initial, not an img. No site state or credentials.
window.fixtureDone = (async () => {
  const results = []
  const check = (name, value) => { results.push({name, passed: !!value}); if (!value) throw new Error(name) }
  const frame = document.createElement('iframe')
  frame.style.cssText = 'width:1024px;height:780px;border:0'
  document.body.append(frame)
  const doc = frame.contentDocument
  const initial = '<div class="ede5bc47 avatar">F</div>'
  const picture = '<img class="avatar" width="32" height="32" alt="Fictional avatar">'
  const row = avatar => `<div class="_2afd28d profile" tabindex="0">${avatar}<div class="_9d8da05 nickname">Fixture account</div><div class="ds-icon more"><svg width="16" height="16"><path d="M1 1L8 8"/></svg></div><div class="ds-focus-ring"></div></div>`
  const setup = (avatar = initial) => {
    doc.open(); doc.write(`<!doctype html><html><head><style>
      body{margin:0;font:14px Arial}.layout{display:flex;height:780px}
      aside{position:relative;flex:none;width:261px;height:780px} main{flex:1;min-width:0}
      .footer{position:absolute;bottom:0;left:12px;width:236px;height:64px}
      .profile{position:relative;display:flex;align-items:center;gap:8px;width:236px;height:44px;margin-top:10px}
      .avatar{display:flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;margin-left:6px}
      .nickname{flex:1;min-width:0}.more{width:16px;height:16px;margin-right:10px}
      .ds-focus-ring{position:absolute;inset:0;pointer-events:none}textarea{margin:150px 20px;width:500px;height:60px}
    </style></head><body><div class="layout"><aside><button>开启新对话</button><div class="footer">${row(avatar)}</div></aside><main><textarea aria-label="Fictional composer"></textarea></main></div></body></html>`); doc.close()
    doc.documentElement.setAttribute('data-dsh-chat-observing', '')
    doc.documentElement.setAttribute('data-dsh-chat-theme-complete', 'dark')
    doc.documentElement.setAttribute('data-dsh-chat-settings-theme-target', 'dark')
    doc.documentElement.setAttribute('data-dsh-chat-native-collapse-attempt', 'true')
  }
  const run = (command = {type:'snapshot',showOriginal:false}, pathname = '/') => frame.contentWindow.eval(`(()=>{const location={origin:'https://chat.deepseek.com',pathname:${JSON.stringify(pathname)}};return ${websiteCommandScript(command)}})()`)
  setup(picture)
  check('existing image avatar still authenticates', run().authenticated === true)
  setup()
  let state = run()
  check('text avatar password-login footer authenticates', state.authenticated === true && state.accountName === 'Fixture account')
  check('text avatar presents the chat instead of concealing it', state.desktopReady === true && !doc.documentElement.hasAttribute('data-dsh-chat-preparing') && getComputedStyle(doc.body).opacity !== '0')
  check('avatar initial is not included in the account name', state.accountName === 'Fixture account')
  check('text avatar proof survives the hidden sidebar', run().authenticated === true && getComputedStyle(doc.querySelector('aside')).display === 'none')
  let clicks = 0
  doc.querySelector('.profile').onclick = () => clicks++
  doc.documentElement.removeAttribute('data-dsh-chat-theme-complete')
  run()
  check('appearance sync opens the verified text-avatar account menu', clicks === 1)
  run()
  check('waiting for the account menu does not click it repeatedly', clicks === 1)
  run({type:'logout'})
  check('logout can open the same text-avatar account menu', clicks === 2)

  for (const [label, change] of [
    ['missing nickname', () => doc.querySelector('.nickname').remove()],
    ['extra text in the footer row', () => doc.querySelector('.profile').append('Extra action')],
    ['non-focusable text footer', () => doc.querySelector('.profile').removeAttribute('tabindex')],
    ['multi-character footer label', () => {doc.querySelector('.avatar').textContent='Settings'}],
    ['non-initial symbol', () => {doc.querySelector('.avatar').textContent='?'}],
    ['avatar with nested content', () => {doc.querySelector('.avatar').innerHTML='<span>F</span>'}],
    ['missing menu glyph', () => doc.querySelector('.more').remove()],
    ['extra image', () => doc.querySelector('.profile').insertAdjacentHTML('beforeend', picture)],
    ['linked account row', () => doc.querySelector('.profile').insertAdjacentHTML('beforeend', '<a href="/help">Help</a>')],
    ['editable footer row', () => doc.querySelector('.profile').insertAdjacentHTML('beforeend', '<input>')],
    ['account-shaped row inside a menu', () => doc.querySelector('.footer').setAttribute('role','menu')],
    ['initial outside the footer', () => {doc.querySelector('.footer').style.top='80px'}],
    ['oversized initial', () => {doc.querySelector('.avatar').style.width='90px'}],
    ['non-square initial', () => {doc.querySelector('.avatar').style.width='12px'}],
  ]) {
    setup(); change()
    check(`rejects ${label}`, run().authenticated !== true)
  }
  for (const letter of ['中', '7', '𐐀']) {
    setup();doc.querySelector('.avatar').textContent=letter
    check(`accepts one Unicode letter or number ${letter}`, run().authenticated === true)
  }
  setup(); run()
  doc.querySelector('.nickname').remove()
  check('cached text-avatar proof is revoked when the nickname disappears', run().authenticated !== true)
  setup(); run()
  doc.querySelector('.avatar').textContent='Settings'
  check('cached text-avatar proof is revoked when the avatar changes shape', run().authenticated !== true)
  setup(); run()
  check('sign-in route clears account proof', run(undefined, '/sign_in').authenticated === false && !doc.querySelector('[data-dsh-chat-profile-confirmed]'))
  check('return from sign-in recognizes the same real account footer', run().authenticated === true)
  setup(''); run()
  doc.querySelector('.profile').insertAdjacentHTML('afterbegin', initial)
  check('a late text avatar is measured even after sidebar adaptation', run().authenticated === true)
  setup(); run(); run({type:'restore'})
  check('cleanup removes both text-avatar markers and sidebar hiding', !doc.querySelector('[data-dsh-chat-profile-avatar]') && getComputedStyle(doc.querySelector('aside')).display !== 'none')
  return results
})()
