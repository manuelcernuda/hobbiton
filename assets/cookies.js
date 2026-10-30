/*
 * Aviso de cookies y carga de Google Analytics. Generado por webmaster.
 *
 * - Ventana modal sobre la web hasta que el visitante elige. Aceptar y Rechazar tienen
 *   el mismo peso, y las dos opciones dan acceso a la web.
 * - Google Analytics NO se carga hasta que el visitante pulsa «Aceptar».
 * - La decisión se guarda en localStorage (no en una cookie) durante 12 meses.
 * - Solo se activa en el dominio público: en la previsualización no se mide.
 * - Al rechazar después de haber aceptado, se borran las cookies _ga*.
 */
(function () {
  "use strict";
  var script = document.currentScript;
  var GA_ID = script.getAttribute("data-ga");
  var DOMINIO = script.getAttribute("data-dominio");
  var CLAVE = "consentimiento-cookies";
  var VIGENCIA = 365 * 24 * 60 * 60 * 1000;
  var medirAqui = !DOMINIO || location.hostname === DOMINIO;

  function leer() {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE));
      if (d && (d.v === "si" || d.v === "no") && Date.now() - d.t < VIGENCIA) return d.v;
    } catch (e) { /* almacenamiento no disponible */ }
    return null;
  }

  function guardar(v) {
    try { localStorage.setItem(CLAVE, JSON.stringify({ v: v, t: Date.now() })); } catch (e) { /* nada */ }
  }

  function cargarAnalytics() {
    if (!medirAqui || !GA_ID || window.__gaCargado) return;
    window.__gaCargado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function borrarCookiesGA() {
    var partes = location.hostname.split(".");
    var dominios = ["", location.hostname, "." + location.hostname];
    if (partes.length > 2) dominios.push("." + partes.slice(-2).join("."));
    document.cookie.split(";").forEach(function (c) {
      var nombre = c.split("=")[0].trim();
      if (nombre.indexOf("_ga") !== 0) return;
      dominios.forEach(function (d) {
        document.cookie = nombre + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  var aviso = document.getElementById("aviso-cookies");

  var enPolitica = document.body.hasAttribute("data-pagina-cookies");

  function botones() { return aviso ? aviso.querySelectorAll("button, a[href]") : []; }

  function mostrarAviso() {
    if (!aviso) return;
    // No se bloquea el scroll de la página: la capa ya impide tocarla, y bloquearlo con
    // overflow:hidden deja a veces Safari de iOS sin desplazamiento al cerrar la ventana.
    aviso.hidden = false;
    // El foco va a la ventana, no a un botón, para no destacar Aceptar sobre Rechazar.
    var ventana = aviso.querySelector(".aviso-cookies");
    if (ventana) ventana.focus();
  }

  function ocultarAviso() {
    if (!aviso) return;
    aviso.hidden = true;
  }

  // El foco del teclado se queda dentro de la ventana mientras esté abierta.
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Tab" || !aviso || aviso.hidden) return;
    var lista = botones();
    if (!lista.length) return;
    var primero = lista[0], ultimo = lista[lista.length - 1];
    if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
  });

  function pintarEstado() {
    var v = leer();
    document.querySelectorAll("[data-cookies-estado]").forEach(function (el) {
      el.textContent = v === "si" ? "Has aceptado las cookies de análisis."
        : v === "no" ? "Has rechazado las cookies de análisis."
        : "Todavía no has elegido.";
    });
  }

  function decidir(v) {
    var habiaAceptado = leer() === "si";
    guardar(v);
    ocultarAviso();
    if (v === "si") {
      cargarAnalytics();
    } else {
      if (GA_ID) window["ga-disable-" + GA_ID] = true;
      borrarCookiesGA();
      // Si Analytics ya estaba funcionando en esta página, se recarga para pararlo del todo.
      if (habiaAceptado && window.__gaCargado) location.reload();
    }
    pintarEstado();
  }

  document.addEventListener("click", function (ev) {
    var boton = ev.target.closest("[data-cookies]");
    if (boton) {
      ev.preventDefault();
      decidir(boton.getAttribute("data-cookies"));
      return;
    }
    var abrir = ev.target.closest("[data-cookies-abrir]");
    if (abrir && aviso && !enPolitica) {
      ev.preventDefault();
      mostrarAviso();
    }
  });

  function sincronizar() {
    var actual = leer();
    if (actual === "si") { ocultarAviso(); cargarAnalytics(); }
    else if (actual === "no") ocultarAviso();
    // En la política de cookies no se tapa la página: se elige con sus propios botones.
    else if (!enPolitica) mostrarAviso();
    pintarEstado();
  }

  sincronizar();
  // Safari restaura las páginas desde su caché al volver atrás sin volver a ejecutar el
  // script: se comprueba de nuevo la elección, por si se hizo en otra página.
  window.addEventListener("pageshow", function (ev) { if (ev.persisted) sincronizar(); });
})();
