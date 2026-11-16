/**
 *  FRONTEND - Ventana de prueba Invoka API
 */
const API_BASE = window.location.origin;

function switchTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  event.target.classList.add("active");
  document.getElementById("tab-" + tabId).classList.add("active");
}

function showResult(containerId, data, ok) {
  const container = document.getElementById(containerId);
  const badge = ok ? "<span class=\"badge-ok\">ÉXITO</span>" : "<span class=\"badge-error\">ERROR</span>";
  let json = "";
  try { json = JSON.stringify(data, null, 2); } catch (e) { json = String(data); }
  container.innerHTML = "<div class=\"result-header\">" + badge + " <span style=\"font-size:0.8rem;color:#64748b;\">" + new Date().toLocaleString() + "</span></div><pre>" + json + "</pre>";
  container.classList.add("show");
  container.scrollIntoView({ behavior: "smooth" });
}

async function verificarEstado() {
  try {
    const r = await fetch(API_BASE + "/api/health");
    const dot = document.getElementById("statusDot");
    const txt = document.getElementById("statusText");
    if (r.ok) {
      dot.className = "status-dot online";
      txt.textContent = "Servidor conectado";
    } else {
      dot.className = "status-dot";
      txt.textContent = "Servidor responde con error";
    }
  } catch (e) {
    document.getElementById("statusDot").className = "status-dot";
    document.getElementById("statusText").textContent = "Servidor no disponible";
  }
}

function getFechaEcuador() {
  const ahora = new Date();
  const ecuador = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
  const y = ecuador.getFullYear();
  const m = String(ecuador.getMonth() + 1).padStart(2, "0");
  const d = String(ecuador.getDate()).padStart(2, "0");
  return y + "/" + m + "/" + d;
}

async function emitirFactura() {
  const btn = event.target;
  const textoOriginal = btn.textContent;
  btn.textContent = "Procesando...";
  btn.disabled = true;
  try {
    const fecha = document.getElementById("f_emisor_fecha").value || getFechaEcuador();
    const factura = {
      ambiente: parseInt(document.getElementById("f_ambiente").value, 10),
      emisor: {
        nombre_comercial: document.getElementById("f_emisor_nombre_comercial").value,
        razon_social: document.getElementById("f_emisor_razon_social").value,
        ruc: document.getElementById("f_emisor_ruc").value,
        codigo_establecimiento: document.getElementById("f_emisor_cod_est").value,
        codigo_puntoemision: document.getElementById("f_emisor_cod_punto").value,
        direccion_matriz: document.getElementById("f_emisor_dir_matriz").value,
        direccion_establecimiento: document.getElementById("f_emisor_dir_est").value,
        obligado_contabilidad: document.getElementById("f_emisor_obligado").value,
        secuencial: document.getElementById("f_emisor_secuencial").value,
        fecha_emision: fecha,
      },
      comprador: {
        identificacion: document.getElementById("f_comprador_identificacion").value,
        tipo_identificacion: document.getElementById("f_comprador_tipo_ident").value,
        razon_social: document.getElementById("f_comprador_razon_social").value,
        direccion: document.getElementById("f_comprador_direccion").value,
        correo: document.getElementById("f_comprador_correo").value,
      },
      items: [{
        codigo_principal: document.getElementById("f_item_codigo").value,
        descripcion: document.getElementById("f_item_descripcion").value,
        cantidad: parseFloat(document.getElementById("f_item_cantidad").value) || 0,
        precio_unitario: parseFloat(document.getElementById("f_item_precio").value) || 0,
        descuento: parseFloat(document.getElementById("f_item_descuento").value) || 0,
        tipoproducto: parseInt(document.getElementById("f_item_tipo_producto").value, 10) || 1,
        tipo_iva: parseInt(document.getElementById("f_item_tipo_iva").value, 10) || 2,
      }],
    };
    const resp = await fetch(API_BASE + "/api/proxy/factura/emision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(factura),
    });
    const data = await resp.json();
    if (resp.ok && data.creado) {
      showResult("resultado-factura", data, true);
    } else {
      showResult("resultado-factura", data, false);
    }
  } catch (err) {
    showResult("resultado-factura", { error: err.message, ok: false }, false);
  } finally {
    btn.textContent = textoOriginal;
    btn.disabled = false;
  }
}

async function consultarComprobante() {
  const clave = document.getElementById("c_claveacceso").value.trim();
  if (!clave) { alert("Ingresa una clave de acceso"); return; }
  try {
    const resp = await fetch(API_BASE + "/api/proxy/comprobante/consulta/" + encodeURIComponent(clave));
    const data = await resp.json();
    const ok = resp.ok && (data.autorizado || data.creado);
    showResult("resultado-consulta", data, ok);
  } catch (err) {
    showResult("resultado-consulta", { error: err.message, ok: false }, false);
  }
}

async function cargarEjemplo() {
  document.getElementById("f_emisor_ruc").value = "1792345678001";
  document.getElementById("f_emisor_razon_social").value = "MI EMPRESA S.A.";
  document.getElementById("f_emisor_nombre_comercial").value = "EMPRESA PRUEBA";
  document.getElementById("f_emisor_cod_est").value = "003";
  document.getElementById("f_emisor_cod_punto").value = "003";
  document.getElementById("f_emisor_secuencial").value = "000002001";
  document.getElementById("f_emisor_fecha").value = getFechaEcuador();
  document.getElementById("f_emisor_dir_matriz").value = "QUITO - ECUADOR";
  document.getElementById("f_emisor_dir_est").value = "QUITO - ECUADOR";
  document.getElementById("f_emisor_obligado").value = "SI";
  document.getElementById("f_comprador_identificacion").value = "9999999999999";
  document.getElementById("f_comprador_tipo_ident").value = "07";
  document.getElementById("f_comprador_razon_social").value = "CONSUMIDOR FINAL";
  document.getElementById("f_comprador_direccion").value = "QUITO";
  document.getElementById("f_comprador_correo").value = "cliente@ejemplo.com";
  document.getElementById("f_item_codigo").value = "PROD001";
  document.getElementById("f_item_descripcion").value = "Producto de prueba";
  document.getElementById("f_item_cantidad").value = "1";
  document.getElementById("f_item_precio").value = "10";
  document.getElementById("f_item_descuento").value = "0";
  document.getElementById("f_item_tipo_iva").value = "2";
  document.getElementById("f_item_tipo_producto").value = "1";
  document.getElementById("resultado-factura").classList.remove("show");
}

verificarEstado();
setInterval(verificarEstado, 30000);

