/**
 * Dados reais do Portfólio PS2 OS — Israel Ueda Massatoshi
 * Consolidado a partir do perfil GitHub (https://github.com/IsraelUeda)
 * e do currículo oficial de Suporte de TI / Desenvolvedor Júnior.
 */

export const PROFILE = {
  name: 'Israel Ueda',
  fullName: 'Israel Ueda Massatoshi',
  handle: 'ISRAEL-UEDA',
  role: 'Profissional de Suporte de TI / Desenvolvedor Júnior',
  location: 'Suzano - Jardim Vitória, SP',
  phone: '(11) 98405-9687',
  languages: 'Português: Nativo | Inglês: Técnico (Leitura de documentação)',
  availability: 'Disponível para Suporte de TI & Desenvolvedor Júnior',
  consoleModel: 'WINDOWS / ARCH LINUX • HYPRLAND',
  osVersion: 'Browser 1.20 • IsraelUeda OS',
  email: 'israelueda@gmail.com',
  github: 'https://github.com/IsraelUeda',
  linkedin: 'https://www.linkedin.com/in/israel-massatoshi/',
  website: 'https://israelueda.github.io/curriculo-em-p-gina-web/',
  bio: 'Formado em Ciência da Computação (Faculdade Anhanguera Marte, 2022–2026) com experiência prática em suporte técnico, manutenção preventiva e corretiva de computadores, redes locais (LAN) e atendimento a usuários. Também atuo em desenvolvimento back-end e infraestrutura com Python (FastAPI, Flask), C#, PostgreSQL/MySQL, Linux (Arch/Hyprland), Docker e Homelab.',
};

/**
 * Projetos reais de Israel Ueda Massatoshi exibidos como ícones 3D de Memory Card do PS2.
 * iconType disponíveis:
 *  'ps2-cube' | 'red-block' | 'synth-ring' | 'floppy-disk' |
 *  'voxel-cube' | 'visor-helmet' | 'save-cart' | 'cobalt-disc'
 */
export const PROJECTS = [
  {
    id: 'mercado-projeto',
    title: 'Sistema de Mercado',
    subtitle: 'API Vendas & Estoque',
    category: 'Back-End / FastAPI & SQL',
    sizeKB: 480,
    date: '2026/03/11',
    iconType: 'floppy-disk',
    accentColor: '#94a3b8',
    summary:
      'API robusta em Python (FastAPI) e PostgreSQL para gestão completa de vendas, estoque e carrinho de compras síncrono.',
    details:
      'Projeto pessoal de back-end desenvolvido com Python (FastAPI e POO) e banco de dados relacional PostgreSQL para garantir integridade dos dados. Implementa fluxos completos de vendas, controle de estoque e lógica síncrona de carrinho de compras de ponta a ponta.',
    highlights: [
      'API REST robusta em Python (FastAPI) para fluxos completos de vendas e controle de estoque',
      'Modelagem estruturada em banco relacional PostgreSQL garantindo integridade dos dados',
      'Lógica de negócios síncrona para carrinho de compras de ponta a ponta com versionamento Git/GitHub',
    ],
    tech: ['Python', 'FastAPI', 'REST API', 'PostgreSQL', 'Git', 'GitHub'],
    demoUrl: '',
    repoUrl: 'https://github.com/IsraelUeda/mercado_projeto',
  },
  {
    id: 'projeto-finplan',
    title: 'Projeto FinPlan',
    subtitle: 'Planejamento Financeiro',
    category: 'Full-Stack / Flask & ML',
    sizeKB: 720,
    date: '2026/05/12',
    iconType: 'red-block',
    accentColor: '#e04f3e',
    summary:
      'Plataforma colaborativa de controle financeiro e orçamentos com Python (Flask), REST API, PostgreSQL e gamificação.',
    details:
      'Projeto em equipe focado em controle financeiro pessoal e gerenciamento de orçamentos, com rotas seguras para receitas, despesas e cálculo automatizado de saldo. Inspirado em mecânicas gamificadas, integra PostgreSQL, autenticação JWT/OAuth, Bootstrap 5 e PyTorch.',
    highlights: [
      'Funcionalidades back-end em Python (Flask) e REST API para receitas, despesas e saldo automático',
      'Modelagem relacional em PostgreSQL com persistência eficiente e autenticação JWT/OAuth',
      'Desenvolvimento colaborativo em equipe multiprofissional com integração contínua via Git/GitHub',
    ],
    tech: ['Python', 'Flask', 'REST API', 'PostgreSQL', 'PyTorch', 'Git/GitHub'],
    demoUrl: '',
    repoUrl: 'https://github.com/Gabriel-Ctrll/ProjetoFinPlan',
  },
  {
    id: 'bestiario-monster-hunter',
    title: 'Bestiário MH World',
    subtitle: 'Guia Interativo JS/JSON',
    category: 'Frontend / Web App',
    sizeKB: 840,
    date: '2025/10/24',
    iconType: 'ps2-cube',
    accentColor: '#4da6ff',
    summary:
      'Bestiário interativo para Monster Hunter World em HTML5, CSS3 e JavaScript puro com busca em português e dados em JSON.',
    details:
      'Aplicação web interativa que permite buscar monstros por nome em português (com normalização de acentos e apóstrofos), navegar entre fichas e consultar espécie, elementos, fraquezas, resistências, habitats e descrições detalhadas a partir de dados estruturados em JSON.',
    highlights: [
      'Front-end puro em HTML5, CSS3 e JavaScript (ES6+) com manipulação dinâmica de DOM',
      'Busca em português com normalização de acentos e leitura externa de JSON',
      'Publicado ao vivo via GitHub Pages para consulta rápida durante o jogo',
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript ES6+', 'JSON', 'GitHub Pages'],
    demoUrl: 'https://israelueda.github.io/Bestiario-monster-hunter/',
    repoUrl: 'https://github.com/IsraelUeda/Bestiario-monster-hunter',
  },
  {
    id: 'recon-frame',
    title: 'Recon Frame',
    subtitle: 'Network Scanner CLI',
    category: 'Linux / Redes & Segurança',
    sizeKB: 320,
    date: '2026/08/08',
    iconType: 'synth-ring',
    accentColor: '#c84de0',
    summary:
      'CLI leve em Shell Script para descoberta de hosts, scans de rede e geração automática de relatório HTML.',
    details:
    'Ferramenta de linha de comando voltada para administração de redes e cibersegurança em ambiente Linux, automatizando etapas de reconhecimento de rede local e consolidando as descobertas em um relatório HTML organizado.',
    highlights: [
      'Automação leve em Shell Script voltada para diagnóstico em ambientes Linux',
      'Descoberta e varredura estruturada de serviços e hosts em rede',
      'Exportação automática dos resultados em relatório HTML legível',
    ],
    tech: ['Shell Script', 'Linux', 'Redes LAN', 'HTML Report', 'Segurança'],
    demoUrl: '',
    repoUrl: 'https://github.com/IsraelUeda/recon_frame',
  },
  {
    id: 'helpdesk-system',
    title: 'Helpdesk System',
    subtitle: 'Gestão de Chamados TI',
    category: 'Suporte TI / Python',
    sizeKB: 380,
    date: '2026/10/04',
    iconType: 'cobalt-disc',
    accentColor: '#3b82f6',
    summary:
    'Sistema em Python para abertura, priorização, acompanhamento e histórico de chamados de suporte técnico.',
    details:
    'Projeto voltado à rotina de suporte técnico e operações de TI, estruturando o ciclo de vida de tickets, diagnóstico de incidentes, priorização e controle de atendimento ao usuário final.',
    highlights: [
      'Controle estruturado de abertura, status e resolução de chamados técnicos',
      'Alinhado diretamente à prática de suporte de TI e atendimento ao usuário',
      'Base modular em Python preparada para integração com banco de dados relacional',
    ],
    tech: ['Python', 'Suporte TI', 'Gestão de Chamados', 'Git'],
    demoUrl: '',
    repoUrl: 'https://github.com/IsraelUeda/Helpdesk',
  },
  {
    id: 'katchau-corridas',
    title: 'Katchau Corridas',
    subtitle: 'Robô Arduino Seguidor',
    category: 'Hardware / Embarcados',
    sizeKB: 640,
    date: '2024/09/18',
    iconType: 'visor-helmet',
    accentColor: '#ea7c3c',
    summary:
    'Robô seguidor de linha construído com Arduino e C++, acompanhado de portal web com documentação técnica.',
    details:
    'Projeto em equipe (Israel Ueda, Gabriel Araújo, Gabriel Constantino e Matheus Neri) documentando a montagem de hardware e programação em C++/Arduino do robô seguidor de linha Katchau, além do site criado em HTML, CSS e JavaScript.',
    highlights: [
      'Integração prática de hardware, sensores e programação embarcada em C++/Arduino',
      'Trabalho colaborativo unindo eletrônica, lógica e desenvolvimento web',
      'Site dedicado para publicação de artigos técnicos e registros do projeto',
    ],
    tech: ['Arduino', 'C++', 'Hardware', 'HTML5', 'CSS3', 'JavaScript'],
    demoUrl: 'https://katchaucorridas.github.io/',
    repoUrl: 'https://github.com/katchaucorridas/katchaucorridas.github.io',
  },
  {
    id: 'crud-leitura-livros',
    title: 'CRUD Livros',
    subtitle: 'Gerenciador de Leituras',
    category: 'Python / CRUD',
    sizeKB: 560,
    date: '2026/08/03',
    iconType: 'save-cart',
    accentColor: '#60a5fa',
    summary:
      'Sistema completo em Python para cadastro, acompanhamento, atualização e exclusão de livros lidos.',
    details:
    'Aplicação focada em organização pessoal de leituras, consolidando boas práticas de desenvolvimento CRUD, organização de dados e soluções simples e funcionais.',
    highlights: [
      'Fluxo completo de criação, leitura, edição e remoção (CRUD)',
      'Estruturação limpa voltada à facilidade de manutenção',
      'Foco em usabilidade e organização prática do acervo de leituras',
    ],
    tech: ['Python', 'CRUD', 'SQL', 'HTML/CSS', 'Git'],
    demoUrl: '',
    repoUrl: 'https://github.com/IsraelUeda/crud-leitura-de-livros',
  },
  {
    id: 'simulado-aws',
    title: 'Simulado AWS',
    subtitle: 'Cloud Practice Quiz',
    category: 'Cloud / JavaScript',
    sizeKB: 240,
    date: '2026/08/14',
    iconType: 'voxel-cube',
    accentColor: '#eab308',
    summary:
      'Aplicação interativa em JavaScript criada para praticar questões e conceitos de Cloud Computing na AWS.',
    details:
    'Ferramenta de estudos desenvolvida na trilha de Cloud Computing e DevOps, permitindo revisar fundamentos de serviços AWS, arquitetura em nuvem e segurança de forma interativa.',
    highlights: [
      'Interface rápida em JavaScript focada em revisão ativa de conceitos AWS',
      'Apoio prático aos estudos contínuos de Cloud Computing e infraestrutura',
      'Código leve e fácil de expandir com novos bancos de questões',
    ],
    tech: ['JavaScript', 'HTML5', 'CSS3', 'AWS', 'Cloud Computing'],
    demoUrl: '',
    repoUrl: 'https://github.com/IsraelUeda/simulado-aws',
  },
];

export const SKILLS = [
  {
    group: 'Suporte de TI, Sistemas & Infraestrutura',
    items: [
      { name: 'Windows & Linux (Arch Linux / Hyprland / Zsh)', level: 98, tag: 'SO / SUPORTE' },
      { name: 'Suporte Técnico, Manutenção Preventiva & Corretiva', level: 95, tag: 'HARDWARE / SW' },
      { name: 'Redes Locais (LAN), Impressoras Corporativas & Chamados', level: 88, tag: 'INFRA / REDES' },
      { name: 'Docker & Homelab (Portainer, Homepage, Jellyfin, Immich)', level: 90, tag: 'CONTAINERS' },
      { name: 'Segurança Básica, Patches, IA & Kubernetes / Cloud', level: 65, tag: 'SEC / CLOUD' },
    ],
  },
  {
    group: 'Desenvolvimento, APIs & Bancos de Dados',
    items: [
      { name: 'Python (FastAPI, Flask, POO, Automações)', level: 84, tag: 'BACK-END' },
      { name: 'PostgreSQL & MySQL (Modelagem Relacional)', level: 82, tag: 'SQL / DATA' },
      { name: 'REST APIs, JWT & Diagnóstico de Problemas', level: 85, tag: 'APIS' },
      { name: 'JavaScript / HTML5 / CSS3 / Bootstrap / Tailwind', level: 82, tag: 'WEB' },
      { name: 'C# (POO), C, PHP & Git / GitHub', level: 78, tag: 'CORE / VCS' },
    ],
  },
];

export const EXPERIENCE = [
  {
    period: 'Atuação Prática — Suzano, SP',
    role: 'Profissional Autônomo — Suporte de TI & Projetos Práticos',
    company: 'Suporte Técnico, Infraestrutura & Manutenção',
    description:
      'Suporte técnico direto ao usuário final com diagnóstico ágil de hardware e software; manutenção preventiva e corretiva de computadores; instalação e configuração personalizada de Windows e Linux; administração de redes locais (LAN), impressoras corporativas, patches de segurança, atualizações e gerenciamento de chamados.',
  },
  {
    period: 'Atual — Projeto Contínuo',
    role: 'Administrador de Homelab & Laboratório DevOps',
    company: 'Infraestrutura Pessoal (Arch Linux & Docker)',
    description:
    'Ambiente Homelab rodando serviços containerizados (Docker, Portainer, Homepage, Jellyfin, Immich), automações em Python, Kubernetes Lab e estudos contínuos de Cloud Computing.',
  },
  {
    period: '2025 — 2026',
    role: 'Pesquisa de TCC — Segurança e Privacidade em IA',
    company: 'Faculdade Anhanguera Marte • São Paulo, SP',
    description:
    'Trabalho de Conclusão de Curso em Ciência da Computação voltado à segurança, privacidade e boas práticas em sistemas de Inteligência Artificial.',
  },
  {
    period: 'Setembro 2022 — Fevereiro 2023',
    role: 'Ajudante Geral',
    company: 'Lojas Sol',
    description:
    'Primeira experiência profissional formal, desenvolvendo trabalho em equipe, atendimento ao cliente, organização e proatividade.',
  },
];

export const DESIGN_SPECS = [
  {
    label: 'Suporte Técnico & Infraestrutura',
    value: 'Diagnóstico de hardware/software, Windows & Linux, redes locais (LAN), impressoras e gestão de chamados',
  },
  {
    label: 'Homelab Ativo (Online)',
    value: 'Docker • Portainer • Homepage • Jellyfin • Immich em Arch Linux (Hyprland + Zsh)',
  },
  {
    label: 'Idiomas & Interesses',
    value: 'Português Nativo | Inglês Técnico (documentação) • Ciclismo de estrada, Xadrez e jogos RPG',
  },
];

export const VERSION_INFO = {
  specs: [
    { label: 'Nome', value: PROFILE.fullName },
    { label: 'Cargo Alvo', value: PROFILE.role },
    { label: 'Localização', value: PROFILE.location },
    { label: 'Telefone', value: PROFILE.phone },
    { label: 'E-mail', value: PROFILE.email },
    { label: 'Idiomas', value: PROFILE.languages },
    { label: 'Sistema', value: 'Windows • Arch Linux (Hyprland / Zsh)' },
  ],
  education: [
    {
      title: 'Bacharelado em Ciência da Computação',
      place: 'Faculdade Anhanguera Marte • São Paulo, SP • 2022 – 2026 (Concluído)',
    },
    {
      title: 'TCC — Segurança e Privacidade em IA',
      place: 'Pesquisa Acadêmica em Inteligência Artificial & Cibersegurança',
    },
  ],
  certifications: [
    'Programação em Python do Básico ao Avançado — Geek University (64h • Concluído)',
    'C# COMPLETO Programação Orientada a Objetos + Projetos — Nélio Alves (38h)',
    'Web Completo: PHP 7, HTML, CSS, JavaScript & Banco de Dados (74h • Concluído)',
    'JavaScript e TypeScript do Básico ao Avançado — Luiz Otávio Miranda (146h • Cursando)',
  ],
};
