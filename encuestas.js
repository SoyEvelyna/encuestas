/* Encuestas de satisfacción EvelynA.
   ENDPOINT: URL /exec de la aplicación web de Apps Script (apps-script/Code.gs).
   Vacío = modo prueba: la encuesta funciona pero no guarda nada. */
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwz51a2OpAvjqFs78_ezeSJVXh-NZt10utpTkxY7K91_pkF4T2GQ8aN_SS8D20aDwHlTw/exec';
const WEB = 'https://soyevelyna.com/';

const ENCUESTAS = {
  dueno: {
    tag: 'Encuesta 01 — Dueño / Líder',
    titulo: ['Tu experiencia', 'con <mark>EvelynA</mark>'],
    intro: 'Gracias por confiar en mí para acompañar a tu negocio. Me interesa conocer tu experiencia, entender qué te aportó este proceso y descubrir qué puedo mejorar. Tus respuestas me ayudan a seguir construyendo un acompañamiento que genere valor real.',
    tiempo: '3–5 minutos',
    color: 'chrome',
    datos: true,
    preguntas: [
      { id: 'q1', tipo: 'escala', req: true, texto: '¿Qué tan valioso fue el acompañamiento para vos y tu negocio?', min: 'Poco valioso', max: 'Muy valioso' },
      { id: 'q2', tipo: 'casillas', texto: '¿En qué aspectos sentís que el acompañamiento generó más valor?', ayuda: 'Elegí todas las opciones que correspondan.',
        opciones: ['Claridad sobre el negocio y sus prioridades', 'Organización y planificación', 'Estrategia de marketing y comunicación', 'Toma de decisiones', 'Organización y alineación del equipo', 'Implementación de acciones concretas'] },
      { id: 'q3', tipo: 'texto', texto: '¿Cuál fue el cambio o resultado más importante que te llevás de este proceso?' },
      { id: 'q4', tipo: 'matriz', req: true, texto: '¿Cómo evaluarías mi forma de acompañarte?', ayuda: '1 = Muy baja · 5 = Excelente',
        filas: [['claridad', 'Claridad para explicar y orientar'], ['comprension', 'Capacidad de comprender tu negocio'], ['practicas', 'Propuestas prácticas y aplicables'], ['seguimiento', 'Seguimiento y compromiso']] },
      { id: 'q5', tipo: 'texto', texto: '¿Qué podría haber hecho diferente para que el acompañamiento fuera aún más útil?' },
      { id: 'q6', tipo: 'opcion', req: true, texto: '¿Recomendarías mi acompañamiento a otra persona que lidera un negocio?', opciones: ['Sí, definitivamente', 'Tal vez', 'No'] },
      { id: 'q7', tipo: 'texto', texto: 'Si tuvieras que contarle a otra persona qué fue lo más valioso de trabajar conmigo, ¿qué le dirías?' }
    ],
    testimonio: 'Autorizo a EvelynA a utilizar mi respuesta a la pregunta 7 como testimonio público, mencionando mi nombre y/o negocio, previa confirmación del texto que se publicará.',
    testimonioPide: 'q7'
  },
  equipo: {
    tag: 'Encuesta 02 — Equipo',
    titulo: ['Tu experiencia', 'trabajando con <mark>EvelynA</mark>'],
    intro: 'Me gustaría conocer cómo viviste el proceso de acompañamiento. Tu mirada es muy importante para entender qué fue útil, qué cambió en tu trabajo y qué podría mejorar. No hay respuestas correctas o incorrectas.',
    tiempo: '3–5 minutos',
    anonima: true,
    color: 'sky',
    preguntas: [
      { id: 'q1', tipo: 'escala', req: true, texto: '¿Qué tan útil te resultó el acompañamiento para tu trabajo?', min: 'Nada útil', max: 'Muy útil' },
      { id: 'q2', tipo: 'casillas', texto: '¿Qué te aportó este proceso?', ayuda: 'Elegí todas las opciones que correspondan.',
        opciones: ['Mayor claridad sobre mis tareas y prioridades', 'Más organización en mi trabajo', 'Mejor comunicación con el equipo', 'Nuevas herramientas o conocimientos', 'Mayor seguridad para tomar decisiones', 'Ideas que pude llevar a la práctica'] },
      { id: 'q3', tipo: 'texto', texto: '¿Qué aprendiste, cambiaste o empezaste a hacer de manera diferente gracias al acompañamiento?' },
      { id: 'q4', tipo: 'matriz', req: true, texto: '¿Cómo fue tu experiencia trabajando conmigo?', ayuda: '1 = Muy baja · 5 = Excelente',
        filas: [['claridad', 'Claridad de las explicaciones'], ['espacio', 'Espacio para participar y hacer preguntas'], ['utilidad', 'Utilidad práctica de las propuestas'], ['cercania', 'Cercanía y predisposición']] },
      { id: 'q5', tipo: 'texto', texto: '¿Qué podría mejorar para que el acompañamiento sea más útil para quienes forman parte del equipo?' },
      { id: 'q6', tipo: 'texto', texto: '¿Qué le dirías a alguien que está por trabajar conmigo?' }
    ],
    testimonio: 'Autorizo a EvelynA a utilizar mi respuesta a la pregunta 6 como testimonio público, de manera anónima, previa confirmación del texto que se publicará.',
    testimonioPide: 'q6'
  }
};

(function () {
  const clave = document.body.dataset.encuesta;
  const E = ENCUESTAS[clave];
  const cliente = (new URLSearchParams(location.search).get('c') || '').slice(0, 80);
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dos = (n) => String(n).padStart(2, '0');

  document.body.classList.add('-' + E.color);

  // ── Portada ──
  $('#tag').textContent = E.tag;
  $('#titulo').innerHTML = E.titulo.map((l) => '<span>' + l + '</span>').join('');
  $('#intro').textContent = E.intro;
  $('#meta').innerHTML = '<span>Tiempo estimado: ' + E.tiempo + '</span>' + (E.anonima ? '<span>Es anónima: no te pido nombre ni correo</span>' : '');

  // ── Preguntas ──
  const escala = (name, label) => '<div class="escala" role="radiogroup" aria-label="' + esc(label) + '">' +
    [1, 2, 3, 4, 5].map((n) => '<label><input type="radio" name="' + name + '" value="' + n + '"><span>' + n + '</span></label>').join('') + '</div>';

  let html = '';
  if (E.datos) {
    html += '<section class="q -datos"><div class="q__num">00</div><div class="q__cuerpo">' +
      '<h2>Antes de empezar</h2><p class="ayuda">Opcional. Me sirve para saber de quién es cada respuesta.</p>' +
      '<div class="dosc"><label class="campo"><span>Tu nombre</span><input name="nombre" autocomplete="name"></label>' +
      '<label class="campo"><span>Tu negocio</span><input name="negocio" autocomplete="organization" value="' + esc(cliente) + '"></label></div></div></section>';
  }
  E.preguntas.forEach((p, i) => {
    let c = '';
    if (p.tipo === 'escala') {
      c = escala(p.id, p.texto) + '<div class="extremos"><span>1 · ' + esc(p.min) + '</span><span>5 · ' + esc(p.max) + '</span></div>';
    } else if (p.tipo === 'casillas') {
      c = '<div class="lista">' + p.opciones.map((o) => '<label class="caja"><input type="checkbox" name="' + p.id + '" value="' + esc(o) + '"><i></i><span>' + esc(o) + '</span></label>').join('') +
        '<label class="caja -otro"><input type="checkbox" name="' + p.id + '" value="Otro"><i></i><span>Otro</span></label>' +
        '<input class="otro" name="' + p.id + '_otro" placeholder="¿Cuál?" aria-label="Otro, ¿cuál?"></div>';
    } else if (p.tipo === 'matriz') {
      c = '<div class="matriz">' + p.filas.map((f) => '<div class="fila"><span class="fila__t">' + esc(f[1]) + '</span>' + escala(p.id + '_' + f[0], f[1]) + '</div>').join('') + '</div>';
    } else if (p.tipo === 'opcion') {
      c = '<div class="bloques">' + p.opciones.map((o) => '<label><input type="radio" name="' + p.id + '" value="' + esc(o) + '"><span>' + esc(o) + '</span></label>').join('') + '</div>';
    } else {
      c = '<textarea name="' + p.id + '" rows="3" placeholder="Escribí tu respuesta…"></textarea>';
    }
    html += '<section class="q" data-id="' + p.id + '"' + (p.req ? ' data-req' : '') + '><div class="q__num">' + dos(i + 1) + '</div><div class="q__cuerpo">' +
      '<h2>' + esc(p.texto) + '</h2>' + (p.ayuda ? '<p class="ayuda">' + esc(p.ayuda) + '</p>' : (p.tipo === 'texto' ? '<p class="ayuda">Opcional</p>' : '')) +
      c + '<p class="falta">Esta respuesta me hace falta.</p></div></section>';
  });
  html += '<section class="q -testi"><div class="q__num">✓</div><div class="q__cuerpo"><h2>Autorización opcional de testimonio</h2>' +
    '<label class="caja"><input type="checkbox" name="testimonio"><i></i><span>' + esc(E.testimonio) + '</span></label></div></section>';
  $('#preguntas').innerHTML = html;

  const form = $('#form');

  // "Otro": el campo se habilita al tildar y tilda solo al escribir
  form.querySelectorAll('.otro').forEach((inp) => {
    const box = inp.parentElement.querySelector('.-otro input');
    inp.addEventListener('input', () => { if (inp.value.trim()) box.checked = true; });
    box.addEventListener('change', () => { if (box.checked) inp.focus(); });
  });

  // ── Progreso ──
  const qs = [...form.querySelectorAll('.q[data-id]')];
  const contestada = (q) => [...q.querySelectorAll('input,textarea')].some((el) => (el.type === 'radio' || el.type === 'checkbox') ? el.checked : el.value.trim());
  const completa = (q) => {
    const grupos = new Set([...q.querySelectorAll('input[type=radio]')].map((r) => r.name));
    return [...grupos].every((n) => form.querySelector('input[name="' + n + '"]:checked'));
  };
  const progreso = () => {
    const n = qs.filter(contestada).length;
    $('#barra').style.width = (n / qs.length * 100) + '%';
    $('#cuenta').textContent = dos(n) + ' / ' + dos(qs.length);
    qs.forEach((q) => { if (q.classList.contains('-falta') && completa(q)) q.classList.remove('-falta'); });
  };
  form.addEventListener('input', progreso);
  form.addEventListener('change', progreso);
  progreso();

  // ── Envío ──
  const PEND = 'encuesta-evelyna-pendiente';
  const enviar = (datos) => {
    if (!ENDPOINT) { console.info('[modo prueba] respuesta:', datos); return Promise.resolve(); }
    return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(datos) })
      .then((r) => r.json()).then((j) => { if (!j.ok) throw new Error(j.error || 'Error'); });
  };
  const guardar = (d) => { try { localStorage.setItem(PEND, JSON.stringify(d)); } catch (e) {} };
  const borrar = () => { try { localStorage.removeItem(PEND); } catch (e) {} };

  // Si una respuesta anterior quedó sin llegar, se reintenta sola
  try { const p = JSON.parse(localStorage.getItem(PEND) || 'null'); if (p) enviar(p).then(borrar).catch(() => {}); } catch (e) {}

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const faltan = qs.filter((q) => q.hasAttribute('data-req') && !completa(q));
    faltan.forEach((q) => q.classList.add('-falta'));
    if (faltan.length) { faltan[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

    const fd = new FormData(form);
    const d = { encuesta: clave, cliente: cliente, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) };
    for (const [k, v] of fd.entries()) {
      if (k === 'testimonio') continue;
      if (d[k] !== undefined) d[k] = [].concat(d[k], v); else d[k] = v;
    }
    E.preguntas.filter((p) => p.tipo === 'casillas').forEach((p) => { d[p.id] = [].concat(d[p.id] || []); });
    d.testimonio = form.elements.testimonio.checked;

    const btn = $('#enviar');
    btn.disabled = true; btn.querySelector('span').textContent = 'Enviando…';
    $('#error').hidden = true;
    enviar(d).then(() => { borrar(); listo(); }).catch(() => {
      guardar(d);
      btn.disabled = false; btn.querySelector('span').textContent = 'Reintentar';
      $('#error').hidden = false;
    });
  });

  function listo() {
    document.body.classList.add('-gracias');
    $('#gracias').hidden = false;
    window.scrollTo(0, 0);
  }
})();
