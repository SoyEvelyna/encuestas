/**
 * Encuestas de satisfacción EvelynA — recibe las respuestas de las páginas
 * dueno.html y equipo.html y las agrega como filas en el Google Sheet.
 *
 * Uso: pegar este archivo en un proyecto de Apps Script creado DESDE el Sheet
 * (Extensiones → Apps Script), guardar e Implementar → Aplicación web,
 * "Ejecutar como: yo", "Quién tiene acceso: cualquier persona".
 * La URL /exec que devuelve va en ENDPOINT, dentro de encuestas.js.
 */

const HOJAS = {
  dueno: {
    nombre: 'Dueño / Líder',
    columnas: [
      ['fecha', 'Fecha'],
      ['negocio', 'Negocio'],
      ['nombre', 'Nombre'],
      ['q1', '1. Valor del acompañamiento (1-5)'],
      ['q2', '2. Dónde generó más valor'],
      ['q2_otro', '2. Otro'],
      ['q3', '3. Cambio o resultado más importante'],
      ['q4_claridad', '4. Claridad para explicar y orientar'],
      ['q4_comprension', '4. Capacidad de comprender el negocio'],
      ['q4_practicas', '4. Propuestas prácticas y aplicables'],
      ['q4_seguimiento', '4. Seguimiento y compromiso'],
      ['q5', '5. Qué podría haber hecho diferente'],
      ['q6', '6. ¿Recomendaría?'],
      ['q7', '7. Lo más valioso (testimonio)'],
      ['testimonio', 'Autoriza testimonio']
    ]
  },
  equipo: {
    nombre: 'Equipo',
    columnas: [
      ['fecha', 'Fecha'],
      ['negocio', 'Negocio'],
      ['nombre', 'Nombre'],
      ['q1', '1. Utilidad para el trabajo (1-5)'],
      ['q2', '2. Qué aportó'],
      ['q2_otro', '2. Otro'],
      ['q3', '3. Qué aprendió o cambió'],
      ['q4_claridad', '4. Claridad de las explicaciones'],
      ['q4_espacio', '4. Espacio para participar'],
      ['q4_utilidad', '4. Utilidad práctica'],
      ['q4_cercania', '4. Cercanía y predisposición'],
      ['q5', '5. Qué podría mejorar'],
      ['q6', '6. Qué le diría a alguien (testimonio)'],
      ['testimonio', 'Autoriza testimonio (anónimo)']
    ]
  }
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const datos = JSON.parse(e.postData.contents);
    const conf = HOJAS[datos.encuesta];
    if (!conf) return json_({ ok: false, error: 'Encuesta desconocida' });

    // Si la misma respuesta llega dos veces (reintento), no se duplica.
    const ids = PropertiesService.getScriptProperties();
    if (datos.id && ids.getProperty('r_' + datos.id)) return json_({ ok: true, repetida: true });

    const hoja = hoja_(conf);
    const fila = conf.columnas.map(function (c) {
      if (c[0] === 'fecha') return new Date();
      const v = datos[c[0]];
      if (Array.isArray(v)) return v.join(' · ');
      if (v === true) return 'Sí';
      if (v === false) return 'No';
      return v == null ? '' : String(v).slice(0, 5000);
    });
    hoja.appendRow(fila);
    if (datos.id) ids.setProperty('r_' + datos.id, '1');
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, servicio: 'Encuestas EvelynA' });
}

function hoja_(conf) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(conf.nombre);
  if (!hoja) {
    hoja = libro.insertSheet(conf.nombre);
    hoja.setFrozenRows(1);
    hoja.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  }
  // Si cambian las preguntas, la fila de títulos se actualiza sola.
  const titulos = conf.columnas.map(function (c) { return c[1]; });
  const ancho = Math.max(titulos.length, hoja.getLastColumn(), 1);
  const actuales = hoja.getRange(1, 1, 1, ancho).getValues()[0];
  if (actuales.slice(0, titulos.length).join('|') !== titulos.join('|')) {
    hoja.getRange(1, 1, 1, ancho).clearContent();
    hoja.getRange(1, 1, 1, titulos.length).setValues([titulos])
      .setFontWeight('bold').setBackground('#212121').setFontColor('#FAFAFA').setWrap(true);
    hoja.setColumnWidths(1, titulos.length, 180);
  }
  return hoja;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
