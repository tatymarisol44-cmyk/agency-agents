/**
 * =========================================================================
 *  CLIENTE DE LA API DE INVOKA (1.0.0)
 *  Facturación electrónica para Ecuador (SRI)
 * =========================================================================
 */
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

class InvokaClient {
  constructor({ apiKey, baseUrl = 'https://www.invoka.com.ec/api', timeout = 30000, debug = false } = {}) {
    if (!apiKey) {
      throw new Error('InvokaClient: se requiere apiKey (X-API-KEY). Panel → Perfil.');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeout = timeout;
    this.debug = debug;
  }

  async _request(method, path, body = null, formData = null, extraHeaders = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = { 'X-API-KEY': this.apiKey, ...extraHeaders };
    let fetchOptions = { method, headers, timeout: this.timeout };

    if (formData) {
      const form = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (key === 'firma_file' || key === 'logo_file') {
          if (Buffer.isBuffer(value)) {
            form.append(key, value, { filename: 'archivo.bin' });
          } else if (typeof value === 'string' && fs.existsSync(value)) {
            form.append(key, fs.createReadStream(value), { filename: value.split(/[\\/]/).pop() });
          } else {
            form.append(key, value);
          }
        } else {
          form.append(key, value);
        }
      }
      fetchOptions.body = form;
      delete headers['Content-Type'];
      fetchOptions.headers = headers;
    } else if (body !== null) {
      fetchOptions.body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      fetchOptions.headers = headers;
    }

    if (this.debug) {
      console.log(`[Invoka] ${method} ${path}`);
      if (body) console.log('[Invoka] Body:', JSON.stringify(body, null, 2).slice(0, 1000));
    }

    try {
      const response = await fetch(url, fetchOptions);
      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('application/pdf')) {
        const buffer = await response.buffer();
        data = { _buffer: buffer, _contentType: contentType };
      } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
        data = await response.text();
      } else {
        data = await response.text();
      }

      if (this.debug) {
        const preview = typeof data === 'object' ? JSON.stringify(data).slice(0, 500) : String(data).slice(0, 500);
        console.log(`[Invoka] Response ${response.status}:`, preview);
      }

      if (!response.ok) {
        const error = new Error(`Invoka API error ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = data;
        throw error;
      }
      return data;
    } catch (err) {
      if (this.debug) console.error('[Invoka] Request failed:', err.message);
      throw err;
    }
  }
  /* ==================================================================== */
  /*  1. CONECTIVIDAD                                                     */
  /* ==================================================================== */

  async ping() {
    return this._request('POST', '/ping');
  }

  async obtenerSaldo() {
    return this._request('GET', '/creditos/saldo');
  }

  /* ==================================================================== */
  /*  2. EMPRESAS                                                         */
  /* ==================================================================== */

  async crearEmpresa(data) {
    return this._request('POST', '/empresa/crear', data);
  }

  async editarEmpresa(data) {
    return this._request('PUT', '/empresa/editar', data);
  }

  async subirFirma(archivo, password, ruc) {
    return this._request('POST', '/empresa/subirfirma', null, {
      firma_file: archivo, password, ruc,
    });
  }

  async subirLogo(archivo, ruc) {
    return this._request('POST', '/empresa/subirlogo', null, {
      logo_file: archivo, ruc,
    });
  }

  /* ==================================================================== */
  /*  3. FACTURAS (código 01)                                             */
  /* ==================================================================== */

  async emitirFactura(factura) {
    return this._request('POST', '/factura/emision', factura);
  }

  /* ==================================================================== */
  /*  4. NOTAS DE CRÉDITO (código 04)                                     */
  /* ==================================================================== */

  async emitirNotaCredito(notaCredito) {
    return this._request('POST', '/credito/emision', notaCredito);
  }

  /* ==================================================================== */
  /*  5. NOTAS DE DÉBITO (código 05)                                      */
  /* ==================================================================== */

  async emitirNotaDebito(notaDebito) {
    return this._request('POST', '/debito/emision', notaDebito);
  }

  /* ==================================================================== */
  /*  6. GUÍAS DE REMESIÓN (código 06)                                    */
  /* ==================================================================== */

  async emitirGuiaRemision(guia) {
    return this._request('POST', '/guia/emision', guia);
  }

  /* ==================================================================== */
  /*  7. COMPROBANTES DE RETENCIÓN                                        */
  /* ==================================================================== */

  async emitirRetencionATS(retencion) {
    return this._request('POST', '/retencionats/emision', retencion);
  }

  async emitirRetencionV1(retencion) {
    return this._request('POST', '/retencion/emision', retencion);
  }

  /* ==================================================================== */
  /*  8. LIQUIDACIONES DE COMPRA (código 03)                              */
  /* ==================================================================== */

  async emitirLiquidacion(liquidacion) {
    return this._request('POST', '/liquidacion/emision', liquidacion);
  }
  /* ==================================================================== */
  /*  9. CONSULTA DE COMPROBANTES                                         */
  /* ==================================================================== */

  async consultarComprobante(claveAcceso) {
    return this._request('GET', `/comprobante/consulta/${encodeURIComponent(claveAcceso)}`);
  }

  async consultarComprobantePorBody(claveAcceso) {
    return this._request('POST', '/comprobante/consulta', { claveacceso: claveAcceso });
  }

  async descargarXML(claveAcceso) {
    return this._request('GET', `/comprobante/xml/${encodeURIComponent(claveAcceso)}`);
  }

  async descargarPDF(claveAcceso) {
    return this._request('GET', `/comprobante/pdf/${encodeURIComponent(claveAcceso)}`);
  }

  async reprocesarComprobante(claveAcceso) {
    return this._request('POST', '/comprobante/reprocesar', { claveacceso: claveAcceso });
  }

  async corregirComprobante(claveAcceso, datos) {
    return this._request('POST', '/comprobante/corregir', { claveacceso: claveAcceso, datos });
  }

  /* ==================================================================== */
  /*  10. WEBHOOKS                                                        */
  /* ==================================================================== */

  async obtenerWebhook() {
    return this._request('GET', '/webhook');
  }

  async configurarWebhook(config) {
    return this._request('POST', '/webhook', config);
  }

  async eliminarWebhook() {
    return this._request('DELETE', '/webhook');
  }

  async probarWebhook() {
    return this._request('POST', '/webhook/probar', {});
  }

  /* ==================================================================== */
  /*  11. CRÉDITOS                                                        */
  /* ==================================================================== */

  async obtenerHistorialCreditos(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return this._request('GET', `/creditos/historial?${params}`);
  }

  /* ==================================================================== */
  /*  12. CONSULTAS SRI / REGISTRO CIVIL                                  */
  /* ==================================================================== */

  async consultarRUC(ruc) {
    return this._request('GET', `/sri/ruc/${encodeURIComponent(ruc)}`);
  }

  async consultarEstablecimientos(ruc) {
    return this._request('GET', `/sri/ruc/${encodeURIComponent(ruc)}/establecimientos`);
  }

  async consultarCedula(cedula) {
    return this._request('GET', `/sri/cedula/${encodeURIComponent(cedula)}`);
  }

  async consultarIdentificacion(identificacion) {
    return this._request('GET', `/sri/consulta/${encodeURIComponent(identificacion)}`);
  }

  async buscarRazonSocial(texto, limite = 20) {
    return this._request('GET', `/sri/razon-social/${encodeURIComponent(texto)}?limite=${limite}`);
  }

  /* ==================================================================== */
  /*  13. ESTADO PÚBLICO / PRECIOS                                        */
  /* ==================================================================== */

  async obtenerEstadoServicios() {
    return this._request('GET', '/status');
  }

  async obtenerPreciosCreditos() {
    return this._request('GET', '/public/pricing/tiers');
  }

  async calcularCreditos(amount) {
    return this._request('GET', `/public/pricing/calculate?amount=${encodeURIComponent(amount)}`);
  }
}

module.exports = InvokaClient;