/**
 * =========================================================================
app.listen(PORT, () => {\n  console.log('========================================================================');\n  console.log('  Servidor Invoka API Proxy: http://localhost:' + PORT);\n  console.log('  Interfaz de prueba:        http://localhost:' + PORT + '/');\n  console.log('  API Key configurada:       ' + (API_KEY ? 'SÃƒÂ­' : 'NO (configura .env)'));\n  console.log('========================================================================');\n});\n\nmodule.exports = app;
 *  SERVIDOR INVOKA API - Ventana de prueba de emisiÃ³n de facturas
 * =========================================================================
app.listen(PORT, () => {\n  console.log('========================================================================');\n  console.log('  Servidor Invoka API Proxy: http://localhost:' + PORT);\n  console.log('  Interfaz de prueba:        http://localhost:' + PORT + '/');\n  console.log('  API Key configurada:       ' + (API_KEY ? 'SÃƒÂ­' : 'NO (configura .env)'));\n  console.log('========================================================================');\n});\n\nmodule.exports = app;
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const InvokaClient = require('./invoka-client');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.INVOKA_API_KEY || '';
const BASE_URL = process.env.INVOKA_BASE_URL || 'https://www.invoka.com.ec/api';

if (!API_KEY) {
  console.warn('âš ï¸  ADVERTENCIA: INVOKA_API_KEY no estÃ¡ definida en .env');
  console.warn('     Copia .env.example a .env y configura tu clave de API.');
}

const client = new InvokaClient({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  debug: process.env.DEBUG === 'true',
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'invoka-proxy', timestamp: new Date().toISOString() });
});

app.post('/api/proxy/ping', async (req, res) => {
  try { res.json(await client.ping()); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/saldo', async (req, res) => {
  try { res.json(await client.obtenerSaldo()); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/empresa/crear', async (req, res) => {
  try { res.json(await client.crearEmpresa(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.put('/api/proxy/empresa/editar', async (req, res) => {
  try { res.json(await client.editarEmpresa(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/factura/emision', async (req, res) => {
  try { res.json(await client.emitirFactura(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/credito/emision', async (req, res) => {
  try { res.json(await client.emitirNotaCredito(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/debito/emision', async (req, res) => {
  try { res.json(await client.emitirNotaDebito(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/guia/emision', async (req, res) => {
  try { res.json(await client.emitirGuiaRemision(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/retencionats/emision', async (req, res) => {
  try { res.json(await client.emitirRetencionATS(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/retencion/emision', async (req, res) => {
  try { res.json(await client.emitirRetencionV1(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/liquidacion/emision', async (req, res) => {
  try { res.json(await client.emitirLiquidacion(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});
app.get('/api/proxy/comprobante/consulta/:claveacceso', async (req, res) => {
  try { res.json(await client.consultarComprobante(req.params.claveacceso)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/comprobante/consulta', async (req, res) => {
  try { res.json(await client.consultarComprobantePorBody(req.body.claveacceso)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/comprobante/xml/:claveacceso', async (req, res) => {
  try {
    const data = await client.descargarXML(req.params.claveacceso);
    if (data._buffer) { res.set('Content-Type', data._contentType || 'application/xml'); res.send(data._buffer); }
    else { res.json(data); }
  } catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/comprobante/pdf/:claveacceso', async (req, res) => {
  try {
    const data = await client.descargarPDF(req.params.claveacceso);
    if (data._buffer) { res.set('Content-Type', data._contentType || 'application/pdf'); res.send(data._buffer); }
    else { res.json(data); }
  } catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/comprobante/reprocesar', async (req, res) => {
  try { res.json(await client.reprocesarComprobante(req.body.claveacceso)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/comprobante/corregir', async (req, res) => {
  try { res.json(await client.corregirComprobante(req.body.claveacceso, req.body.datos)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/webhook', async (req, res) => {
  try { res.json(await client.obtenerWebhook()); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/webhook', async (req, res) => {
  try { res.json(await client.configurarWebhook(req.body)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.delete('/api/proxy/webhook', async (req, res) => {
  try { res.json(await client.eliminarWebhook()); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.post('/api/proxy/webhook/probar', async (req, res) => {
  try { res.json(await client.probarWebhook()); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/sri/ruc/:ruc', async (req, res) => {
  try { res.json(await client.consultarRUC(req.params.ruc)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/sri/cedula/:cedula', async (req, res) => {
  try { res.json(await client.consultarCedula(req.params.cedula)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/sri/consulta/:identificacion', async (req, res) => {
  try { res.json(await client.consultarIdentificacion(req.params.identificacion)); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});

app.get('/api/proxy/sri/razon-social/:texto', async (req, res) => {
  try { res.json(await client.buscarRazonSocial(req.params.texto, parseInt(req.query.limite || '20', 10))); }
  catch (err) { res.status(err.status || 500).json({ ok: false, error: err.message, response: err.response }); }
});
app.listen(PORT, () => {
  console.log('========================================================================');
  console.log('  Servidor Invoka API Proxy: http://localhost:' + PORT);
  console.log('  Interfaz de prueba:        http://localhost:' + PORT + '/');
  console.log('  API Key configurada:       ' + (API_KEY ? 'SI' : 'NO (configura .env)'));
  console.log('========================================================================');
});

module.exports = app;
