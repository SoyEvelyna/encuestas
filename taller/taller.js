/* Encuesta del taller Desafío 2026 (encuestas.soyevelyna.com/taller).
   Guarda en la hoja "Taller" del mismo Sheet que las encuestas de consultoría. */
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwz51a2OpAvjqFs78_ezeSJVXh-NZt10utpTkxY7K91_pkF4T2GQ8aN_SS8D20aDwHlTw/exec';
const AGENDA = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2jywVGtcgLCaAL9WJIPPmD7OSmYKkIf2nh-E0Iit-5HibY-Dzw2NtsG7ik6xCs1WaPkR58shhp';
const SIGUE_CON_EVE = ['Me gustaría que me acompañes con mi emprendimiento', 'Me interesa ordenar mi negocio con equipo'];

const PREGUNTAS = [
  { id: 'q1', tipo: 'escala', req: true, texto: '¿Qué tan útil te resultó el taller?', min: 'Poco útil', max: 'Muy útil' },
  { id: 'q2', tipo: 'casillas', texto: '¿Qué te llevás?', ayuda: 'Elegí todas las que correspondan.',
    opciones: ['Un objetivo más claro', 'Saber qué va primero', 'Una acción concreta para esta semana', 'Plan Objetivo para organizarme', 'Ganas de ponerme a ordenar'] },
  { id: 'q3', tipo: 'texto', texto: '¿Qué fue lo que más te sirvió o te quedó dando vueltas?' },
  { id: 'q4', tipo: 'texto', texto: 'Hoy, ¿qué es lo que más te frena para lograr tu objetivo?' },
  { id: 'q5', tipo: 'opcion', req: true, texto: '¿Cómo te gustaría seguir?',
    opciones: ['Sola/o, con Plan Objetivo', SIGUE_CON_EVE[0], SIGUE_CON_EVE[1], 'Por ahora, no sé'] },
  { id: 'q6', tipo: 'texto', texto: '¿Qué mejorarías del taller?' }
];
const TESTIMONIO = 'Autorizo a EvelynA a usar mi respuesta a la pregunta 3 como testimonio, con mi nombre, previa confirmación del texto.';

(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dos = (n) => String(n).padStart(2, '0');
  const form = $('#form');
  const btn = $('#enviar');

  $('#tag').textContent = 'Taller Desafío 2026 · Encuesta';
  $('#titulo').innerHTML = '¿Cómo te fue en el taller?';
  $('#intro').textContent = 'Gracias por estar. Tu mirada me ayuda a mejorar los próximos encuentros y a entender mejor qué necesitás para avanzar.';
  $('#meta').innerHTML = '<span>Tiempo estimado: 2 minutos</span>';
  $('.cierre__nota').textContent = 'Gracias por tomarte este tiempo. Tus respuestas me llegan directo a mí.';

  const escala = (name, label) => '<div class="escala" role="radiogroup" aria-label="' + esc(label) + '">' +
    [1, 2, 3, 4, 5].map((n) => '<label><input type="radio" name="' + name + '" value="' + n + '"><span>' + n + '</span></label>').join('') + '</div>';

  let html = '<section class="q -datos" data-id="datos" data-req><div class="q__num">00</div><div class="q__cuerpo">' +
    '<h2>Antes de empezar</h2><p class="ayuda">Así sé quién me escribe.</p><div class="datos">' +
    '<label class="campo"><span>Nombre</span><input name="nombre" autocomplete="name" required></label>' +
    '<label class="campo"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>' +
    '</div><p class="falta">Completá tu nombre y un email válido.</p></div></section>';
  PREGUNTAS.forEach((p, i) => {
    let c = '';
    if (p.tipo === 'escala') {
      c = escala(p.id, p.texto) + '<div class="extremos"><span>1 · ' + esc(p.min) + '</span><span>5 · ' + esc(p.max) + '</span></div>';
    } else if (p.tipo === 'casillas') {
      c = '<div class="lista">' + p.opciones.map((o) => '<label class="caja"><input type="checkbox" name="' + p.id + '" value="' + esc(o) + '"><i></i><span>' + esc(o) + '</span></label>').join('') +
        '<label class="caja -otro"><input type="checkbox" name="' + p.id + '" value="Otro"><i></i><span>Otro</span></label>' +
        '<input class="otro" name="' + p.id + '_otro" placeholder="¿Cuál?" aria-label="Otro, ¿cuál?"></div>';
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
    '<label class="caja"><input type="checkbox" name="testimonio"><i></i><span>' + esc(TESTIMONIO) + '</span></label></div></section>';
  $('#preguntas').innerHTML = html;

  form.querySelectorAll('.otro').forEach((inp) => {
    const box = inp.parentElement.querySelector('.-otro input');
    inp.addEventListener('input', () => { if (inp.value.trim()) box.checked = true; });
    box.addEventListener('change', () => { if (box.checked) inp.focus(); });
  });

  const qs = [...form.querySelectorAll('.q[data-id]')];
  const emailOk = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.elements.email.value.trim());
  const datosOk = () => form.elements.nombre.value.trim() && emailOk();
  const contestada = (q) => q.dataset.id === 'datos' ? datosOk() :
    [...q.querySelectorAll('input,textarea')].some((el) => (el.type === 'radio' || el.type === 'checkbox') ? el.checked : el.value.trim());
  const completa = (q) => {
    if (q.dataset.id === 'datos') return datosOk();
    const grupos = new Set([...q.querySelectorAll('input[type=radio]')].map((r) => r.name));
    return [...grupos].every((n) => form.querySelector('input[name="' + n + '"]:checked'));
  };
  function progreso() {
    const n = qs.filter(contestada).length;
    $('#barra').style.width = (n / qs.length * 100) + '%';
    $('#cuenta').textContent = dos(n) + ' / ' + dos(qs.length);
    qs.forEach((q) => { if (q.classList.contains('-falta') && completa(q)) q.classList.remove('-falta'); });
  }
  form.addEventListener('input', progreso);
  form.addEventListener('change', progreso);
  progreso();

  const PEND = 'encuesta-taller-pendiente';
  const enviar = (datos) => {
    if (!ENDPOINT) { console.info('[modo prueba] respuesta:', datos); return Promise.resolve(); }
    return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(datos) })
      .then((r) => r.json()).then((j) => { if (!j.ok) throw new Error(j.error || 'Error'); });
  };
  const guardar = (d) => { try { localStorage.setItem(PEND, JSON.stringify(d)); } catch (e) {} };
  const borrar = () => { try { localStorage.removeItem(PEND); } catch (e) {} };
  try { const p = JSON.parse(localStorage.getItem(PEND) || 'null'); if (p) enviar(p).then(borrar).catch(() => {}); } catch (e) {}

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const faltan = qs.filter((q) => q.hasAttribute('data-req') && !completa(q));
    faltan.forEach((q) => q.classList.add('-falta'));
    if (faltan.length) { faltan[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }

    const fd = new FormData(form);
    const d = { encuesta: 'taller', id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) };
    for (const [k, v] of fd.entries()) {
      if (k === 'testimonio') continue;
      const val = typeof v === 'string' ? v.trim().slice(0, 3000) : v;
      if (d[k] !== undefined) d[k] = [].concat(d[k], val); else d[k] = val;
    }
    d.q2 = [].concat(d.q2 || []);
    d.testimonio = form.elements.testimonio.checked;

    btn.disabled = true; btn.querySelector('span').textContent = 'Enviando…';
    $('#error').hidden = true;
    enviar(d).then(() => { borrar(); listo(d); }).catch(() => {
      guardar(d);
      btn.disabled = false; btn.querySelector('span').textContent = 'Reintentar';
      $('#error').hidden = false;
    });
  });

  function listo(d) {
    if (SIGUE_CON_EVE.includes(d.q5)) {
      $('#gracias-txt').textContent = '¡Qué bueno que quieras seguir! Elegí un horario y charlamos 30 minutos sobre tu ' +
        (d.q5 === SIGUE_CON_EVE[1] ? 'negocio' : 'emprendimiento') + '.';
    }
    document.body.classList.add('-gracias');
    $('#gracias').hidden = false;
    window.scrollTo(0, 0);
  }
})();
