import { useState } from 'react'
import { Icon, type IconName } from './components/Icon'
import { SosDemo } from './components/SosDemo'
import logo from './assets/figma/logo-seniorinsight.png'
import illustration from './assets/figma/ilustracao-cuidado.png'
import elderScreen from './assets/figma/tela-modo-idoso-sos.png'
import familyScreen from './assets/figma/tela-painel-familiar.png'
import './App.css'

const navLinks = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#dois-modos', label: 'Dois modos' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#sos', label: 'SOS' },
  { href: '#duvidas', label: 'Dúvidas' },
]

const features: { icon: IconName; tone: string; title: string; text: string }[] = [
  {
    icon: 'pill',
    tone: 'green',
    title: 'Rotina de medicamentos',
    text: 'Cadastre remédio, dose e horários. O idoso recebe o lembrete na hora certa e confirma com um toque em “Já tomei”.',
  },
  {
    icon: 'siren',
    tone: 'coral',
    title: 'Botão SOS',
    text: 'Um botão grande, fácil de achar. Segurando por 3 segundos, a família é avisada na hora, com a localização.',
  },
  {
    icon: 'users',
    tone: 'blue',
    title: 'Rede familiar de apoio',
    text: 'Convide filhos, netos e cuidadores. Todos acompanham o mesmo painel e ninguém fica sem saber o que aconteceu.',
  },
  {
    icon: 'clipboard',
    tone: 'purple',
    title: 'Perfil e comorbidades',
    text: 'Condições de saúde, contatos de emergência e informações importantes reunidas em um só lugar.',
  },
  {
    icon: 'watch',
    tone: 'teal',
    title: 'Wearables conectados',
    text: 'Batimentos, passos e outros sinais vindos de relógios e pulseiras inteligentes entram direto no painel.',
  },
  {
    icon: 'sparkles',
    tone: 'amber',
    title: 'Insights com IA',
    text: 'A inteligência artificial resume a rotina e aponta mudanças de padrão antes que virem um problema.',
  },
]

const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'heart',
    title: 'O familiar cria a conta',
    text: 'Você se cadastra, adiciona o perfil do idoso, os remédios e os contatos de emergência.',
  },
  {
    icon: 'qr',
    title: 'O idoso entra sem senha',
    text: 'Gere um código ou QR de pareamento. O idoso aponta a câmera e pronto: nada de decorar senha.',
  },
  {
    icon: 'activity',
    title: 'Todos acompanham juntos',
    text: 'Lembretes, confirmações e alertas chegam para a rede familiar em tempo real.',
  },
]

const faqs = [
  {
    q: 'O idoso precisa saber mexer bem no celular?',
    a: 'Não. O Modo Idoso tem botões grandes, poucas opções por tela e entra por código de pareamento, sem senha. Quem configura tudo é o familiar.',
  },
  {
    q: 'Quantas pessoas da família podem acompanhar?',
    a: 'A rede familiar aceita vários membros por convite. Cada um vê o painel e recebe os alertas de SOS.',
  },
  {
    q: 'E se o idoso apertar o SOS sem querer?',
    a: 'O alerta só dispara depois de segurar o botão por 3 segundos, o que evita a maioria dos toques acidentais.',
  },
  {
    q: 'Meus dados de saúde ficam seguros?',
    a: 'O acesso usa autenticação forte com verificação em duas etapas, e os dados são tratados conforme a LGPD, visíveis só para quem faz parte da rede.',
  },
  {
    q: 'Quando o app fica disponível?',
    a: 'O SeniorInsight está em desenvolvimento. O MVP traz contas, pareamento do idoso, comorbidades, rede familiar, rotina de remédios e o botão SOS.',
  },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="page">
      <header className="nav">
        <div className="container nav__inner">
          <a href="#topo" className="nav__brand" aria-label="SeniorInsight, início">
            <img src={logo} alt="SeniorInsight" width={114} height={24} />
          </a>
          <nav className={`nav__links ${menuOpen ? 'is-open' : ''}`} aria-label="Principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <a href="#comecar" className="btn btn--navy btn--small" onClick={() => setMenuOpen(false)}>
              Quero conhecer
            </a>
          </nav>
          <button
            type="button"
            className="nav__toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </header>

      <main id="topo">
        <section className="hero">
          <div className="blob blob--coral" aria-hidden="true" />
          <div className="blob blob--blue" aria-hidden="true" />
          <div className="container hero__grid">
            <div className="hero__copy">
              <span className="pill-badge">
                <span className="dot" /> Cuidado &amp; Conexão Familiar
              </span>
              <h1>
                Cuidando de quem você ama, <span className="accent">a cada segundo</span>
              </h1>
              <p className="lead">
                O SeniorInsight une a rotina de remédios, alertas SOS inteligentes e uma rede
                familiar conectada em um só app, para que o idoso viva com autonomia e a família
                durma tranquila.
              </p>
              <div className="hero__actions">
                <a href="#comecar" className="btn btn--coral">
                  Começar agora <Icon name="arrow" size={18} />
                </a>
                <a href="#como-funciona" className="btn btn--ghost">
                  Ver como funciona
                </a>
              </div>
              <ul className="micro-pills">
                <li className="micro-pill micro-pill--green">
                  <Icon name="check" size={14} /> Remédios no horário
                </li>
                <li className="micro-pill micro-pill--coral">
                  <Icon name="siren" size={14} /> SOS em 1 toque
                </li>
                <li className="micro-pill micro-pill--blue">
                  <Icon name="users" size={14} /> Família conectada
                </li>
              </ul>
            </div>

            <div className="hero__visual">
              <div className="clay-card">
                <img
                  src={illustration}
                  alt="Ilustração de uma senhora e sua neta de mãos dadas, com um coração pulsando entre elas"
                  width={254}
                  height={254}
                />
              </div>
              <figure className="phone phone--hero">
                <img src={familyScreen} alt="Tela do Painel de Monitoramento Familiar no app" />
              </figure>
              <div className="float-chip float-chip--top">
                <span className="float-chip__icon float-chip__icon--green">
                  <Icon name="check" size={16} />
                </span>
                <span>
                  <strong>Losartana tomada</strong>
                  <small>Dona Maria · 10:02</small>
                </span>
              </div>
              <div className="float-chip float-chip--bottom">
                <span className="float-chip__icon float-chip__icon--coral">
                  <Icon name="heart" size={16} />
                </span>
                <span>
                  <strong>74 bpm</strong>
                  <small>Estável &amp; seguro</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="context">
          <div className="container context__grid">
            <div className="stat">
              <strong>32 mi</strong>
              <span>de brasileiros têm 60 anos ou mais (Censo IBGE 2022)</span>
            </div>
            <div className="stat">
              <strong>1 app</strong>
              <span>para remédios, emergências e família, sem planilha nem grupo de mensagens</span>
            </div>
            <div className="stat">
              <strong>3 s</strong>
              <span>segurando o SOS para avisar toda a rede, com a localização do idoso</span>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="section">
          <div className="container">
            <header className="section__head">
              <span className="eyebrow">Como funciona</span>
              <h2>Pronto para usar em três passos</h2>
              <p>Quem configura é a família. O idoso só precisa abrir o app.</p>
            </header>
            <ol className="steps">
              {steps.map((step, index) => (
                <li key={step.title} className="step">
                  <span className="step__number">{index + 1}</span>
                  <span className="step__icon">
                    <Icon name={step.icon} size={24} />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="dois-modos" className="section section--tinted">
          <div className="container">
            <header className="section__head">
              <span className="eyebrow">Um app, dois olhares</span>
              <h2>Simples para o idoso, completo para a família</h2>
            </header>

            <div className="mode">
              <figure className="phone phone--scroll">
                <img src={elderScreen} alt="Tela do Modo Idoso com lembrete de remédio e botão SOS" />
              </figure>
              <div className="mode__copy">
                <span className="tag tag--coral">Modo Idoso</span>
                <h3>Letras grandes, poucos toques e nenhuma senha</h3>
                <p>
                  A tela mostra só o que importa agora: o próximo remédio, um botão verde para
                  confirmar e o SOS sempre à vista.
                </p>
                <ul className="checklist">
                  <li><Icon name="check" size={18} /> “Hora do remédio” com dose e instruções</li>
                  <li><Icon name="check" size={18} /> Confirmação em um toque: “Já tomei”</li>
                  <li><Icon name="check" size={18} /> Botão SOS que avisa a família e mostra quem foi avisado</li>
                </ul>
              </div>
            </div>

            <div className="mode mode--reverse">
              <figure className="phone phone--scroll">
                <img src={familyScreen} alt="Tela do Painel de Monitoramento Familiar com semáforo do bem-estar e localização" />
              </figure>
              <div className="mode__copy">
                <span className="tag tag--blue">Painel Familiar</span>
                <h3>Tudo o que você precisa saber, num relance</h3>
                <p>
                  O semáforo do bem-estar resume como o idoso está. Abaixo, os sinais dos
                  wearables, o último remédio tomado e onde ele está.
                </p>
                <ul className="checklist">
                  <li><Icon name="check" size={18} /> Semáforo do bem-estar em tempo real</li>
                  <li><Icon name="check" size={18} /> Batimentos, passos e glicemia</li>
                  <li><Icon name="check" size={18} /> Comando de resgate para coordenar a família</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="section">
          <div className="container">
            <header className="section__head">
              <span className="eyebrow">Recursos</span>
              <h2>Feito para o dia a dia do cuidado</h2>
            </header>
            <div className="features">
              {features.map((feature) => (
                <article key={feature.title} className="feature">
                  <span className={`feature__icon feature__icon--${feature.tone}`}>
                    <Icon name={feature.icon} size={24} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sos" className="section section--sos">
          <div className="container sos">
            <div className="sos__copy">
              <span className="eyebrow eyebrow--light">Experimente agora</span>
              <h2>Sinta como funciona o botão SOS</h2>
              <p>
                No app, o SOS fica sempre visível na tela do idoso. Pressione e segure o botão ao
                lado para ver o que a família recebe. É só uma simulação, nenhum alerta é enviado.
              </p>
            </div>
            <SosDemo />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="trust">
              <span className="trust__icon">
                <Icon name="shield" size={32} />
              </span>
              <div>
                <h2>Privacidade levada a sério</h2>
                <p>
                  Dados de saúde são sensíveis. Por isso o SeniorInsight usa login seguro com
                  verificação em duas etapas, acesso só para quem a família convidou e tratamento
                  de dados de acordo com a LGPD.
                </p>
              </div>
              <ul className="trust__list">
                <li><Icon name="lock" size={18} /> Autenticação em duas etapas</li>
                <li><Icon name="users" size={18} /> Acesso por convite</li>
                <li><Icon name="shield" size={18} /> Em conformidade com a LGPD</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="duvidas" className="section section--tinted">
          <div className="container container--narrow">
            <header className="section__head">
              <span className="eyebrow">Dúvidas</span>
              <h2>Perguntas frequentes</h2>
            </header>
            <div className="faq">
              {faqs.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="comecar" className="section">
          <div className="container">
            <div className="cta">
              <div className="cta__copy">
                <h2>Mais tranquilidade para quem cuida, mais autonomia para quem é cuidado</h2>
                <p>O SeniorInsight está chegando ao iOS e Android.</p>
              </div>
              <div className="cta__stores">
                <span className="store">
                  <Icon name="phone" size={20} />
                  <span><small>Em breve na</small>App Store</span>
                </span>
                <span className="store">
                  <Icon name="phone" size={20} />
                  <span><small>Em breve no</small>Google Play</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <img src={logo} alt="SeniorInsight" width={114} height={24} />
          <p>© {new Date().getFullYear()} SeniorInsight. Cuidado &amp; conexão familiar.</p>
          <a href="https://github.com/SeniorInsight-Project" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
